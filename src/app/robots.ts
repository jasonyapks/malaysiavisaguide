import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * SPEC.md §4.4 — AI crawlers are allowed on purpose. Being cited by assistants
 * is a primary goal of this site, not a side effect to be defended against.
 */
// Required by `output: "export"` — robots.txt is emitted at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: "/",
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
