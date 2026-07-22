import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static export — see SPEC.md §4.2. Real HTML for search engines and
  // AI crawlers, no JS shell. Build output lands in ./out.
  output: "export",
  // SPEC.md §3 routes are written with trailing slashes (/visas/pvip/).
  trailingSlash: true,
  // No image optimisation server exists in a static export.
  images: { unoptimized: true },
};

export default nextConfig;
