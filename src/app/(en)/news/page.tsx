import type { Metadata } from "next";
import { NewsIndex, newsIndexMetadata } from "@/content/news/NewsIndex";
import { getCategoryIndex, getNewsIndex } from "@/lib/news";

/**
 * /news/ on the apex. The page itself is `@/content/news/NewsIndex` — the
 * Chinese hosts render the same component from `[locale]/news/`.
 */

export const metadata: Metadata = newsIndexMetadata("en");

export default async function Page() {
  const [items, categories] = await Promise.all([
    getNewsIndex("en"),
    getCategoryIndex("en"),
  ]);

  return <NewsIndex locale="en" items={items} categories={categories} />;
}
