# mvg-news — news pipeline + private dashboard

A self-contained Cloudflare Worker that (1) fetches Malaysia visa news on a daily
schedule, summarises each item with Workers AI into a **pending** queue, (2) serves
a **private dashboard** (Cloudflare Access, locked to Jason) to write, edit and
approve those items and publish the site, and (3) exposes a **public** `/api/news`
of approved items that the site's `/news` page reads.

It is a content tool and nothing else — no analytics. Traffic is read in
Cloudflare Web Analytics and Google Analytics directly.

The public marketing site stays a static export on Cloudflare Pages — untouched.

```
Cron ──► Google News RSS ──► Workers AI summary ──► D1 (pending)
                                                       │  approve in dashboard
                                                       ▼
/news page ◄── GET /api/news (public) ◄────────── D1 (approved)
Dashboard  ◄── /dashboard + /api/admin/* (Cloudflare Access, only Jason)
```

Nothing is public until Jason approves it. Items store a short AI summary + the
source name and link — never the reproduced article. The page cites and links out.

---

## Provisioning (one-time) — all your clicks; I don't run these

Run from `worker/`. Wrangler is already logged in (the `jasonyapks` identity).

### 1. Install deps
```bash
cd worker
npm install --legacy-peer-deps
```

### 2. Create the D1 database
```bash
npx wrangler d1 create mvg-news
```
Copy the printed `database_id` into `wrangler.jsonc` → `d1_databases[0].database_id`
(replace `PLACEHOLDER_FILL_AFTER_D1_CREATE`). Then load the schema:
```bash
npm run db:remote        # applies schema.sql to the live D1
```

### 2b. Create the R2 bucket — the image store

**⚠️ R2 must be enabled on the account first, and only Jason can do it.** It is a
dashboard action: Cloudflare dashboard → R2 → enable/subscribe. There is no API
for it — `wrangler r2 bucket create` and the REST API both answer
`10042: Please enable R2 through the Cloudflare Dashboard` until it is done, and
**`wrangler deploy` will fail while the `ASSETS` binding points at a bucket that
does not exist.** The free tier covers this site's usage many times over; the
subscription still has to be accepted.

```bash
npx wrangler r2 bucket create mvg-assets
npx wrangler d1 execute mvg-news --remote --file=./schema-005-assets.sql
```

Then, once the Worker is deployed, seed and migrate:

```bash
node scripts/seed-assets.mjs --remote     # the 8 scene photos → site/<key>
curl -X POST https://malaysiavisaguide.com/api/admin/assets/migrate-news
```

The second one moves the base64 heroes out of `news_items.image_data` into R2. It
is idempotent, and `/api/news/:slug/image` keeps answering throughout — from D1
for a row not yet moved, from R2 for one that has been.

**Do not add a public custom domain or an `r2.dev` URL to this bucket.** Readers
never fetch from it; the build pulls the bytes into `public/images/cms/` and the
site serves them same-origin. See docs/IMAGES.md.

### 3. First deploy
```bash
npx wrangler deploy
```
Note the deployed URL, e.g. `https://mvg-news.<your-subdomain>.workers.dev`.
Workers AI (the `AI` binding) works on the free tier — no extra setup.

### 4. Lock the dashboard to you — Cloudflare Access (Zero Trust)
This is the "only I can access it" step. Access authenticates you at the edge; the
Worker also verifies the signed JWT as a second layer.

In the dashboard → **Zero Trust → Access → Applications → Add a self-hosted app**:
- **Application 1**: domain `mvg-news.<your-subdomain>.workers.dev`, **path** `dashboard`
- **Application 2**: same domain, **path** `api/admin`
- For each, add a policy: **Action = Allow**, **Include → Emails → `jason@mypvip.com`**.
- Leave `api/news` uncovered so the public feed stays reachable.

Then copy two values into `wrangler.jsonc` → `vars` and redeploy:
- `TEAM_DOMAIN` = `https://<your-team-name>.cloudflareaccess.com`
- `POLICY_AUD`  = the **Application Audience (AUD) tag** shown on the app's overview

```bash
npx wrangler deploy
```
Now visiting `/dashboard` prompts a Cloudflare login and only your email gets in.
(Until this is set, `/dashboard` returns 403 by design — fail-closed.)

#### As built (verified against the live account 2026-08-01)

The account ended up with the inverse arrangement, which is equivalent and fewer
moving parts: **one gated app covering the whole host, and bypass apps carving
out the public read paths.** Access matches the most specific application, so a
narrower bypass app wins over the host-wide Allow.

| App | Covers | Policy |
|---|---|---|
| `MVG Dashboard` | `mvg-news.…workers.dev`, `malaysiavisaguide.com/dashboard`, `malaysiavisaguide.com/api/admin/*` | Allow — `jason@mypvip.com` |
| `MVG Public API` | `mvg-news.…workers.dev/api/news` | Bypass — everyone |
| `MVG Build API` | `mvg-news.…workers.dev/api/cms`, `…/api/images` | Bypass — everyone |

`POLICY_AUD` in `wrangler.jsonc` is the **`MVG Dashboard`** AUD — that is the app
whose JWT the Worker verifies. The bypass apps have their own AUDs and are not
referenced anywhere in code.

**Every public read path the site's build fetches needs a bypass app.** Without
one the build machine gets a 302 to the login page, reads HTML where it expected
JSON, and stops — with an error that names the endpoint rather than the cause.
`MVG Build API` was added for exactly that reason when `/api/cms/*` (Phase 4) and
`/api/images/*` (Phase 3) landed. Path matching is by prefix, so
`/api/cms/insights/comparisons/some-slug` is covered by the `/api/cms` entry.

New Access applications take **up to a minute to propagate** — a 302 immediately
after creating one is not a misconfiguration, so re-test before changing anything.

### 5. Point the site at the feed
In `src/lib/site.ts`, set `site.newsApi` to
`https://mvg-news.<your-subdomain>.workers.dev/api/news`, then rebuild + redeploy
the Pages site (the usual `wrangler pages deploy out`). Also set the Worker's
`SITE_ORIGIN` var to the site's origin (for CORS) if it isn't the pages.dev default.

---

## Daily use
1. Open `https://mvg-news.<sub>.workers.dev/dashboard` (Access logs you in).
2. **News queue** → *Pending*: read each AI summary, **Approve** the good ones
   (they go live on `/news` immediately) or **Reject**. **Fetch latest now** runs a
   sweep on demand; the cron does it automatically every day at 09:00 MYT.
   Paste any article URL into the box to add it manually.
3. **Publish** → *Publish site*: rebuilds and deploys the Pages site, which is what
   makes everything approved above visible to a reader.

Nothing on `/news` changes until the site is rebuilt and deployed. Approving
writes to D1; `npm run build && wrangler pages deploy out --project-name=malaysiavisaguide`
is what publishes.

---

## Keying an article in yourself

For a source the pipeline cannot read — The Star 403s Worker egress, some pages
are paywalled, some are JavaScript shells. Open **Key the article in yourself**
under the URL box, fill in the source URL, publication, the publisher's headline
and a category, and paste the body of the story.

The pasted text is model input and nothing else. It is never published, never
served by the public API, and the page still cites and links the real source. Our
own article is written from it exactly as it would be from a page we fetched
ourselves, then the humanize pass runs over it automatically and the item lands
in the **Needs polish** tab.

If the sweep already filed that URL but never managed to write it, pasting
attaches your text to the row you already have rather than refusing — no delete
and re-key. If it filed it *and* wrote it, you get told where it lives; use
**Rewrite** on it instead.

If the write fails, the row survives in *Pending* with your text on it — hit
**Write article & publish** there to retry. You never have to paste it twice.

## The /humanizer loop

The Worker runs a condensed version of the `/humanizer` skill (`src/humanize.ts`)
on every manually keyed-in article, and on anything you press **Humanise** on. It
is deliberately the weaker of the two passes, so it flags what it touched
`polish_state = 'needs-claude'` and hands over to the real 412-line skill in a
Claude session:

```bash
node worker/scripts/pull-drafts.mjs          # → worker/.drafts/<id>.json
# run /humanizer:humanizer over the prose in each file
node worker/scripts/push-polish.mjs --all    # writes to D1, then builds and deploys
```

**Polishing publishes.** `push-polish.mjs` ends by building the site and
deploying it, because writing the row is not publishing — the static export
reads D1 at build time, so a polish that stops at the database is a polish
nobody can read. Pass `--no-deploy` to stage without going live, and
`npm run publish:site` to deploy later.

If any draft fails its checks the deploy is skipped entirely, even for the ones
that passed: half a queue live and half staged is not a state worth shipping.
Fix the draft it named and run the command again.

Both passes refuse a rewrite that lost or altered a figure — every number in the
draft has to survive into the edit, unchanged. `push-polish.mjs` checks the same
thing against the untouched copy `pull-drafts.mjs` kept, and writes nothing if a
number went missing. `source_excerpt` is never shown to either pass: it is a real
quotation from a publisher and rewriting it would put words in their mouth.

`Mark polished` in the dashboard clears the flag by hand, for an article that
needs no further work. It does **not** deploy — a Worker cannot run a Next.js
build, so the button stages and `npm run publish:site` publishes.

## Config reference (`wrangler.jsonc` vars / secrets)
| Key | What |
|---|---|
| `SITE_ORIGIN` | Site origin allowed to call `/api/news` (CORS) |
| `TEAM_DOMAIN` | `https://<team>.cloudflareaccess.com` |
| `POLICY_AUD` | Access application AUD tag |
| `CF_ACCOUNT_ID` | Cloudflare account id (used by `publish.ts` for the Pages API) |
| `SUMMARY_MODEL` | Workers AI model for summaries, and for describing an official-source change |
| `TRIAGE_MODEL_WORLD` | Larger model, world-sector triage only — the 3B could not tell a fee change from a listicle |
| `ARTICLE_MODEL` | Workers AI model that writes the article, and runs the humanize pass |
| `NEWS_API_ORIGIN` | This Worker's workers.dev origin, for dashboard image previews |
| `CF_PAGES_TOKEN` | **secret** — API token, Pages: Edit; the only secret this Worker holds |

## Bindings
| Binding | What |
|---|---|
| `DB` | D1 `mvg-news` — articles, and the `assets` metadata table |
| `ASSETS` | R2 `mvg-assets` — image bytes, `orig/` `hero/` `og/` |
| `AI` | Workers AI — summaries, the article writer, and `toMarkdown` for watched PDFs |
| `BROWSER` | Browser Run — the fallback reader in `extract.ts` and the watcher |

## Tuning
- **Feeds / search queries**: edit `FEEDS` in `src/news.ts`. Each carries a
  `region`; regions balance the world budget against each other.
- **Schedule**: `triggers.crons` in `wrangler.jsonc`.
- **Per-run cap**: `PER_RUN_LIMIT` in `src/news.ts` (controls AI calls/sweep), and
  `PER_REGION_LIMIT` inside the world half of it.
- **What gets rejected before any AI call**: `JUNK_TITLE` in `src/news.ts`.

---

## Official sources — the watcher

`src/watch.ts`, migrations 007 and 008, both applied to production 2026-08-02.

Every figure the site publishes cites an official page. The watcher reads those
pages daily (after the news sweep), and raises an event when one moves. It exists
because PVIP's terms changed and the site served the old numbers for four months:
no newspaper covered it, so no news sweep could have caught it.

- **The list is not maintained here.** `scripts/emit-figures.mjs` publishes the
  `source` URL of every programme into `public/figures.json`, and the watcher
  upserts a row per URL. The watched set is the cited set by construction.
- **PDFs are read, not just hashed.** `env.AI.toMarkdown` converts them, so a
  changed PDF produces a real diff and a real sentence about what moved. Over
  8 MB (MOTAC's guide is 37 MB) it falls back to cache validators and reports
  only that the file moved.
- **A row remembers every edition it has been served** (`seen_hashes`). The PVIP
  FAQ URL alternates between a September 2025 copy and a January 2026 copy,
  request by request — without this the panel would alert every other day.
- **Two actions per alert**: *Seen it* re-baselines, *Queue as news* pushes it
  into the pending queue with the diff as `source_text`, which the writer uses
  directly instead of trying to fetch a PDF.

```bash
npx wrangler d1 execute mvg-news --remote --file=./schema-007-watch.sql
npx wrangler d1 execute mvg-news --remote --file=./schema-008-watch-seen.sql
```
