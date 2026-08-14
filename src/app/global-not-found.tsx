import type { Metadata } from "next";
import { RootShell, shellMetadata } from "@/components/RootShell";
import { NotFoundContent } from "@/components/NotFoundContent";
import { getUi } from "@/lib/ui";

/**
 * The 404 document for any URL that matches no route — this is what becomes
 * `out/404.html`, which is the file Cloudflare Pages serves for a miss.
 *
 * ## Why this file has to exist
 *
 * It did not, until the site gained a second root layout. `app/not-found.tsx`
 * composes with the root layout above it, and with the layouts now split into
 * `(en)/` and `[locale]/` there is no single root to compose with — so Next
 * silently fell back to its own black default page and `out/404.html` became
 * "404: This page could not be found." The site's own recovery page was still
 * being built, and still unreachable. Nothing errored.
 *
 * Requires `experimental.globalNotFound` in next.config.ts; without the flag
 * this file is inert and the default comes back.
 *
 * ## Why it is English
 *
 * There is exactly one 404.html for the whole domain, and it is served for
 * /zh-hans/typo/ as readily as for /typo/ — Pages matches no route, so it
 * cannot know which tree the reader thought they were in. English is the
 * default locale and the safest single answer; the switcher in the header is
 * right there, and every link on the page reaches a real page in one click.
 */
export const metadata: Metadata = {
  ...shellMetadata("en"),
  title: getUi("en").notFound.metaTitle,
  // A 404 must never be indexed, whatever it links to.
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <RootShell locale="en">
      <NotFoundContent locale="en" />
    </RootShell>
  );
}
