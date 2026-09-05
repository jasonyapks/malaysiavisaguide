import type { Metadata } from "next";
import Link from "next/link";
import { InsightCard, InsightStrip } from "@/components/InsightLayout";
import {
  categoryPath,
  insightPath,
  type Insight,
  type InsightCategory,
} from "@/lib/data/insights";
import { localeUrl, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { getUi } from "@/lib/ui";

/**
 * /insights/<category>/ — one component behind three different route files.
 *
 * In English the route reaching it is either the literal `comparisons` folder
 * or the dynamic `[category]` one, depending on the category; on the Chinese
 * hosts it is always the dynamic one, because the translated trees have no
 * literal folders. All three render the same page, which is the point: the two
 * English routes used to be two copies of this markup, and a category index
 * that looked different depending on how it was routed was a bug waiting to be
 * noticed by a reader rather than by a build.
 */

export function insightsCategoryMetadata(
  category: InsightCategory,
  locale: Locale,
): Metadata {
  const copy = getUi(locale).insights;
  const title = copy.categoryTitle[category];
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

export function InsightsCategory({
  category,
  articles,
  categories,
  locale,
}: {
  category: InsightCategory;
  articles: Insight[];
  categories: { category: InsightCategory; articles: Insight[] }[];
  locale: Locale;
}) {
  const copy = getUi(locale).insights;

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: copy.categoryTitle[category],
            itemListElement: articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: localeUrl(insightPath(a), locale),
              name: a.title,
            })),
          }),
        }}
      />

      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <Link href="/insights/" className="text-forest-700 underline">
          {copy.article.breadcrumb}
        </Link>
        <span aria-hidden> › </span>
        {/* The short label, not the page's own h1. The two English routes
            disagreed about this — the literal `comparisons` folder said
            "Comparisons" and the dynamic one said "Comparisons and decision
            guides" — and a breadcrumb is a place marker, not a title. */}
        <span>{copy.categoryLabel[category]}</span>
      </nav>

      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{copy.categoryTitle[category]}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.categoryBlurb[category]}
        </p>
        <p className="text-body-sm text-ink-muted">
          {articles.length === 1
            ? copy.category.oneArticle
            : copy.category.manyArticles(articles.length)}{" "}
          {copy.category.tracedNote}
        </p>
      </header>

      <InsightStrip
        categories={categories}
        current={category}
        locale={locale}
      />

      <ul className="space-y-6">
        {articles.map((a) => (
          <li key={a.slug}>
            <InsightCard article={a} showCategory={false} locale={locale} />
          </li>
        ))}
      </ul>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {copy.category.footerBefore}
        <Link href="/compare/" className="font-semibold underline">
          {copy.category.compareLink}
        </Link>
        {copy.category.footerBetween}
        <Link href="/tools/cost-calculator/" className="font-semibold underline">
          {copy.category.calculatorLink}
        </Link>
        {copy.category.footerAfter}
      </p>
    </div>
  );
}
