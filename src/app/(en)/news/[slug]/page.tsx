import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsStory, newsStoryMetadata } from "@/content/news/NewsStory";
import { getArticle, getNewsIndex } from "@/lib/news";

/**
 * /news/<slug>/ on the apex. The page itself is `@/content/news/NewsStory`.
 */

// Every slug is known at build time. Without this, a request for an unknown
// slug would try to render on demand — which a static export cannot do.
export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await getNewsIndex("en");

  // Next refuses to build a dynamic route that yields zero paths under
  // `output: "export"`, and says only that generateStaticParams is "missing",
  // which sends you looking for a bug in this file. It is not a bug in this
  // file: there is simply nothing published yet. Say so.
  if (items.length === 0) {
    throw new Error(
      "No published news articles, so /news/[slug] has no pages to generate — " +
        "and a static export cannot build a dynamic route with zero paths.\n\n" +
        "Publish at least one article: open the dashboard, pick an item from the " +
        "pending queue and press “Write article & publish”, then rebuild.",
    );
  }

  return items.map((it) => ({ slug: it.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug, "en");
  return article ? newsStoryMetadata(article, "en") : {};
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug, "en");
  if (!article) notFound();

  return <NewsStory article={article} locale="en" />;
}
