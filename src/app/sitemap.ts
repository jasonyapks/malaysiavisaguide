import type { MetadataRoute } from "next";
import { getNewsIndex } from "@/lib/news";
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

  return [...pages, ...news];
}
