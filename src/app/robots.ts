import type { MetadataRoute } from "next";
import { robots as buildRobots } from "@/lib/sitemap-entries";

// Required by `output: "export"` — robots.txt is emitted at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return buildRobots();
}
