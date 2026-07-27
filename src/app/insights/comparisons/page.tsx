import type { Metadata } from "next";
import Link from "next/link";
import { InsightCard, InsightStrip } from "@/components/InsightLayout";
import {
  byCategory,
  CATEGORY_BLURB,
  CATEGORY_TITLE,
  categoryPath,
  insightPath,
  liveCategories,
} from "@/lib/data/insights";
import { site } from "@/lib/site";

/**
 * /insights/comparisons/ — the category index.
 *
 * One of these exists per category that has articles in it. It is a literal
 * folder rather than a [category] segment because the articles below it are
 * literal folders too, and a dynamic segment at this level would never match
 * them. See the header of src/lib/data/insights.ts.
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

export default function Page() {
  const articles = byCategory(CATEGORY);

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

      <InsightStrip categories={liveCategories()} current={CATEGORY} />

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
