# malaysiavisaguide.com

An independent guide to Malaysia's long-stay visa programmes — PVIP, MM2H, Sarawak MM2H,
DE Rantau — plus the Student Pass and Employment Pass routes.

Neutral public resource. Written and reviewed by Jason Yap, Chairman of the PVIP Agent
Association; the commercial relationship with MYPVIP is disclosed on every page. The
independence is the strategy, not a legal nicety — see `SPEC.md` §1.

**`SPEC.md` is the build spec and the document of record.** Read it before changing
anything. `AGENTS.md` carries a warning about Next.js 16 that is load-bearing.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript · fully static export ·
Cloudflare Pages.

No server, no database, no CMS. Every page is real HTML on disk — which is the point, for
both search engines and AI crawlers.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build

```bash
npm run build        # static export → ./out
```

## Deploy

Manual and deliberate — nothing goes live on its own.

```bash
npm run build
wrangler pages deploy out --project-name=malaysiavisaguide
```

`wrangler` is authenticated as jason@mypvip.com. Note the GitHub identity is different
(`jasonyapks`) — check `gh auth status` before anything that depends on repo ownership.

## The one rule

`src/lib/data/programmes.ts` is the **sole source of truth for every number on this site.**
Guide pages, the comparison table, the eligibility quiz and the cost calculator all read
from it.

Nothing renders a figure that didn't come from that file. Every entry carries a `source`
URL pointing at an official government page and a `lastVerified` date. **If a figure has
no source, it doesn't ship** — it goes to Jason as a question instead.

Malaysian visa rules change often. When one changes, that file is the only file that
changes. A wrong fee is worse than a missing page.

## Layout

```
src/app/               routes — one directory per page, trailing slashes
src/app/visas/         the six programme guides
src/app/tools/         eligibility quiz, cost calculator
src/components/        guide template, key-facts card, byline, FAQ
src/lib/site.ts        route table — feeds both the nav and the sitemap
src/lib/data/          the data layer (see above)
public/_redirects      legacy WordPress URLs
```

Adding a page means adding it to `routes` in `src/lib/site.ts`. Nav and `sitemap.ts` both
read that array, so a page can't be added to one and silently missed by the other.
