import type { Metadata } from "next";
import Link from "next/link";
import { CategoryStrip } from "@/components/CategoryStrip";
import { GuideHead } from "@/components/GuideHead";
import { NewsCard, NewsLeadCard } from "@/components/NewsCard";
import { localeUrl, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import {
  CATEGORY_GUIDE,
  categoryPath,
  categoryTitle,
  type NewsArticle,
  type NewsCategory,
} from "@/lib/news";
import { site } from "@/lib/site";
import { getUi } from "@/lib/ui";

/**
 * One index per news category — /news/category/<category>/. One component,
 * three hostnames.
 *
 * The point is browsing: /news is a single reverse-chronological feed, and a
 * reader who cares about Sarawak MM2H should not have to read past PVIP and
 * Employment Pass stories to find the three that concern them.
 *
 * It earns its place for crawlers too. Every category page is a real internal
 * link hub — it points at every story in the category and at the programme
 * guide, which is exactly the shape a topic cluster wants, and it gives each
 * programme a news URL that can rank for "<programme> news" without competing
 * with the guide for "<programme>".
 *
 * The route lives under /news/category/ rather than at /news/<category>/
 * because the latter is the same shape as /news/<slug>/ — a story whose slug
 * happened to be "mm2h" and the MM2H category would be the same URL.
 *
 * A category exists per locale, not sitewide: the Chinese tree carries a
 * category index only once a story in that category has been translated, which
 * is the same non-empty rule the English one follows.
 */

export interface CategoryPage {
  category: NewsCategory;
  articles: NewsArticle[];
}

export function newsCategoryMetadata(
  category: NewsCategory,
  locale: Locale,
): Metadata {
  const copy = getUi(locale).news;
  const title = categoryTitle(category, locale);
  const description = copy.categoryBlurb[category];

  return {
    ...pageMetadata({
      canonicalPath: categoryPath(category),
      locale,
      title,
      description,
    }),
    openGraph: {
      type: "website",
      title: `${title} — ${site.name}`,
      description,
      url: localeUrl(categoryPath(category), locale),
    },
  };
}

export function NewsCategoryIndex({
  found,
  categories,
  locale,
}: {
  found: CategoryPage;
  categories: CategoryPage[];
  locale: Locale;
}) {
  const copy = getUi(locale).news;
  const label = copy.categoryLabel[found.category];
  const heading = categoryTitle(found.category, locale);
  const guide = CATEGORY_GUIDE[found.category];
  const [lead, ...rest] = found.articles;

  return (
    <div className="space-y-12">
      <ListSchema
        category={found.category}
        articles={found.articles}
        locale={locale}
      />

      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <Link href="/news/" className="text-forest-700 underline">
          {copy.article.breadcrumbNews}
        </Link>
        <span aria-hidden> › </span>
        <span>{label}</span>
      </nav>

      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{heading}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.categoryBlurb[found.category]}
        </p>
        <p className="text-body-sm text-ink-muted">
          {found.articles.length === 1
            ? copy.category.oneStory
            : copy.category.manyStories(found.articles.length)}{" "}
          {copy.category.reviewedNote}
        </p>
      </header>

      <CategoryStrip
        categories={categories}
        current={found.category}
        locale={locale}
      />

      <NewsLeadCard article={lead} showCategory={false} locale={locale} />

      {rest.length > 0 && (
        <section className="space-y-8">
          <GuideHead
            eyebrow={copy.category.moreOn(label)}
            title={
              <>
                {copy.category.moreTitle}{" "}
                <span className="font-display accent-text font-medium italic">
                  {copy.category.moreTitleAccent}
                </span>
              </>
            }
          />
          <ul className="space-y-6">
            {rest.map((a) => (
              <li key={a.slug}>
                {/* Chip suppressed: every card here is already this category. */}
                <NewsCard article={a} showCategory={false} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The handoff. News answers what changed; the guide answers what to do
          about it, and that is the page this reader actually wants next. */}
      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {guide ? copy.category.footerBefore : copy.index.footerBefore}
        <Link
          href={guide ? guide.path : "/compare/"}
          className="font-semibold underline"
        >
          {guide ? copy.guideTitle[found.category] : copy.guidesTitle}
        </Link>
        {guide ? copy.category.footerBetween : copy.index.footerBetween}
        <Link href="/tools/eligibility/" className="font-semibold underline">
          {copy.eligibilityLink}
        </Link>
        {guide ? copy.category.footerAfter : copy.index.footerAfter}
      </p>
    </div>
  );
}

/** Tells a crawler this is an index and hands it the ordered set of article URLs. */
function ListSchema({
  category,
  articles,
  locale,
}: {
  category: NewsCategory;
  articles: NewsArticle[];
  locale: Locale;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryTitle(category, locale),
    itemListElement: articles.map((a, i) => ({
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
