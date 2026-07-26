# Handoff

## What & Why
Work on malaysiavisaguide.com — the contact form, the Access-gated news dashboard, and the
news sweep behind it. Goal: get enquiries actually arriving, move the dashboard onto the real
domain, and stop the news pipeline surfacing stale or unwritable stories.

(Supersedes the previous handoff, which covered the completed domain cutover — see SPEC.md §10.)

## Done
- **Contact form is live and verified.** `NEXT_PUBLIC_WEB3FORMS_KEY` set in `.env.local`;
  test submission delivered (SPEC §8.4 — real delivery, not just "form submitted").
- Fixed a real bug: handler tested `res.status === 200` and read `json.message`. Web3Forms
  reports outcome in `json.success`, reason in `json.body.message` — so every failure showed
  the generic fallback, and a `success:false` 200 would have read as sent.
- Submit button had no visible focus state; added `focus-visible` ring + `aria-busy`.
  Error text was colour-only; added a `⚠` glyph.
- **Dashboard now at `https://malaysiavisaguide.com/dashboard`** (was workers.dev only).
  Zone *routes*, not a Custom Domain. Cloudflare Access extended to
  `malaysiavisaguide.com/dashboard` + `/api/admin/*` on the existing app, so the AUD is
  unchanged and `POLICY_AUD` needed no edit. Verified logged in: both admin API calls 200,
  no console errors. Public site confirmed unaffected.
- **News age gate**: nothing published before the current calendar year enters the queue.
  Both sectors. Also rejects future-dated items.
- **New "world" sector** — 9 feeds for other countries' long-stay/retirement/investor visas.
  Per-sector budgets (malaysia 20, world 8). Stricter editorial brief. `en-US` market for
  world feeds. Renders as "Other countries", links to `/compare/`. Live and verified.
- **Alternate-source fallback**: when a source can't be read (paywall / bot block / JS shell),
  the headline is searched and other outlets carrying the same story are tried. Citation
  follows the source actually read. Verified live: zawya.com 400 → found Sin Chew → article
  written → `[article] citation reassigned: Zawya → sinchew`.
- All committed and pushed (`9a4d00c`). Worker `25fabe31`; Pages deployed; site verified live.

## Remaining
- **The Star (`thestar.com.my`) blocks Worker egress** — 403 from the Worker, 200 with
  6,081 chars from a residential IP. Two items still unwritten. Needs Cloudflare Browser
  Rendering (Workers Paid; plan unconfirmed) or a fetch proxy such as `r.jina.ai`. Its
  opinion columns have no alternate by definition, so the fallback cannot help them.
- **World relevance filter too soft** — ~4 of 8 queued items are rankings, SEO guides or
  law-firm advisories the brief was written to reject. Likely the model
  (`SUMMARY_MODEL` = `llama-3.2-3b`) rather than the wording. Sharpen the prompt first;
  routing world items to a larger model is the fallback.
- **Two articles over a year old are live** — Jason's call whether to retire them:
  - `/news/sarawak-mm2h-records-over-800-approvals-education-drives-growth` (415 days)
  - `/news/xpats-gateway-adds-myfuturejobs-eppax-to-speed-employment-pass` (384 days)
- **2022 PVIP item deliberately held back** (id `ebd2ace9-2bb3-4372-8237-e30938ba7874`),
  approved but unwritten. Its Bernama alternate scores 0.86 so it would now write cleanly.
- **Contact form inbox unresolved.** Enquiries land in `jason@mypvip.com` (the address the
  Web3Forms key is registered to). `SPEC.md:123`, `:412` and the form's fallback text all say
  `admin@malaysiavisaguide.com`. Switching means a new key, not a text edit.
- **`SITE_ORIGIN` is stale** in `worker/wrangler.jsonc` — `https://malaysiavisaguide.pages.dev`.
  Harmless (news API is read at build time, server-side) but wrong, and it is passed into the
  dashboard HTML.
- `CF_ANALYTICS_TOKEN` still unset, so the dashboard traffic panel is dark. Jason's to do
  (a credential).

## Files & Folders Touched
- `src/components/ContactForm.tsx` — Web3Forms response handling, focus state, error icon.
- `.env.local` — created, gitignored, holds the Web3Forms key. Machine-local only: a fresh
  clone builds the dead-fallback page with no error.
- `worker/wrangler.jsonc` — zone routes + `workers_dev: true`. Stale `SITE_ORIGIN` lives here.
- `worker/src/news.ts` — sectors, per-sector budgets, `isRecent`, `findAlternateSources`,
  headline-overlap matching, `UNREADABLE_HOSTS`.
- `worker/src/article.ts` — alternate-source fallback in `writeArticle`; `WrittenArticle`
  gained `sourceUrl`/`sourceName`; `generateAndStore` persists the reassigned citation.
- `worker/src/extract.ts` — read only. `MIN_USABLE_CHARS = 400` is what flags a JS shell.
- `src/lib/news.ts` — `NewsCategory`, `CATEGORY_LABEL`, `CATEGORY_GUIDE` gained `world`.
- `SPEC.md` — read only; §7 "Still needs Jason", §8 verification steps.

## Decisions Made
- **Routes, not a Custom Domain**, for `/dashboard`. A Custom Domain claims every path on the
  hostname and would take the Pages site down. Pages cannot serve non-root routes at all.
- **Access scoped to exact paths**, never the bare apex — that would put the public site
  behind a login. Added to the existing app to keep the AUD stable.
- **`workers_dev: true` must stay explicit.** Adding `routes` makes wrangler default it to
  `false`, which silently killed the workers.dev host that `site.newsApi` still fetches at
  build time. Caught on the deploy warning; commented in the config.
- **Calendar year, not a rolling window**, at Jason's request. Known cliff: on 1 Jan the queue
  goes silent. A rolling 365-day window is equivalent for the rest of 2026 with no cliff —
  offered twice, not taken. Recorded in the commit body.
- **Citation follows the source actually read.** Non-negotiable: attributing a quote to a
  publication we never opened is a fabricated citation.
- **Headline overlap ≥ 0.55** gates alternates, measured against the shorter headline. Strict
  on purpose — writing about a different story than the one approved is worse than publishing
  nothing. Verified it correctly *refuses* on one of three test cases.
- **MSN/Yahoo/Flipboard excluded as alternates but kept at ingest** — JS shells (~3 chars) so
  unreadable, but fine pointers to a readable outlet.
- **Age gate is not retroactive** — guards ingest only; already-published stale articles are
  untouched by design.
- Observability MCP tool cannot deserialize this Worker's logs (its own schema bug). Query
  `POST /accounts/{id}/workers/observability/telemetry/query` via the Cloudflare API tool
  instead — that works.

## Next Step
Decide The Star fix: check whether the Cloudflare account has Workers Paid / Browser
Rendering (`/accounts/{id}/browser-rendering/limits` and `/workers/subscription` were not
routable with the MCP token). If yes, add a Browser Rendering fallback in
`worker/src/extract.ts` for the 403 and JS-shell cases; if no, trial `r.jina.ai` as a free
text-extraction proxy. Then re-run `POST /api/admin/write-next` for the two unwritten Star
items.
