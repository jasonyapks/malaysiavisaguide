# mvg-news — news pipeline + private dashboard

A self-contained Cloudflare Worker that (1) fetches Malaysia visa news on a daily
schedule, summarises each item with Workers AI into a **pending** queue, (2) serves
a **private dashboard** (Cloudflare Access, locked to Jason) to approve/reject and
view site traffic, and (3) exposes a **public** `/api/news` of approved items that
the site's `/news` page reads.

The public marketing site stays a static export on Cloudflare Pages — untouched.

```
Cron ──► Google News RSS ──► Workers AI summary ──► D1 (pending)
                                                       │  approve in dashboard
                                                       ▼
/news page ◄── GET /api/news (public) ◄────────── D1 (approved)
Dashboard  ◄── /dashboard + /api/admin/* (Cloudflare Access, only Jason)
Traffic    ◄── Cloudflare Web Analytics (GraphQL API)
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

### 5. Site traffic — Cloudflare Web Analytics
- **Zero Trust/Analytics → Web Analytics → Add a site** for the site hostname
  (`malaysiavisaguide.pages.dev`, later the custom domain). Copy the **site tag**.
- Add the beacon to the site so visits are counted — in
  `src/app/layout.tsx`, just before `</body>`, add (token is public, safe to commit):
  ```tsx
  <script
    defer
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token":"YOUR_SITE_TAG"}`}
  />
  ```
- Put the account id + site tag into `wrangler.jsonc` `vars`
  (`CF_ACCOUNT_ID`, `WEB_ANALYTICS_SITE_TAG`).
- Create an API token (**My Profile → API Tokens → Create → Account Analytics: Read**)
  and store it as a secret (never in the repo):
  ```bash
  npx wrangler secret put CF_ANALYTICS_TOKEN
  ```
```bash
npx wrangler deploy
```

### 6. Point the site at the feed
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
3. **Site traffic**: visits, page views, top pages and countries for 7/30/90 days.

## Config reference (`wrangler.jsonc` vars / secrets)
| Key | What |
|---|---|
| `SITE_ORIGIN` | Site origin allowed to call `/api/news` (CORS) |
| `TEAM_DOMAIN` | `https://<team>.cloudflareaccess.com` |
| `POLICY_AUD` | Access application AUD tag |
| `CF_ACCOUNT_ID` | Cloudflare account id |
| `WEB_ANALYTICS_SITE_TAG` | Web Analytics site tag |
| `SUMMARY_MODEL` | Workers AI model for summaries |
| `CF_ANALYTICS_TOKEN` | **secret** — API token, Account Analytics: Read |

## Tuning
- **Feeds / search queries**: edit `FEEDS` in `src/news.ts`.
- **Schedule**: `triggers.crons` in `wrangler.jsonc`.
- **Per-run cap**: `PER_RUN_LIMIT` in `src/news.ts` (controls AI calls/sweep).
