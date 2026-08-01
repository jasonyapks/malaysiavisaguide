import type { Metadata } from "next";
import Link from "next/link";
import { InsightCard, InsightStrip } from "@/components/InsightLayout";
import {
  CATEGORY_BLURB,
  CATEGORY_TITLE,
  categoryPath,
  insightPath,
  type InsightCategory,
} from "@/lib/data/insights";
import {
  cmsOnlyCategories,
  insightsByCategory,
  liveInsightCategories,
} from "@/lib/insights";
import { site } from "@/lib/site";

/**
 * /insights/<category>/ for every category that has no literal folder.
 *
 * The source for `src/app/insights/[category]/page.tsx`; see the long note at
 * the top of src/lib/insight-routes/article.tsx for why the route is copied
 * into place rather than committed.
 *
 * `comparisons` is deliberately NOT generated here — it has a literal index at
 * src/app/insights/comparisons/page.tsx, which wins, and which renders the same
 * merged list this file does. Excluding it is not a workaround for the
 * collision: it is the correct answer, because that page exists on purpose. The
 * exclusion that IS a safety net is the one on article slugs, and that one
 * throws (src/lib/insights.ts).
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await cmsOnlyCategories();

  // Same trap as the article route, same preemption: `output: "export"` refuses
  // a dynamic route with zero paths and blames a missing generateStaticParams.
  // sync-insight-routes.mjs does not place this route until at least one
  // category needs it, so this should be unreachable.
  if (categories.length === 0) {
    throw new Error(
      "Every category with a published article already has a literal index page, " +
        "so /insights/[category] has no pages to generate — and a static export " +
        "cannot build a dynamic route with zero paths.\n\n" +
        "This route exists for categories the CMS opens up that the repo has no " +
        "folder for. Publish an article outside `comparisons`, or remove " +
        "src/app/insights/[category]/page.tsx.",
    );
  }

  return categories.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = category as InsightCategory;
  const title = CATEGORY_TITLE[c];
  if (!title) return {};

  return {
    title,
    description: CATEGORY_BLURB[c],
    alternates: { canonical: categoryPath(c) },
    openGraph: {
      type: "website",
      title: `${title} — ${site.name}`,
      description: CATEGORY_BLURB[c],
      url: categoryPath(c),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = category as InsightCategory;
  const articles = await insightsByCategory(c);
  const categories = await liveInsightCategories();

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: CATEGORY_TITLE[c],
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
        <span>{CATEGORY_TITLE[c]}</span>
      </nav>

      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{CATEGORY_TITLE[c]}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {CATEGORY_BLURB[c]}
        </p>
        <p className="text-body-sm text-ink-muted">
          {articles.length === 1
            ? "One article so far."
            : `${articles.length} articles, newest first.`}{" "}
          Every figure is traced to an official government document and carries
          the date it was checked.
        </p>
      </header>

      <InsightStrip categories={categories} current={c} />

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
