import { prefixedLocales, type Locale } from "./i18n";

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
]);

export function isTranslated(canonicalPath: string): boolean {
  return translatedRoutes.has(canonicalPath);
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
