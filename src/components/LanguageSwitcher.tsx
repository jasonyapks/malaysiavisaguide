"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  htmlLang,
  locales,
  localeLabel,
  localeName,
  localeUrl,
  publicPath,
  type Locale,
} from "@/lib/i18n";
import { isTranslated } from "@/lib/translated";

/**
 * EN / 简体 / 繁體 — the switch the old header only mimed.
 *
 * ## Why it links to the same page, not to the home page
 *
 * A switcher that dumps the reader on the Chinese home page makes them find
 * their page again, in a language they were already struggling with. This one
 * reads the current pathname and re-hosts it for each target — so
 * /visas/pvip/ on the apex goes to cn.…/visas/pvip/ and back again. The path is
 * identical across hosts, which is what makes that a one-line move.
 *
 * ## Why the whole set renders as links rather than a dropdown
 *
 * Three short options fit in the space a dropdown button would take, and they
 * are real `<a href>`s in the served HTML. That matters beyond taste: it is
 * how a crawler discovers the translated tree from the English one. The
 * `hreflang` tags in <head> declare the relationship; these links are what
 * actually gets followed.
 *
 * `usePathname()` is what makes this a client component. In a static export
 * the value is correct from the first render — the path is baked into the
 * page — so there is no hydration flash.
 *
 * ## Pages that are not translated yet
 *
 * Translation lands page by page, so on an English page with no Chinese
 * counterpart the honest target is that language's home page rather than a
 * URL that would 404. Those are marked `data-untranslated` and carry a title
 * saying so, so the reader is not surprised to arrive somewhere else. What
 * they must NOT do is appear in `hreflang` — that is `pageMetadata()`'s job
 * and it reads the same `isTranslated()` list, so the two cannot disagree.
 */
export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  // `usePathname()` reports the BUILD path, which on a Chinese page is
  // `/zh-hans/about/` — the reader's address bar says `cn.…/about/`. Strip the
  // prefix or every "EN" link points at the internal path on the apex.
  const path = publicPath(usePathname());
  const translated = isTranslated(path);

  return (
    <nav
      aria-label={label}
      className="flex items-center overflow-hidden rounded-full border border-sand-200 text-eyebrow font-bold"
    >
      {locales.map((target) => {
        const current = target === locale;
        return current ? (
          // The current language is stated, not offered. aria-current tells a
          // screen reader which one is active; a link to the page you are on
          // would say nothing and waste a tab stop.
          <span
            key={target}
            aria-current="true"
            className="bg-forest-900 px-3 py-1 text-sand-50"
          >
            {localeLabel[target]}
          </span>
        ) : (
          <Link
            key={target}
            // English is the fallback for everything, so a target that is not
            // the default locale and has no translation of this page goes to
            // that language's home instead of a URL that does not exist.
            // Absolute, always: every target is a different hostname now, so
            // there is no such thing as a relative link to another language.
            href={
              translated || target === "en"
                ? localeUrl(path, target)
                : localeUrl("/", target)
            }
            // The BCP-47 tag, not our internal locale id: `hreflang` is a
            // language tag and "zh-hans" is not one. Only set when the link
            // really does point at that language's copy of this page.
            {...(translated || target === "en"
              ? { hrefLang: htmlLang[target] }
              : { "data-untranslated": true })}
            // The link text is an endonym — 简体, not "Simplified Chinese" —
            // so the accessible name says which language in words.
            aria-label={localeName[target]}
            // Full-strength ink-muted, not /70: the faded version measured
            // 3.15:1 on white, under the 4.5:1 floor. Inactive is carried by
            // the unfilled pill segment, not by making the text hard to read.
            className="px-3 py-1 text-ink-muted transition-colors hover:bg-sand-100 hover:text-forest-900"
          >
            {localeLabel[target]}
          </Link>
        );
      })}
    </nav>
  );
}
