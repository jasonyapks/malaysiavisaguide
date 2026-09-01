import type { Metadata } from "next";
import Link from "next/link";
import { GuideHead } from "@/components/GuideHead";
import { InsightCard, InsightStrip } from "@/components/InsightLayout";
import { insightPath, type Insight, type InsightCategory } from "@/lib/data/insights";
import { localeUrl, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { getUi } from "@/lib/ui";

/**
 * /insights/ — the index of Jason's own articles. One component, three
 * hostnames.
 *
 * Separate from /news/ on purpose. News is perishable and machine-fed; these
 * are evergreen, written from 500+ cases, and they are the pages meant to be
 * cited. Mixing the two in one feed would bury an article that stays true for
 * three years under a story that stops mattering in three weeks.
 */

export function insightsIndexMetadata(locale: Locale): Metadata {
  const copy = getUi(locale).insights.index;
  return {
    ...pageMetadata({
      canonicalPath: "/insights/",
      locale,
      title: copy.metaTitle,
      description: copy.metaDescription,
    }),
    openGraph: {
      type: "website",
      title: `${copy.metaTitle} — ${site.name}`,
      description: copy.metaDescription,
      url: localeUrl("/insights/", locale),
    },
  };
}

export function InsightsIndex({
  locale,
  articles,
  categories,
}: {
  locale: Locale;
  articles: Insight[];
  categories: { category: InsightCategory; articles: Insight[] }[];
}) {
  const copy = getUi(locale).insights;
  const [lead, ...rest] = articles;

  return (
    <div className="space-y-12">
      <ListSchema articles={articles} locale={locale} />

      <header className="space-y-6">
        <p className="eyebrow">{copy.index.eyebrow}</p>
        <h1 className="text-h1 font-semibold">
          {copy.index.h1}{" "}
          <span className="font-display accent-text font-medium italic">
            {copy.index.h1Accent}
          </span>
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.index.metaDescription}
        </p>
      </header>

      <InsightStrip categories={categories} locale={locale} />

      {lead ? (
        <>
          <InsightCard article={lead} locale={locale} />

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
                    <InsightCard article={a} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        /* Unreachable in English while the section has an article, and kept
           deliberately: a build that quietly rendered an empty index would ship
           a URL with a heading and nothing under it. */
        <p className="text-ink-muted">{copy.index.empty}</p>
      )}

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {copy.index.footerBefore}
        <Link href="/news/" className="font-semibold underline">
          {copy.index.newsLink}
        </Link>
        {copy.index.footerBetween}
        <Link href="/compare/" className="font-semibold underline">
          {copy.index.compareLink}
        </Link>
        {copy.index.footerAfter}
      </p>
    </div>
  );
}

function ListSchema({
  articles,
  locale,
}: {
  articles: Insight[];
  locale: Locale;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: getUi(locale).insights.index.metaTitle,
    itemListElement: articles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: localeUrl(insightPath(a), locale),
      name: a.title,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
