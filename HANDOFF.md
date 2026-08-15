# Handoff

## What & Why

Building a Chinese version of malaysiavisaguide.com with the same content as the
English site. Jason chose **both** scripts — Simplified at `/zh-hans/` and
Traditional at `/zh-hant/` — because Hong Kong and Taiwan (Traditional) and
Singapore/mainland (Simplified) are all named source markets. English stays
unprefixed at the domain root so no indexed URL moves.

Branch: `i18n/chinese-site`, 7 commits on top of `1c28238`. **Not pushed** — a
push to `main` deploys, which is an approval gate. This branch is stacked on
`seo/gsc-indexing-fixes`, which is itself unmerged (1 commit ahead of `main`).

## Done

- **Routing.** `app/(en)/` (unprefixed) + `app/[locale]/` (generates `zh-hans`
  and `zh-hant` from one tree). Two root layouts, because `<html lang>` can only
  be set where `<html>` is rendered.
- **`app/global-not-found.tsx`** behind `experimental.globalNotFound` — the
  root-layout split silently broke `out/404.html` back to Next's default page.
- **Traditional is generated, never hand-written.** `scripts/gen-zh-hant.mjs`
  converts every `zh-hans.*` under `src/` via OpenCC. `prebuild` runs `--check`
  and fails on drift. `npm run i18n:hant` regenerates.
- **hreflang / sitemap / language switcher** all read `src/lib/translated.ts`.
- **CJK fonts**: platform fonts, Latin *ahead* of CJK in each stack; separate
  stacks for Hans/Hant (same character, different regional glyph).
- **Translated pages (both scripts):** home + all 6 visa guides — pvip, mm2h,
  sarawak-mm2h, de-rantau, employment-pass, student-pass.
- **Chrome localised**: header, footer, nav, cookie banner, 404, GuideLayout,
  KeyFacts, Faq, Byline, SupersededNotice, TierTable, DataTable, `format.ts`.
- **Translated static pages:** `/about/` (`src/content/about/`, same shape as
  `src/content/home/`).
- **`linkPath()` in `src/lib/translated.ts`** — internal links to untranslated
  routes fall back to the English URL. Before this, every Chinese page shipped
  eleven dead links, because the header, footer and 404 render the whole route
  table through `localePath`, which prefixes unconditionally. **Use `linkPath`
  for every link; `localePath` only for canonical URLs, hreflang and the
  sitemap.**
- **Lint down to 3 errors in `src/`** — all pre-existing `setState`-in-effect
  (CookieConsent, CookiePreferences, SiteNav). Not caused by this work.

## Remaining

- Translate: `/compare/`, `/tools/`, `/tools/eligibility/`,
  `/tools/cost-calculator/`, `/editorial-policy/`, `/privacy/`, `/contact/`.
  - **The two tool pages are client components** (`EligibilityQuiz.tsx`,
    `CostCalculator.tsx`). Pass strings in as props — do NOT import `getUi`
    there, or all three locales' dictionaries ship to every browser.
- CMS locale work: add a locale dimension to `cms_documents` in the `mvg-news`
  Worker D1, expose translated bodies via the insights API, teach the
  `/dashboard` editor to author a translation, then translate the 4 existing
  insights articles. `HomePage.tsx` currently renders the insights section only
  for `locale === "en"`, so Chinese home pages hide it rather than linking out
  to English.
- News (19 items) is out of scope — Jason chose "static pages + the 4 insights".

## Files & Folders Touched

- `src/lib/i18n.ts` — locales, `localePath()`, `stripLocale()`, `htmlLang`. Read this first.
- `src/lib/translated.ts` — **the list of which routes exist in Chinese.** Add a path here in the same commit as the route file.
- `src/lib/metadata.ts` — `pageMetadata()` builds canonical + hreflang per page.
- `src/lib/ui.ts` + `src/locales/ui/{en,zh-hans,zh-hant}.ts` — chrome strings. `en.ts` is the type of record.
- `src/locales/programmes/{zh-hans,zh-hant}.ts` — Chinese for the *prose* fields of `programmes.ts`. **No numbers here, ever.**
- `src/lib/programme-locale.ts` — merges that overlay onto a `Programme`.
- `src/components/RootShell.tsx` — everything both root layouts share.
- `src/app/(en)/layout.tsx`, `src/app/[locale]/layout.tsx` — the two root layouts.
- `src/components/LanguageSwitcher.tsx` — replaced the old fake EN/中文 pill.
- `src/content/home/` — `HomePage.tsx` + `types.ts` + per-locale copy. Pattern for whole-page extraction.
- `src/content/visas/` — `VisaGuide.tsx`, `types.ts`, and `<slug>/{en,zh-hans,zh-hant}.tsx` for all 6 guides. Pattern for guide extraction.
- `scripts/gen-zh-hant.mjs` — the Simplified→Traditional generator + terminology overrides.
- `src/app/globals.css` — `--font-cjk-*` vars and the `html[lang^="zh"]` rules.
- `src/lib/format.ts` — `money`/`moneyPer`/`reviewDate`/`years` now take a locale. **Type-only import of `Locale`** — `scripts/emit-figures.mjs` imports this file under plain Node where `@/` does not resolve.
- `next.config.ts` — added `experimental.globalNotFound`.

## Decisions Made

- **English unprefixed at root.** Moving it to `/en/` would redirect the whole
  indexed surface to buy nothing but symmetry.
- **OpenCC `to.tw`, not `to.twp`.** One Traditional tree serves both HK and
  Taiwan, and `twp` swaps exactly the vocabulary those two disagree on.
- **Digits never localised.** `RM1,000,000`, not `RM100万`. The reader is
  comparing against a bank form and an Immigration page that both say
  `RM1,000,000`. Only the *words* around figures are translated.
- **Programme prose lives in an overlay, not in `programmes.ts`.** SPEC.md §4.1
  makes that file the sole source of every figure; three language copies of each
  record would invite the exact drift the rule prevents.
- **Latin kept on Chinese pages** for programme names (PVIP, MM2H, DE Rantau),
  authority names in brackets after the Chinese, and quoted official document
  titles — a reader verifying a claim lands on an English/Malay page.
- **`VisaGuide` takes `tierSlugs`, not a built `<TierTable>`** — passing an
  element skips `localiseProgramme` on the other tiers and renders English
  columns beside a translated one.
- **Untranslated pages don't get a Chinese URL at all.** No stub pages; the
  switcher sends you to that language's home instead, and hreflang omits it.

## Verification Method (use this — it caught two real bugs)

English output must not change. Build a baseline from before the work, then diff
visible text on every page:

```sh
git stash -u                      # if you have local changes
git checkout 1c28238 && npm run build && cp -R out /tmp/mvg-baseline
git checkout i18n/chinese-site && npm run build
```

Then compare: strip `<script>`/`<style>`/comments/tags from each `out/**/*.html`
and diff against `/tmp/mvg-baseline`. **Expected diff, sitewide: only the
language pill (`中文` → `简体 繁體`), plus the 404's `<title>`.** Anything else
is a regression.

This caught (a) the custom 404 silently reverting to Next's default, and (b) the
guide contents rail rendering empty because `Children.toArray` does not descend
into the fragment that `copy.sections()` returns.

Also check each new Chinese page for English leaks — strip tags and grep for
`[A-Za-z][a-z]{4,}`. Expect only: `Jason`, programme names, and bracketed
authority names.

## Next Step

Translate `/editorial-policy/`, then `/privacy/` and `/contact/` — prose-only
pages, same recipe as `/about/`:

1. `src/content/<page>/{types.ts,<Page>.tsx,en.tsx,zh-hans.tsx}` — shared body
   component, per-locale copy, English transcribed *exactly* so the baseline
   diff stays clean.
2. Make `src/app/(en)/<page>/page.tsx` a thin wrapper using `pageMetadata()`.
3. Add `src/app/[locale]/<page>/page.tsx`.
4. Add the path to `translatedRoutes` in `src/lib/translated.ts` **in the same
   commit**.
5. `npm run i18n:hant`, then the baseline diff and the two sweeps below.

Leave `/compare/` and the two tool pages until last — `/compare/` is table-heavy
and the tools are client components (see the note above about passing strings in
as props).

### Two sweeps to run alongside the baseline diff

Both are cheap and both have already caught real bugs:

- **Link integrity.** Every `href="/zh-han[st]/…"` in `out/**/*.html` must
  resolve to a built `index.html`. Expect zero misses. This is what surfaced the
  eleven dead links `linkPath` now prevents.
- **English leaks.** Strip tags from each new Chinese page and count
  `[A-Za-z]{4,}` words. On `/about/` the only survivors are `Jason`, programme
  names, company names and bracketed authority names — anything else is a
  missed string.

### A trap in the diff script itself

React separates adjacent text nodes with an empty `<!-- -->` comment. If your
comparator replaces comments with a space, a locale change that merges three
text nodes into one interpolated string reads as a whitespace diff on 32 pages
(`2026 .` → `2026.`) and looks like a sitewide regression. Strip `<!-- -->` to
the empty string, other comments to a space.
