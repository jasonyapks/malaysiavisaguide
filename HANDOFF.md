# Handoff

## What & Why

malaysiavisaguide.com in Chinese as well as English, in **both scripts** —
Simplified and Traditional — because Hong Kong and Taiwan (Traditional) and
Singapore and the mainland (Simplified) are all named source markets.

**One locale, one hostname.** English on the apex, Simplified on
`cn.malaysiavisaguide.com`, Traditional on `tw.malaysiavisaguide.com`. Paths are
identical on all three: `/about/` everywhere. English stays unprefixed at the
root so no indexed URL moved.

**Read the header comment in `src/lib/i18n.ts` before touching any URL code.**
A page has a *build path* (`out/zh-hans/about/`, what Next emits) and a *public
URL* (`https://cn.…/about/`), and every bug in this area is the two being
confused. `functions/_middleware.ts` is the join between them.

The routing shipped 2026-08-15. Work since then has been content, on
`feat/chinese-content-translation`.

## Where it stands

| | Chinese |
|---|---|
| Home, 6 visa guides, `/about/`, `/compare/`, `/tools/` ×3, `/contact/` | done |
| `/editorial-policy/`, `/privacy/` | done — this session |
| `/news/` — index, categories, 21 articles | done |
| `/insights/` — 6 articles | **2 of 6** |

Every static page is now translated. The only content gap is four insight
articles.

## How each layer gets translated

Three different mechanisms, and picking the wrong one is the usual mistake.

1. **Chrome** — header, footer, nav, cookie banner, 404, and every shared
   component — is a string dictionary: `src/lib/ui.ts` +
   `src/locales/ui/{en,zh-hans,zh-hant}.ts`. `en.ts` is the type of record.
2. **Page bodies** are extracted into `src/content/<page>/`: a shared layout
   component that holds all the structure, `types.ts`, and one copy file per
   locale holding every word. `/about/`, `/contact/`, `/editorial-policy/` and
   `/privacy/` all follow this; `src/content/visas/` is the same pattern for
   the six guides.
3. **Articles** (`content/`) are translated by a reconciler through a model —
   `scripts/translate-content.mjs`. English is the source of truth, every
   translated file records a `sourceHash` of its source's translatable strings,
   and the script works out what is missing, stale, or should no longer exist.

**Traditional is generated, never hand-written.** `scripts/gen-zh-hant.mjs`
converts every `zh-hans.*` under `src/` and every file under `content/zh-hans/`
via OpenCC. `prebuild` runs `--check` and fails the build on drift.
`npm run i18n:hant` regenerates.

**Figures are never translated, in any of the three.** `programmes.ts` is the
sole source of every number (SPEC.md §4.1); prose *about* a programme lives in
an overlay at `src/locales/programmes/zh-hans.ts` and is merged on by
`localiseProgramme`. Digits stay Arabic and stay formatted the English way —
`RM1,000,000`, never `RM100万` — because the reader is comparing against a bank
form and an Immigration page that both say `RM1,000,000`. Only the words around
the figure are translated.

## Adding a page — the recipe

1. `src/content/<page>/{types.ts,<Page>.tsx,en.tsx,zh-hans.tsx}`. Transcribe the
   English **exactly**, so the baseline diff stays clean.
2. Make `src/app/(en)/<page>/page.tsx` a thin wrapper using `pageMetadata()`.
3. Add `src/app/[locale]/<page>/page.tsx`.
4. Add the path to `translatedRoutes` in `src/lib/translated.ts` **in the same
   commit** — the route tree, hreflang, the sitemap and the switcher all read
   that set, and `assertTranslatedRoutesExist()` fails the build if it drifts.
5. `npm run i18n:hant`, then `npm run build`, then the checks below.

**Use `linkPath()` for every internal link; `localePath` only for canonical
URLs, hreflang and the sitemap.** `linkPath` returns a bare path when the target
exists in this locale and the absolute English URL when it does not. Before it
existed, every Chinese page shipped eleven dead links, because the header,
footer and 404 render the whole route table through `localePath`, which
prefixes unconditionally.

**Client components take their strings as props.** `CookieConsent` and
`CookiePreferences` both do. Importing the dictionary inside one ships all three
languages' chrome to every browser to render one panel's worth of one of them.

## Verifying — `scripts/check-translated-output.mjs`

Run after `npm run build`. Its header explains what each check has caught.

```sh
npm run build
node scripts/check-translated-output.mjs --leaks zh-hans/<the page you added>
```

For the baseline diff, build the previous commit somewhere and pass it:

```sh
git stash -u && npm run build && cp -R out /tmp/mvg-baseline
git stash pop && npm run build
node scripts/check-translated-output.mjs --baseline /tmp/mvg-baseline
```

**Expected English diff, sitewide: none.** Anything else is a regression until
proven otherwise.

### Host routing

The static checks cannot see the middleware. Serve the real output and drive it
by `Host` header:

```sh
npx wrangler pages dev out --port 8788 --compatibility-date=2026-07-28
curl -sI -H "Host: cn.malaysiavisaguide.com" http://localhost:8788/about/
```

Cover: each host serves the right `<html lang>`; `/zh-hans/*` 301s to `cn.` from
the apex and to a bare path on `cn.` itself; an untranslated page 302s to
English; `robots.txt`, `sitemap.xml` and `og.png` pass through; an unknown host
falls through to the raw prefixed tree.

**Also check the RSC payloads** — `/<page>/index.txt` and the `__next.*` files
beside it must come back in the host's language. If they fall through to English
the client router gets a 200 of the wrong language and soft-navigates a Chinese
reader into English content with the Chinese URL still in the address bar.
Silent, and invisible on a hard refresh.

Two dev-server artefacts that are NOT bugs: wrangler rewrites a redirect
`Location` to `http://` when the target host equals the request host, and firing
probes in a tight loop can 500 before reaching the Worker (no line in the
wrangler log — that is how you tell).

All of the above was run against the current build on 2026-09-02 and passed.

## Outstanding

- **Four insight articles.** `mm2h-platinum-vs-pvip`,
  `is-foreign-income-taxed-in-malaysia`, `malaysian-tax-for-expats`,
  `apply-for-mm2h-2026`. `node scripts/translate-content.mjs --check` lists what
  is left. `mm2h-platinum-vs-pvip` failed once for a reason the run did not
  report — the quota block replaced the per-file detail — so it may be a real
  validation failure rather than a quota one.
  - **The translator defaults to Workers AI and needs `CLOUDFLARE_API_TOKEN`**,
    which CI has and a local shell does not. Without it, `TRANSLATE_PROVIDER=gemini`
    falls back to `GEMINI_API_KEY` — but that free tier is 20 requests a day per
    model and runs out around three articles. `TRANSLATE_MODEL` spreads a
    backfill across models. Minting a Workers AI token is the durable fix.
- **Search Console.** `cn.` and `tw.` still need adding and verifying as
  properties. The sitemap is a single file at the apex listing all three hosts'
  URLs, and Google only accepts that as cross-submission once every host is
  verified. Until then the Chinese URLs are discoverable only by crawling.
- **CMS locale work.** Add a locale dimension to `cms_documents` in the
  `mvg-news` Worker D1, expose translated bodies via the insights API, and teach
  the `/dashboard` editor to author a translation. Right now a translation can
  only be produced by the reconciler, never written by hand in the CMS.
- **`og:image` is the same English card on all three hosts.** Fine for now; a
  Chinese card needs `scripts/` work and a second asset.

## Decisions worth not relitigating

- **English unprefixed at root.** Moving it to `/en/` would redirect the whole
  indexed surface to buy nothing but symmetry.
- **OpenCC `to.tw`, not `to.twp`.** One Traditional tree serves both HK and
  Taiwan, and `twp` swaps exactly the vocabulary those two disagree on.
- **Programme prose lives in an overlay, not in `programmes.ts`.** SPEC.md §4.1
  makes that file the sole source of every figure; three language copies of each
  record would invite the exact drift the rule prevents.
- **Latin kept on Chinese pages** for programme names, company names, authority
  names in brackets after the Chinese, official document titles, and vendor
  names — a reader verifying a claim lands on an English or Malay page, and a
  Chinese rendering of a company name cannot be looked up in the SSM register.
- **Untranslated pages don't get a Chinese URL at all.** No stub pages; the
  switcher sends you to that language's home instead, and hreflang omits it.
- **`VisaGuide` takes `tierSlugs`, not a built `<TierTable>`** — passing an
  element skips `localiseProgramme` on the other tiers and renders English
  columns beside a translated one.

## Traps that have already cost a day

- **`localiseProgramme` is the single seam, and callers have to hold it up.**
  `TierTable`, `KeyFacts` and `SupersededNotice` all expect an
  already-localised programme and each declines to add a second seam.
  `InsightBlocks` passed them `locale` but raw English records, so their chrome
  came out Chinese around English data — a translated table with English
  footnote paragraphs. Fixed in `31a8f0e`; the shape of the bug will recur at
  the next new caller.
- **A figure token is the one span a translator never sees.** The point of
  `{{programme:field:fmt}}` is that the model cannot touch a number. So
  `resolveFigure` *must* localise, or the untranslatable becomes the
  untranslated — and some of those fields are prose, not digits
  (`incomePractice.note` is a paragraph).
- **A field reached structurally but missing from the declared `Programme`
  type cannot be overlaid.** `incomePractice` and `agencyFee.attribution` were
  both like that. If a Chinese page shows an English string out of
  `programmes.ts`, check the type declaration before anything else.
- **`Children.toArray` does not descend into fragments** — it rendered the
  guide contents rail empty when `copy.sections()` returned one.
- **The root-layout split silently reverted `out/404.html`** to Next's default.
  `app/global-not-found.tsx` behind `experimental.globalNotFound` is the fix.
- **`reviewDate` takes an ISO date, never a written one.** An overlay string
  reaching it parses as Invalid Date.

## Deploying

Push to `main`; Pages builds from the commit. `scripts/deploy-site.mjs` is
break-glass only — a direct upload that becomes the live deployment without
coming from a commit.

Its long-standing open question is now answered: **the direct-upload path does
pick up the root `functions/` directory.** `wrangler pages functions build`, run
from the repo root exactly as `deploy-site.mjs` runs `wrangler pages deploy out`
with `cwd: ROOT`, discovers `functions/_middleware.ts` and compiles it into a
Worker containing the host routing. So a break-glass deploy would not silently
publish with the apex perfect and both Chinese subdomains serving English. That
verifies discovery and compilation, not the upload itself.
