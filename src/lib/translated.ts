import { localePath, prefixedLocales, type Locale } from "./i18n";

/**
 * Which routes exist in the translated trees.
 *
 * ## Why this list exists rather than "everything is translated"
 *
 * 35,000 words do not get translated in one pass, and the alternative to
 * landing them page by page is a Chinese tree that is either empty for months
 * or full of English pages wearing a Chinese header. Both are worse than a
 * smaller, complete Chinese site that grows.
 *
 * The consequence is that "the same page in Chinese" is not a given, and three
 * things have to agree about it or the site lies to Google:
 *
 *   - the route tree — a page under `app/[locale]/` exists or it does not, and
 *     that is the ground truth;
 *   - `hreflang` — may only name URLs that exist, or Search Console reports
 *     "no return tag" and drops the pairing entirely;
 *   - the sitemap and the language switcher — must not offer a 404.
 *
 * This set is what those three read. `assertTranslatedRoutesExist()` in the
 * sitemap checks it against the built route tree, so the list cannot drift
 * from reality without a build failing.
 *
 * ADDING A PAGE: create `src/app/[locale]/<path>/page.tsx` and add the path
 * here in the same commit. Doing one without the other is the bug this file
 * is designed to make loud.
 */
export const translatedRoutes = new Set<string>([
  "/",
  "/visas/pvip/",
  "/visas/mm2h/",
  "/visas/sarawak-mm2h/",
  "/visas/de-rantau/",
  "/visas/employment-pass/",
  "/visas/student-pass/",
  "/about/",
]);

export function isTranslated(canonicalPath: string): boolean {
  return translatedRoutes.has(canonicalPath);
}

/**
 * The href for an internal link, rendered on a page in `locale`.
 *
 * **Every internal link goes through this, not through `localePath`.**
 *
 * `localePath` is mechanical: give it a path and a locale and it prefixes,
 * because canonical URLs and hreflang have to name `/zh-hans/about/` whether or
 * not that page has been built yet. A link is the opposite — it may only name a
 * page that exists. Prefixing a route the Chinese tree does not have yet
 * produces a 404, and because the header, the footer and the 404 page all
 * render the full route table, that is not one dead link but every untranslated
 * route dead on every Chinese page at once.
 *
 * So an untranslated target falls back to the English URL. A Chinese reader who
 * clicks "Privacy" gets the English privacy page — which is the honest outcome,
 * and the language switcher on it will say the page has no Chinese counterpart.
 * The alternative, hiding the link, hides the privacy policy.
 *
 * Paths that are not canonical routes — anchors, external URLs, news slugs —
 * are not in the set either, so they fall through to English untouched. That is
 * correct today because nothing under `/news/` or `/insights/` is translated;
 * when that changes, those trees need their own check here rather than a
 * blanket prefix.
 */
export function linkPath(canonicalPath: string, locale: Locale): string {
  return isTranslated(canonicalPath)
    ? localePath(canonicalPath, locale)
    : canonicalPath;
}

/**
 * The locales a given page is actually available in — English always, plus the
 * translated ones if that page has been done. Used by the language switcher
 * and by `pageMetadata()` for hreflang.
 */
export function availableLocales(canonicalPath: string): Locale[] {
  return isTranslated(canonicalPath)
    ? ["en", ...prefixedLocales]
    : ["en"];
}
