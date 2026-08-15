import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/sitemap-entries";

/**
 * The zh-hans host's sitemap — its own URLs only.
 *
 * A literal segment, not `[locale]`, because Next calls a sitemap handler with
 * **no arguments** (`const data = await handler()` in
 * next-metadata-route-loader) — so a sitemap inside a dynamic segment has no
 * way to learn which locale it is. Route handlers need no layout, so a literal
 * folder here costs nothing and does not shadow the `[locale]` pages.
 */
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries("zh-hans");
}
