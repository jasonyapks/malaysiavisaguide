import type { Metadata } from "next";
import { htmlLang, localeUrl, type Locale } from "./i18n";
import { availableLocales } from "./translated";
import { getUi } from "./ui";
import { seoOverrides } from "./data/seo-overrides";

/** Google truncates a title at roughly 60 Latin characters; a CJK character is
 *  about twice as wide, so it counts double. */
const TITLE_BUDGET = 60;
function titleWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += ch.codePointAt(0)! > 0x2e7f ? 2 : 1;
  return w;
}

/**
 * The title and description a page puts in front of a search engine.
 *
 * Two rules, both from the November 2026 audit (B1-2, B1-3):
 *
 *  1. An English article may carry a search-specific title and description in
 *     `seo-overrides.ts`, where its headline or dek does not fit a results page.
 *  2. The " — Malaysia Visa Guide" suffix is kept only when the whole title
 *     still fits the budget. Otherwise the title stands alone — the query-
 *     matching words are worth more than the brand being cut off mid-word.
 *
 * `full` is the finished string, for og:title, which gets no template.
 */
export function seoText({
  canonicalPath,
  locale,
  title,
  description,
}: {
  canonicalPath: string;
  locale: Locale;
  title?: string;
  description?: string;
}): { title?: Metadata["title"]; full?: string; description?: string } {
  const o = locale === "en" ? seoOverrides[canonicalPath] : undefined;
  const t = o?.title ?? title;
  const d = o?.description ?? description;
  if (!t) return { description: d };
  const withSuffix = `${t} — ${getUi(locale).siteName}`;
  return titleWidth(withSuffix) <= TITLE_BUDGET
    ? { title: t, full: withSuffix, description: d }
    : { title: { absolute: t }, full: t, description: d };
}

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

  const seo = seoText({ canonicalPath, locale, title, description });

  return {
    ...(seo.title ? { title: seo.title } : {}),
    ...(seo.description ? { description: seo.description } : {}),
    alternates: {
      canonical: localeUrl(canonicalPath, locale),
      languages,
    },
  };
}
