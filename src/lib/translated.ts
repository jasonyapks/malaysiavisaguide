import { localeUrl, prefixedLocales, type Locale } from "./i18n";

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
 * **Every internal link goes through this, not through `localeUrl`.**
 *
 * Two cases, and the difference is the whole function:
 *
 *   - **The target exists in this locale** → a bare path (`/about/`). Relative
 *     on purpose: it resolves against whichever host the reader is already on,
 *     so a `tw.` reader stays on `tw.` and the same built HTML is correct on
 *     every hostname. Hardcoding an origin here would pin the Traditional pages
 *     to `cn.` the moment someone got the locale wrong.
 *   - **It does not** → the absolute English URL. Under the subdomain layout a
 *     relative link would resolve to `cn.malaysiavisaguide.com/privacy/`, which
 *     is not just a 404 but a 404 on the wrong host. Crossing to a page that
 *     only exists in English means crossing origins, so the link has to say so.
 *
 * A Chinese reader who clicks "Privacy" therefore lands on the English privacy
 * page. That is the honest outcome — the alternative, hiding the link, hides
 * the privacy policy — and the switcher there will show the page has no Chinese
 * counterpart.
 *
 * This matters more than it sounds. The header, footer and 404 all render the
 * full route table, so getting it wrong is not one dead link but every
 * untranslated route dead on every Chinese page at once.
 *
 * Paths that are not canonical routes — anchors, off-site URLs, news slugs —
 * are not in the set, so they resolve to English. Correct today because nothing
 * under `/news/` or `/insights/` is translated; when that changes, those trees
 * need their own check here.
 */
export function linkPath(canonicalPath: string, locale: Locale): string {
  if (locale === "en" || isTranslated(canonicalPath)) return canonicalPath;
  return localeUrl(canonicalPath, "en");
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
