import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/sitemap-entries";

/** The apex sitemap — English URLs only. See lib/sitemap-entries.ts for why
 *  each host gets its own file rather than one listing all three. */
// Required by `output: "export"` — the sitemap is emitted at build time.
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries("en");
}
