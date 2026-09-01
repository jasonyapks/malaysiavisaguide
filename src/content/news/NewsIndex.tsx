import type { Metadata } from "next";
import Link from "next/link";
import { CategoryStrip } from "@/components/CategoryStrip";
import { GuideHead } from "@/components/GuideHead";
import { NewsCard, NewsLeadCard } from "@/components/NewsCard";
import { localeUrl, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { NewsArticle, NewsCategory } from "@/lib/news";
import { getUi } from "@/lib/ui";

/**
 * The blog index — SPEC.md §3. One component, three hostnames.
 *
 * Prerendered from the content tree at build time. It used to hydrate this list
 * client-side, which meant the response a crawler received contained no
 * headlines at all: the page could not rank, and neither could the stories on
 * it, because there was nothing linking to them. Now every card is real HTML and
 * every card is a link to a page of our own.
 *
 * The route files under `(en)/` and `[locale]/` are thin wrappers around this,
 * the same shape `VisaGuide` already has. Two copies of a page this long would
 * drift, and the drift would be a Chinese index quietly missing whatever was
 * added to the English one.
 */

export function newsIndexMetadata(locale: Locale): Metadata {
  const copy = getUi(locale).news.index;
  return pageMetadata({
    canonicalPath: "/news/",
    locale,
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

export function NewsIndex({
  locale,
  items,
  categories,
}: {
  locale: Locale;
  items: NewsArticle[];
  categories: { category: NewsCategory; articles: NewsArticle[] }[];
}) {
  const copy = getUi(locale).news;
  const [lead, ...rest] = items;

  return (
    <div className="space-y-12">
      {items.length > 0 && <ListSchema items={items} locale={locale} />}

      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{copy.index.h1}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.index.lead}
        </p>
      </header>

      <CategoryStrip categories={categories} locale={locale} />

      {items.length === 0 ? (
        <p className="rounded-xl border border-sand-200 bg-sand-50 px-5 py-6 text-ink-muted">
          {copy.index.empty}
        </p>
      ) : (
        <>
          <NewsLeadCard article={lead} locale={locale} />

          {rest.length > 0 && (
            <section className="space-y-8">
              <GuideHead
                eyebrow={copy.index.moreEyebrow}
                title={
                  <>
                    {copy.index.moreTitle}{" "}
                    <span className="font-display accent-text font-medium italic">
                      {copy.index.moreTitleAccent}
                    </span>
                  </>
                }
              />
              <ul className="space-y-6">
                {rest.map((a) => (
                  <li key={a.slug}>
                    <NewsCard article={a} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {copy.index.footerBefore}
        <Link href="/compare/" className="font-semibold underline">
          {copy.guidesTitle}
        </Link>
        {copy.index.footerBetween}
        <Link href="/tools/eligibility/" className="font-semibold underline">
          {copy.eligibilityLink}
        </Link>
        {copy.index.footerAfter}
      </p>
    </div>
  );
}

/**
 * ItemList of the stories on this page. It tells a crawler that /news is an
 * index and gives it the ordered set of article URLs, which is how a new story
 * gets discovered from here rather than waiting on the sitemap.
 *
 * The URLs are absolute and locale-aware: a schema block on the Chinese host
 * that listed apex URLs would be handing a crawler the English article as the
 * item this page lists, which is the opposite of what hreflang is telling it.
 */
function ListSchema({
  items,
  locale,
}: {
  items: NewsArticle[];
  locale: Locale;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: getUi(locale).news.index.metaTitle,
    itemListElement: items.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: localeUrl(`/news/${a.slug}/`, locale),
      name: a.headline,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
