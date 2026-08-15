import type { Metadata } from "next";
import { htmlLang, localeUrl, type Locale } from "./i18n";
import { availableLocales } from "./translated";

/**
 * Per-page metadata: canonical plus the hreflang set.
 *
 * ## The rule hreflang breaks on
 *
 * Every page in a language group must point at every other page in that group,
 * *including itself*, and every one of those URLs must return 200. Miss the
 * self-reference and Google is entitled to ignore the whole cluster; name a URL
 * that 404s and Search Console reports "no return tag" and drops the pairing.
 * So the list is built from `availableLocales()` — which knows what has
 * actually been translated — rather than assumed to be all three.
 *
 * `x-default` points at English. It is what a searcher gets when none of their
 * languages match, and English is the fullest tree.
 *
 * This cannot live on the root layout: metadata is inherited, so a sitewide
 * `alternates.languages` would tell Google that every page's Chinese
 * counterpart is the Chinese home page.
 *
 * @param canonicalPath the unprefixed English path, e.g. "/visas/pvip/"
 */
export function pageMetadata({
  canonicalPath,
  locale,
  title,
  description,
}: {
  canonicalPath: string;
  locale: Locale;
  title?: string;
  description?: string;
}): Metadata {
  const languages: Record<string, string> = {};
  for (const l of availableLocales(canonicalPath)) {
    languages[htmlLang[l]] = localeUrl(canonicalPath, l);
  }
  languages["x-default"] = localeUrl(canonicalPath, "en");

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: localeUrl(canonicalPath, locale),
      languages,
    },
  };
}
