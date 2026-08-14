/**
 * Locales — SPEC.md §2 ("Chinese comes first when localisation lands").
 *
 * ## Why English has no prefix
 *
 * English was indexed first and every URL in Search Console points at an
 * unprefixed path (`/visas/pvip/`). Moving it to `/en/visas/pvip/` would mean
 * redirecting the entire indexed surface of a site that only recently got
 * crawled properly, to buy nothing but symmetry. So English stays at the root
 * and the translations sit under a prefix. `localePath()` is the only place
 * that knows this, so a future decision to prefix English is one edit here.
 *
 * ## Why two Chinese trees rather than one
 *
 * Hong Kong and Taiwan are named source markets and read Traditional;
 * Singapore and mainland searchers read Simplified. `zh` alone would serve one
 * of them the wrong script, and Google treats `zh-Hans` and `zh-Hant` as
 * distinct hreflang targets, so a single tree cannot rank for both. The
 * Traditional tree is *generated* from the Simplified one — see
 * `scripts/gen-zh-hant.mjs` — because hand-maintaining two copies of 35,000
 * words guarantees they drift.
 */
export const locales = ["en", "zh-hans", "zh-hant"] as const;

export type Locale = (typeof locales)[number];

/** The locale served at the root of the domain. */
export const defaultLocale: Locale = "en";

/**
 * Locales that live under a URL prefix — i.e. everything but the default.
 * This is exactly what `app/[locale]/`'s `generateStaticParams` returns, and
 * it is a non-empty tuple on purpose: under `output: "export"` a dynamic route
 * whose params come back empty is a hard build failure, not an empty section.
 * See the comment at the top of next.config.ts.
 */
export const prefixedLocales = ["zh-hans", "zh-hant"] as const;

export type PrefixedLocale = (typeof prefixedLocales)[number];

export function isPrefixedLocale(value: string): value is PrefixedLocale {
  return (prefixedLocales as readonly string[]).includes(value);
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** URL prefix per locale. The default locale's is the empty string. */
const prefixes: Record<Locale, string> = {
  en: "",
  "zh-hans": "/zh-hans",
  "zh-hant": "/zh-hant",
};

/**
 * The BCP-47 tag that goes in `<html lang>`, `hreflang` and `og:locale`.
 *
 * Script subtags, not region subtags: `zh-Hans` says "Simplified Chinese"
 * regardless of country, which is what we actually know about the reader.
 * `zh-CN` would claim mainland China and exclude the Singapore readers the
 * Simplified tree is largely for.
 *
 * This attribute is not decoration. A CJK page with no `lang` gets whatever
 * the platform guesses, and on a system with a Japanese font ahead of a
 * Chinese one in the fallback chain that means Han characters rendering in
 * Japanese glyph variants — visibly wrong to a Chinese reader. It also drives
 * the `html[lang^="zh"]` font rules in globals.css.
 */
export const htmlLang: Record<Locale, string> = {
  en: "en",
  "zh-hans": "zh-Hans",
  "zh-hant": "zh-Hant",
};

/** `og:locale` wants underscores and a region. */
export const ogLocale: Record<Locale, string> = {
  en: "en",
  "zh-hans": "zh_CN",
  "zh-hant": "zh_TW",
};

/** What the language switcher shows. Endonyms — a reader looking for Chinese
 *  is scanning for 简体 / 繁體, not for "Simplified Chinese". */
export const localeLabel: Record<Locale, string> = {
  en: "EN",
  "zh-hans": "简体",
  "zh-hant": "繁體",
};

/** Long form, for `title` attributes and the switcher's accessible name. */
export const localeName: Record<Locale, string> = {
  en: "English",
  "zh-hans": "简体中文",
  "zh-hant": "繁體中文",
};

/**
 * Prefix a site-root-relative path for a locale.
 *
 *   localePath("/visas/pvip/", "en")       → "/visas/pvip/"
 *   localePath("/visas/pvip/", "zh-hans")  → "/zh-hans/visas/pvip/"
 *   localePath("/", "zh-hant")             → "/zh-hant/"
 *
 * Every internal link on a translated page has to go through this or it drops
 * the reader back into English mid-journey, which is the single easiest way to
 * ruin a localised site. Absolute URLs and anchors pass through untouched so
 * that `localePath("https://mypvip.com")` is a harmless no-op.
 */
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith("/")) return path;
  const prefix = prefixes[locale];
  if (!prefix) return path;
  // "/" must not become "/zh-hans" — trailingSlash: true expects "/zh-hans/".
  return path === "/" ? `${prefix}/` : `${prefix}${path}`;
}

/**
 * Strip a locale prefix back off a pathname, returning the canonical English
 * path. The inverse of `localePath`, used by the language switcher to answer
 * "where is the reader, and what is this page called in the other language?".
 */
export function stripLocale(pathname: string): {
  locale: Locale;
  path: string;
} {
  for (const locale of prefixedLocales) {
    const prefix = prefixes[locale];
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { locale, path: pathname.slice(prefix.length) || "/" };
    }
  }
  return { locale: "en", path: pathname };
}
