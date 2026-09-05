import type { Metadata } from "next";
import {
  InsightsCategory,
  insightsCategoryMetadata,
} from "@/content/insights/InsightsCategory";
import { type InsightCategory } from "@/lib/data/insights";
import {
  cmsOnlyCategories,
  insightsByCategory,
  liveInsightCategories,
} from "@/lib/insights";

/**
 * /insights/<category>/ for every category that has no literal folder.
 *
 * Inert until `next.config.ts` adds `cmsindex.tsx` to `pageExtensions`, which it
 * does only when a category with a published article has no literal folder. See
 * the note at the top of [slug]/page.cms.tsx, and next.config.ts, for why the
 * routes are switchable at all.
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
  const categories = await cmsOnlyCategories("en");

  // Same trap as the article route, same preemption: `output: "export"` refuses
  // a dynamic route with zero paths and blames a missing generateStaticParams.
  // The extension gate keeps this route off until a category needs it, so this
  // should be unreachable — it stays because "should be" is not a guarantee and
  // Next's own message costs an hour to diagnose.
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
  return insightsCategoryMetadata(c, "en");
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = category as InsightCategory;
  const [articles, categories] = await Promise.all([
    insightsByCategory(c, "en"),
    liveInsightCategories("en"),
  ]);

  return (
    <InsightsCategory
      category={c}
      articles={articles}
      categories={categories}
      locale="en"
    />
  );
}
