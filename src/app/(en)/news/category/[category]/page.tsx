import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  NewsCategoryIndex,
  newsCategoryMetadata,
} from "@/content/news/NewsCategory";
import { getCategoryIndex } from "@/lib/news";

/**
 * /news/category/<category>/ on the apex. The page itself is
 * `@/content/news/NewsCategory`.
 */

// Every category is known at build time; a static export cannot render one on
// demand. Anything else under this segment is a 404, which is what we want:
// there is no such thing as a category we did not generate.
export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategoryIndex("en");

  // Same failure mode as /news/[slug] — under `output: "export"` a dynamic
  // route yielding zero paths fails the build with a message that blames a
  // missing generateStaticParams, which is not what has gone wrong.
  if (categories.length === 0) {
    throw new Error(
      "No published news articles, so /news/category/[category] has no pages to " +
        "generate — and a static export cannot build a dynamic route with zero " +
        "paths.\n\nPublish at least one article and rebuild; see the same note in " +
        "src/app/(en)/news/[slug]/page.tsx.",
    );
  }

  return categories.map(({ category }) => ({ category }));
}

/** The categories that have a page, as a lookup. */
async function findCategory(category: string) {
  const categories = await getCategoryIndex("en");
  return categories.find((c) => c.category === category) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const found = await findCategory(category);
  return found ? newsCategoryMetadata(found.category, "en") : {};
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const found = await findCategory(category);
  if (!found) notFound();

  return (
    <NewsCategoryIndex
      found={found}
      categories={await getCategoryIndex("en")}
      locale="en"
    />
  );
}
