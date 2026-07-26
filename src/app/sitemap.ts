import type { MetadataRoute } from "next";
import {
  categoryPath as insightCategoryPath,
  insightPath,
  liveCategories,
  published,
} from "@/lib/data/insights";
import { categoryPath, getCategoryIndex, getNewsIndex } from "@/lib/news";
import { routes, site } from "@/lib/site";

/** Generated from the route table in src/lib/site.ts — SPEC.md §4.4. */
// Required by `output: "export"` — the sitemap is emitted at build time.
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: r.path === "/" ? 1 : 0.8,
  }));

  // Each article carries its own real lastModified, not the build time — a news
  // page whose date moves on every deploy teaches a crawler to ignore the date.
  const articles = await getNewsIndex();
  const news: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${site.url}/news/${a.slug}/`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt ?? Date.now()),
    // Once written, an article is finished. Only a correction changes it.
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Category indexes. Each one's lastModified is its newest story's, so the
  // date says something true — a category only changes when a story lands in
  // it, and stamping the build time here would teach a crawler to ignore the
  // date on every page in the sitemap, articles included.
  const categories = await getCategoryIndex();
  const categoryPages: MetadataRoute.Sitemap = categories.map(
    ({ category, articles }) => ({
      url: `${site.url}${categoryPath(category)}`,
      lastModified: new Date(
        Math.max(
          ...articles.map((a) =>
            new Date(a.updatedAt ?? a.publishedAt ?? 0).getTime(),
          ),
          0,
        ),
      ),
      changeFrequency: "weekly",
      // Above an article, below the guides: it is an index, and it is the page
      // that should rank for "<programme> news".
      priority: 0.7,
    }),
  );

  // Authored articles. Priority above a news story and below a programme guide:
  // evergreen and meant to be cited, but the guides are still the reference.
  // Drafts are excluded by `published()`, which is the whole point of the flag.
  const articles2 = published();
  const insightPages: MetadataRoute.Sitemap = articles2.map((a) => ({
    url: `${site.url}${insightPath(a)}`,
    lastModified: new Date(a.reviewed),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const insightCategories: MetadataRoute.Sitemap = liveCategories().map(
    ({ category, articles }) => ({
      url: `${site.url}${insightCategoryPath(category)}`,
      // The newest article's review date, for the same reason the news category
      // pages use theirs: a date that moves on every deploy teaches a crawler
      // to ignore every date in the sitemap.
      lastModified: new Date(
        Math.max(...articles.map((a) => new Date(a.reviewed).getTime()), 0),
      ),
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return [
    ...pages,
    ...categoryPages,
    ...news,
    ...insightCategories,
    ...insightPages,
  ];
}
