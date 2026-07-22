import type { MetadataRoute } from "next";
import { routes, site } from "@/lib/site";

/** Generated from the route table in src/lib/site.ts — SPEC.md §4.4. */
// Required by `output: "export"` — the sitemap is emitted at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: r.path === "/" ? 1 : 0.8,
  }));
}
