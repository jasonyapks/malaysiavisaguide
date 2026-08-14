import type { Metadata } from "next";
import Link from "next/link";
import { InsightCard, InsightStrip } from "@/components/InsightLayout";
import {
  CATEGORY_BLURB,
  CATEGORY_TITLE,
  categoryPath,
  insightPath,
} from "@/lib/data/insights";
import { insightsByCategory, liveInsightCategories } from "@/lib/insights";
import { site } from "@/lib/site";

/**
 * /insights/comparisons/ — the category index.
 *
 * A literal folder, because the two hand-written articles below it are literal
 * folders too. It is NOT the only way a category index gets built: every other
 * category's index comes from the [category] dynamic route, which coexists with
 * this file — see the header of src/lib/data/insights.ts. Both render the same
 * merged list, so a CMS article filed under `comparisons` appears here without
 * this file changing.
 */

const CATEGORY = "comparisons" as const;

export const metadata: Metadata = {
  title: CATEGORY_TITLE[CATEGORY],
  description: CATEGORY_BLURB[CATEGORY],
  alternates: { canonical: categoryPath(CATEGORY) },
  openGraph: {
    type: "website",
    title: `${CATEGORY_TITLE[CATEGORY]} — ${site.name}`,
    description: CATEGORY_BLURB[CATEGORY],
    url: categoryPath(CATEGORY),
  },
};

export default async function Page() {
  const articles = await insightsByCategory(CATEGORY);
  const categories = await liveInsightCategories();

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: CATEGORY_TITLE[CATEGORY],
            itemListElement: articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${site.url}${insightPath(a)}`,
              name: a.title,
            })),
          }),
        }}
      />

      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <Link href="/insights/" className="text-forest-700 underline">
          Insights
        </Link>
        <span aria-hidden> › </span>
        <span>Comparisons</span>
      </nav>

      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">
          {CATEGORY_TITLE[CATEGORY]}
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {CATEGORY_BLURB[CATEGORY]}
        </p>
        <p className="text-body-sm text-ink-muted">
          {articles.length === 1
            ? "One article so far."
            : `${articles.length} articles, newest first.`}{" "}
          Every figure is traced to an official government document and carries
          the date it was checked.
        </p>
      </header>

      <InsightStrip categories={categories} current={CATEGORY} />

      <ul className="space-y-6">
        {articles.map((a) => (
          <li key={a.slug}>
            <InsightCard article={a} showCategory={false} />
          </li>
        ))}
      </ul>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        Prefer the numbers side by side without the argument? Use{" "}
        <Link href="/compare/" className="font-semibold underline">
          the comparison table
        </Link>{" "}
        or{" "}
        <Link
          href="/tools/cost-calculator/"
          className="font-semibold underline"
        >
          the cost calculator
        </Link>
        .
      </p>
    </div>
  );
}
