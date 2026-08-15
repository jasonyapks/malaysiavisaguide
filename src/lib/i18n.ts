/**
 * Locales — SPEC.md §2 ("Chinese comes first when localisation lands").
 *
 * ## One locale, one hostname
 *
 * English stays on the apex — it was indexed first and every URL in Search
 * Console points at an unprefixed path, so moving it would redirect the whole
 * indexed surface of a site that only recently got crawled properly. Chinese
 * is served from its own subdomain instead: `cn.` for Simplified, `tw.` for
 * Traditional.
 *
 * The tradeoff was made knowingly. Google treats a subdomain as a largely
 * separate site, so neither Chinese host inherits much of the apex's
 * authority and each has to earn its own. What it buys is clean separation
 * and per-host targeting in Search Console. No indexed URL moved, because the
 * Chinese trees had never been deployed when the decision was taken.
 *
 * ## Public URL vs build path — do not confuse them
 *
 * These are two different things and every bug in this area comes from
 * treating them as one:
 *
 *   - **Build path** is where a page lands in `out/`. Next decides it from the
 *     route tree, so the Chinese pages are written to `out/zh-hans/about/`.
 *     `buildPrefix` records it. Nothing in the app should link to it.
 *   - **Public URL** is what the reader and Google see:
 *     `https://cn.malaysiavisaguide.com/about/`. `localeOrigin` and
 *     `localeUrl()` own it.
 *
 * `functions/_middleware.ts` is the join between them: it maps an incoming
 * hostname to a build prefix and serves the file from there. So a link on a
 * Chinese page is a bare path (`/about/`) that resolves against whichever
 * Chinese host the reader is already on — never `/zh-hans/about/`, which is an
 * internal detail, and never a hardcoded origin, which would send a `tw.`
 * reader to `cn.`.
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

/**
 * The public origin each locale is served from. One locale, one hostname.
 *
 * `cn.` and `tw.` were chosen over `zh-hans.`/`zh-hant.` for readability. The
 * cost is that `tw.` names a country while the Traditional tree deliberately
 * serves Hong Kong too — the generator uses OpenCC `to.tw`, not `to.twp`,
 * precisely so the vocabulary stays neutral between the two. The hostname is
 * the only place that neutrality is broken, and it is broken in wording only:
 * `hreflang` still declares `zh-Hant`, not `zh-TW`, so Google keeps serving
 * this host to Hong Kong searchers.
 */
export const localeOrigin: Record<Locale, string> = {
  en: "https://malaysiavisaguide.com",
  "zh-hans": "https://cn.malaysiavisaguide.com",
  "zh-hant": "https://tw.malaysiavisaguide.com",
};

/**
 * Where each locale's pages physically live inside `out/` — an artifact of the
 * `app/[locale]/` route tree, not a URL anyone should ever see.
 *
 * Read by `functions/_middleware.ts`, which imports this module so the two
 * cannot drift. Nothing else in the app has any business with it: a link built
 * from a build prefix is the bug this file's header comment is about.
 */
export const buildPrefix: Record<Locale, string> = {
  en: "",
  "zh-hans": "/zh-hans",
  "zh-hant": "/zh-hant",
};

/** Hostname → locale, derived so it cannot disagree with `localeOrigin`. */
export const localeByHost: Record<string, Locale> = Object.fromEntries(
  locales.map((l) => [new URL(localeOrigin[l]).hostname, l]),
) as Record<string, Locale>;

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
 * The absolute public URL of a page, in a locale.
 *
 *   localeUrl("/visas/pvip/", "en")       → "https://malaysiavisaguide.com/visas/pvip/"
 *   localeUrl("/visas/pvip/", "zh-hans")  → "https://cn.malaysiavisaguide.com/visas/pvip/"
 *   localeUrl("/", "zh-hant")             → "https://tw.malaysiavisaguide.com/"
 *
 * The path is the same on every host — the locale is carried by the origin, not
 * by a prefix. That is the whole point of the subdomain layout, and it is why
 * this returns an absolute URL: crossing locales now crosses origins, so a path
 * on its own can no longer express "the Chinese version of this page".
 *
 * Use this for canonicals, `hreflang`, the sitemap and the language switcher —
 * anywhere the URL must be unambiguous about which host it means. For ordinary
 * internal links use `linkPath()` in lib/translated.ts, which keeps same-locale
 * links relative so a reader on `cn.` stays on `cn.`.
 *
 * Anchors and off-site URLs pass through untouched, so a stray call is a no-op
 * rather than a mangled `https://cn.malaysiavisaguide.com#faq`.
 */
export function localeUrl(path: string, locale: Locale): string {
  if (!path.startsWith("/")) return path;
  return `${localeOrigin[locale]}${path}`;
}

/**
 * Turn a build path back into the public path — `/zh-hans/about/` → `/about/`.
 *
 * Needed because `usePathname()` reports where a page was *built*, not where it
 * is *served*. Under `output: "export"` the value is baked in at build time
 * from the route tree, so on a Chinese page it is `/zh-hans/about/` even though
 * the reader's address bar says `cn.malaysiavisaguide.com/about/`. Anything
 * deriving a URL from `usePathname()` has to strip the prefix first or it emits
 * the internal path into a public link — which is how the language switcher
 * came to offer `https://malaysiavisaguide.com/zh-hans/` as "English".
 */
export function publicPath(pathname: string): string {
  for (const locale of prefixedLocales) {
    const prefix = buildPrefix[locale];
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || "/";
    }
  }
  return pathname;
}
