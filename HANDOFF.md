# Handoff

## What & Why

Turned `/news` on malaysiavisaguide.com from a client-hydrated list of links into a real
blog: one prerendered page per story, carrying an **original article written on this site**
rather than the publisher's text. Goal is SEO — the old feed rendered nothing into the HTML,
so it could not rank; and readers bounced to the publisher instead of staying.

Read `SPEC.md` (now v1.3) first — it is the project's source of truth.

## Done

- **Shipped and live** on `malaysiavisaguide.pages.dev`. Repo pushed: commit `010f077` on
  `main`, tree clean.
- **Worker (`mvg-news`) deployed**, migration 002 applied to **remote** D1 (19 rows intact,
  8 columns added).
- Two-stage pipeline: cheap model (`llama-3.2-3b`) triages the daily sweep; large model
  (`gpt-oss-120b`) writes the article **on approval only**.
- Dashboard: shows the generated draft before publish, plus Edit / Rewrite / "Write missing
  articles" backfill.
- Site: `/news/` index + `/news/<slug>/` pages, `NewsArticle` + `BreadcrumbList` schema,
  canonical, OG article tags, sitemap entries.
- Styled 404 page (Next's default is black — looked like a crash against the champagne
  palette).
- `public/_redirects` — legacy `/pvip/` → `/visas/pvip/`, both slash forms. Verified live.
- **2 articles live**, both verified 200: `pm-calls-for-crackdown-on-visitor-and-student-visa`,
  `sarawak-mm2h-records-over-800-approvals-education-drives-growth`.

## Remaining

- **4 of 7 backfilled items have unreadable sources** (paywall / bot block). They sit in D1
  as `status='approved'` with `slug IS NULL`, so the API filters them out. Only fix is
  pasting a readable version of each into the dashboard's manual-add box.
- **No recency filter on the sweep.** A Jan-2022 Bernama article surfaced in the queue
  looking identical to today's news, and its content contradicted the site's own current
  PVIP figures. Jason agreed to drop it. Proposed but NOT built: an age warning at approval
  time for sources older than ~6 months.
- Unrelated, still open from before this session: Web3Forms key (contact form is in
  email-fallback mode), and the domain cutover (SPEC §10 — Cloudflare zone not yet created).

## Files & Folders Touched

- `worker/schema-002-articles.sql` — migration; already applied to remote D1, do not re-run blind
- `worker/src/extract.ts` — fetches + extracts source article text (model input only, never stored/rendered)
- `worker/src/article.ts` — writes the article, validates model output, slugs; **read its header comment for the copyright reasoning**
- `worker/src/index.ts` — `/api/news`, `/api/news/<slug>`, approve/regenerate/PATCH, `write-next` backfill
- `worker/src/dashboard.ts` — draft review, editor, backfill button
- `worker/src/types.ts`, `worker/wrangler.jsonc` — `ARTICLE_MODEL` added
- `src/lib/news.ts` — build-time data layer; throws rather than shipping an empty `/news`
- `src/app/news/[slug]/page.tsx` — the article page + schema
- `src/app/news/page.tsx` — prerendered index (replaced deleted `NewsFeed.tsx`)
- `src/app/not-found.tsx`, `src/app/sitemap.ts`, `src/components/Byline.tsx` (date now optional)
- `public/_redirects`, `.gitignore` (added `.wrangler/`), `SPEC.md` (v1.3)

## Decisions Made

- **Never reproduce publisher text.** It's an infringement *and* a duplicate-content signal
  that hands the ranking back to the original publisher — it loses twice. We write our own
  article, keep one attributed quote, link out. Jason was told this up front and agreed.
- **If the source can't be read, publish nothing.** Never write from a headline alone;
  an invented article is the one unrecoverable failure for a site selling checked figures.
- **Expensive model runs on approval, not ingest** — one call per published page.
- **Articles publish on deploy, not on approval** (static export). Approving only writes D1.
- **A static export cannot build a dynamic route with zero paths** — so the build now
  requires ≥1 published article. `src/app/news/[slug]/page.tsx` throws an explanatory error
  instead of Next's misleading "missing generateStaticParams".
- `cache: "no-store"` is unusable here (forces dynamic rendering); freshness comes from a
  per-build cache-busting `?b=` param instead.
- Jan-2022 Bernama PVIP article set to `status='rejected'` in D1 — reversible, not deleted.

## Next Step

Add the recency warning to the news pipeline: surface the source's age in the dashboard
queue and warn before publishing anything older than ~6 months. `published_at` is already on
every row; the render is `renderItem()` in `worker/src/dashboard.ts`. Deploy with
`cd worker && npx wrangler deploy` (does **not** need a site rebuild).

**Deploy commands, for reference — both are approval-gated, ask Jason first:**
- Site: `npm run build && npx wrangler pages deploy out --project-name=malaysiavisaguide`
- Worker: `cd worker && npx wrangler deploy`
- Build the blog without deploying: `NEWS_API_URL=http://localhost:8787/api/news npm run build`
