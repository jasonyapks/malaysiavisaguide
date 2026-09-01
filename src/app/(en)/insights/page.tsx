import type { Metadata } from "next";
import {
  InsightsIndex,
  insightsIndexMetadata,
} from "@/content/insights/InsightsIndex";
import { liveInsightCategories, publishedInsights } from "@/lib/insights";

/**
 * /insights/ on the apex. The page itself is `@/content/insights/InsightsIndex`.
 */

export const metadata: Metadata = insightsIndexMetadata("en");

export default async function Page() {
  const [articles, categories] = await Promise.all([
    publishedInsights("en"),
    liveInsightCategories("en"),
  ]);

  return (
    <InsightsIndex locale="en" articles={articles} categories={categories} />
  );
}
