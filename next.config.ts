import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * The /insights/ dynamic routes are switched on by their file extension.
 *
 * `src/app/insights/[category]/[slug]/page.cms.tsx` and
 * `src/app/insights/[category]/page.cmsindex.tsx` are ordinary, committed,
 * typechecked route files — but Next only treats a file as a page if its
 * extension is in `pageExtensions`, so with the defaults they are inert. Adding
 * `cms.tsx` turns the article route on; adding `cmsindex.tsx` turns the category
 * index on. `scripts/sync-insight-routes.mjs` decides, before every build, and
 * writes the answer to .insight-routes.json.
 *
 * ## Why the routes have to be switchable at all
 *
 * Under `output: "export"` Next hard-fails any dynamic route whose
 * `generateStaticParams` yields zero paths:
 *
 *     if (config.output === 'export' && isDynamic && !hasGenerateStaticParams)
 *       throw new Error(`Page "${page}" is missing "generateStaticParams()" …`)
 *                                            — next/dist/build/index.js
 *
 * There is no flag that softens it, and the message names a function that is
 * present and returned `[]`, which sends you hunting in a file with no bug in
 * it. Phase 4 ships with **zero** CMS articles on purpose, so an always-on route
 * would mean a repo that cannot build until somebody publishes something. The
 * two routes switch independently, because an article filed under `comparisons`
 * needs the article route while its index already exists as a literal folder.
 *
 * ## Why an extension gate rather than generating the files
 *
 * The alternative is a script that copies route bodies into place and deletes
 * them again. That works, and it means the route source lives somewhere it is
 * never run from, the app/ tree changes shape between builds, and the thing you
 * review is not the thing that ships. This way the files sit at their real
 * paths, are committed, and are typechecked and linted on every run; the only
 * generated artifact is a two-boolean JSON file.
 */
const DEFAULT_PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

function insightRouteExtensions(): string[] {
  let flags: { article?: boolean; category?: boolean };
  try {
    flags = JSON.parse(
      readFileSync(path.join(process.cwd(), ".insight-routes.json"), "utf8"),
    ) as { article?: boolean; category?: boolean };
  } catch {
    // No marker file: the routes stay off. That is the right default for a
    // fresh clone, for `next dev` before prebuild has run, and for anyone
    // invoking `next build` directly — off always builds, on does not.
    return [];
  }
  return [
    ...(flags.article ? ["cms.tsx"] : []),
    ...(flags.category ? ["cmsindex.tsx"] : []),
  ];
}

const nextConfig: NextConfig = {
  // Fully static export — see SPEC.md §4.2. Real HTML for search engines and
  // AI crawlers, no JS shell. Build output lands in ./out.
  output: "export",
  // SPEC.md §3 routes are written with trailing slashes (/visas/pvip/).
  trailingSlash: true,
  // No image optimisation server exists in a static export.
  images: { unoptimized: true },
  pageExtensions: [...DEFAULT_PAGE_EXTENSIONS, ...insightRouteExtensions()],
  experimental: {
    // Turns on app/global-not-found.tsx. Needed because the app now has two
    // root layouts — (en) and [locale] — so there is no single layout for
    // app/not-found.tsx to compose a document from, and without this flag
    // out/404.html silently reverts to Next's own black default page. See the
    // header comment in src/app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
