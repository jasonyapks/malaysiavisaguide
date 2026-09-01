import type { Metadata } from "next";
import {
  InsightsCategory,
  insightsCategoryMetadata,
} from "@/content/insights/InsightsCategory";
import { insightsByCategory, liveInsightCategories } from "@/lib/insights";

/**
 * /insights/comparisons/ — the category index.
 *
 * A literal folder, because the two hand-written articles below it were literal
 * folders too. It is NOT the only way a category index gets built: every other
 * category's index comes from the [category] dynamic route, which coexists with
 * this file — see the header of src/lib/data/insights.ts. Both now render the
 * same component, so they can no longer drift the way they had (the breadcrumb
 * already had).
 */

const CATEGORY = "comparisons" as const;

export const metadata: Metadata = insightsCategoryMetadata(CATEGORY, "en");

export default async function Page() {
  const [articles, categories] = await Promise.all([
    insightsByCategory(CATEGORY, "en"),
    liveInsightCategories("en"),
  ]);

  return (
    <InsightsCategory
      category={CATEGORY}
      articles={articles}
      categories={categories}
      locale="en"
    />
  );
}
