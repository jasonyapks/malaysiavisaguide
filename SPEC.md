# malaysiavisaguide.com — Build Spec (v1)

**Status:** approved, not yet started
**Written:** 2026-07-22
**Audience:** Jason, and any future Claude session picking this up cold
**Supersedes:** `WEBSITE-BLUEPRINT.md` (June 2026) *for the v1 build only*. That document
remains the strategic north star for later phases — positioning, monetisation sequencing,
the 9-pillar architecture, the 12-month roadmap. It is not edited or obsoleted. Where the two
disagree on stack or v1 scope, **this file wins**, and the two disagreements are deliberate:
the blueprint said WordPress (now SvelteKit) and specced a broad retiree/HNW authority site
(v1 narrows to long-stay visas).

---

## 1. Why this exists

`malaysiavisaguide.com` currently serves a bare WordPress install — LiteSpeed/Plesk on a
Malaysian host, nameservers `mschosting.cloud`, IP `103.6.196.47` — containing exactly three
pages: `/`, `/pvip/`, and a leftover `sample-page`. It is a placeholder occupying a good domain.

The goal is to replace it with a genuinely useful, genuinely accurate guide to Malaysia's
long-stay visa programmes, built to be **cited** — by search engines, by AI assistants, and by
people deciding where to spend the next twenty years of their life.

### Positioning

**Neutral public resource. Independent of MYPVIP branding. Commercial relationship disclosed.
Soft lead-gen only.**

The independence is the entire strategy, not a legal nicety. A branded agency site cannot earn
the backlinks, press citations, or AI citations that a neutral reference earns, and it cannot
capture the 95% of researchers who are 6–24 months away from being visa-ready. The site must
cover DIY application honestly and be candid about downsides. Keep `mypvip.com` on transactional
and brand keywords; keep this site on informational keywords. Separate lanes, minimal
cross-linking.

Editorial authority comes from Jason: 1,000+ relocation cases, Chairman of the PVIP Agent
Association. That is unfakeable E-E-A-T and it should be visible on every page.

### Definition of done for v1

A content-complete visa site, publicly reachable on a Cloudflare `*.pages.dev` URL, with a
working eligibility checker, cost calculator, comparison table, and enquiry form delivering to
`admin@malaysiavisaguide.com`. The WordPress site stays untouched. Domain cutover is a separate
decision, deliberately deferred.

---

## 2. Decisions on record

| Decision | Choice | Why |
|---|---|---|
| Audience | Neutral public / SEO resource | Independence earns citations a branded site can't |
| v1 scope | Long-stay visa programmes only | Where Jason has practitioner authority; where it converts |
| Interactive | Eligibility checker, cost calculator, comparison table, enquiry form | All four; the quiz is the highest-value asset |
| Stack | SvelteKit + Cloudflare + GitHub | Site is ~static; static HTML is the best possible substrate for SEO and AI crawlers |
| Go-live | Cloudflare `*.pages.dev` today | Shareable tonight, zero DNS risk, WP untouched |
| Domain cutover | Deferred | Nameserver move is a 5-minute change once Jason is happy |
| Form delivery | Web3Forms → `admin@malaysiavisaguide.com` | No API keys, no DNS records, no account — working in minutes |
| Language | English only | Chinese first when localisation comes, per blueprint §3 |
| Content | Researched, verified against official sources, reviewed by Jason | See §6 |
| Repo root | `~/Claude/Projects/malaysiavisaguide/` | This file lives at its root and is committed |

---

## 3. Pages

| Route | Content |
|---|---|
| `/` | Hero + "which visa are you?" router · four programme cards · quick-compare strip · latest-changes box · CTA |
| `/visas/pvip/` | Premium Visa Programme — full guide |
| `/visas/mm2h/` | MM2H — Silver / Gold / Platinum tiers |
| `/visas/sarawak-mm2h/` | S-MM2H — the cheapest serious long-stay route |
| `/visas/de-rantau/` | DE Rantau Nomad Pass |
| `/compare/` | Side-by-side: cost, tenure, deposit, property, stay requirement, dependants, work rights |
| `/tools/eligibility/` | Quiz → qualifying programme(s) → soft CTA |
| `/tools/cost-calculator/` | Itemised first-year and total cost by programme + family size |
| `/contact/` | Enquiry form |
| `/about/` | Jason, credentials, **disclosed MYPVIP relationship** |
| `/editorial-policy/` | How content is researched, reviewed, and dated |

### Guide page template

Every programme guide follows the same shape, and the order is deliberate:

1. **Answer-first summary** — 40–60 words. Both AI Overviews and a skimming reader get the
   answer without scrolling.
2. **Key-facts data card** — screenshot-shareable, all figures from the data layer
3. **Requirements** — eligibility, financial, documentary
4. **Costs** — itemised, government vs agent vs deposit, clearly separated
5. **Process & timeline** — realistic, not brochure timelines
6. **Who it suits / who it doesn't** — the honest section; this is what makes the page citable
7. **FAQ** — phrased the way people actually ask, mirrored into FAQPage schema
8. **Last reviewed** — "Reviewed [date] by Jason Yap, Chairman, PVIP Agent Association"
9. **One contextual CTA** — exactly one, never a popup on first pageview

---

## 4. Architecture

### 4.1 The decision that matters most: one typed data source

`src/lib/data/programmes.ts` is the **sole source of truth** for every number on the site.
Four consumers read from it: guide pages, comparison table, eligibility quiz, cost calculator.

When a rule changes — and Malaysian visa rules change often — Jason edits one file and the
whole site updates consistently. The failure mode being designed out is hardcoding RM figures
into four places, publishing contradictory numbers, and destroying the accuracy that is this
site's only real asset. A wrong fee is worse than a missing page.

```ts
export type Programme = {
  slug: 'pvip' | 'mm2h-silver' | 'mm2h-gold' | 'mm2h-platinum' | 'smm2h' | 'de-rantau';
  name: string;
  authority: string;                    // MOTAC, Immigration, Sarawak Immigration, MDEC
  tenureYears: number;
  renewable: boolean;
  minAge: number | null;
  fixedDeposit: { amount: number; currency: 'MYR' | 'USD'; withdrawable?: string } | null;
  incomeRequirement: { amount: number; currency: 'MYR' | 'USD'; period: 'month' | 'year' } | null;
  propertyPurchaseMin: { amount: number; currency: 'MYR' | 'USD' } | null;
  participationFee: { principal: number; dependant: number; currency: 'MYR' | 'USD' } | null;
  minStayPerYear: string | null;
  workRights: 'full' | 'restricted' | 'none';
  dependants: string[];
  source: string;                       // official URL — every claim traceable
  lastVerified: string;                 // ISO date
};
```

Rule: **nothing renders a number that didn't come from this file.** If a figure has no
`source`, it doesn't ship.

### 4.2 Stack

- **SvelteKit 2 / Svelte 5** (runes), TypeScript
- **`@sveltejs/adapter-cloudflare`** — requires `wrangler.jsonc`:
  ```jsonc
  {
    "name": "malaysiavisaguide",
    "main": ".svelte-kit/cloudflare/_worker.js",
    "compatibility_flags": ["nodejs_als"],
    "compatibility_date": "2026-07-22",
    "assets": { "binding": "ASSETS", "directory": ".svelte-kit/cloudflare" }
  }
  ```
- **Fully prerendered** — `export const prerender = true` in `src/routes/+layout.ts`.
  Static HTML: best achievable Core Web Vitals, and AI crawlers hit real content rather than a
  JS shell. Server routes stay available later without an adapter change.
- **Tailwind v4**
- Quiz, calculator and comparison table are **client-side Svelte components** — no backend
- Contact form posts client-side to Web3Forms; key in `.env` as `PUBLIC_WEB3FORMS_KEY`

**Before writing framework code, pull current docs via Context7** — SvelteKit
(`/websites/svelte_dev_kit`) and Tailwind v4. Both move faster than training data.

### 4.3 Design

Load the `frontend-design` skill before building UI. Identity carries over from the blueprint:

- **Palette:** deep rainforest green + warm sand + one hibiscus accent
- **Type:** editorial serif headlines, humanist sans body
- **18–19px base, high contrast, generous line height, no thin grey text.** The reader is 45+,
  wealthy, and scam-alert. Readability is a genuine competitive differentiator here —
  competitors ignore it — not decoration.
- **Reference feel:** Kiplinger or Monocle. Never an affiliate farm.
- Original photography where possible. No stock skylines.
- Trust furniture (author credentials, review dates, sources, disclosure) is **conversion
  infrastructure** for this audience, not garnish.

### 4.4 SEO / GEO

- Prerendered HTML; `sitemap.xml` and `robots.txt` generated at build
- `robots.txt` **explicitly allows** `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`
- JSON-LD: `Article` + `FAQPage` + `BreadcrumbList` per page, `Organization` sitewide
- Answer-first openers; question-phrased H2s ("How much does PVIP actually cost in 2026?")
- Visible last-reviewed dates — AI citation decays sharply after ~3 months, so the date is
  functional
- Canonical discipline on comparison variants

---

## 5. Build order

Steps 1–4 are the critical path to something shareable. If the day runs short, the **quiz is
the last thing in and the first thing to defer** — highest value, but the guides are what make
the site real.

0. **`SPEC.md`** — this file. Committed with the initial repo so it ships beside the code it
   describes. Pointer note added in the blueprint folder so those docs don't read as orphaned.
1. **Scaffold** — `npx sv create`, adapter-cloudflare, Tailwind v4, prerender layout,
   `git init`, first commit
2. **Data layer** — research, verify against official sources, write `programmes.ts`
3. **Design system** — layout, header/footer, type scale, palette, guide-template components
4. **Guide pages** — home, four programme guides, about, editorial policy
5. **Interactive** — comparison table → cost calculator → eligibility quiz (all read `programmes.ts`)
6. **Contact form** — Web3Forms, honeypot, success/error states
7. **SEO** — sitemap, robots, JSON-LD, meta/OG
8. **Deploy** — `gh repo create`, push, `wrangler deploy`, live on `*.pages.dev`

---

## 6. Content research

Preliminary figures gathered 2026-07-22 from **secondary sources** — treat as a draft:

| Programme | Preliminary figures |
|---|---|
| **PVIP** | RM200k participation fee (principal), RM100k/dependant, RM1m FD, RM40k/mo income, 20-year term. Reported change 16 Mar 2026: RM50k dependant fee on a 10-year option; FD withdrawable after 6 months; net-worth or onshore-income qualification now permitted |
| **MM2H Silver** | USD150k FD · 5 years · RM600k property minimum |
| **MM2H Gold** | USD500k FD · 15 years · RM1m property minimum |
| **MM2H Platinum** | USD1m FD · 20 years · RM2m property minimum |
| **MM2H (all tiers)** | Min age 25 · licensed agent mandatory, no direct applications · up to 50% FD withdrawable from year 2 for property, medical, or education |
| **S-MM2H** | RM500k FD in a Sarawak bank · RM10k/mo income or RM100k liquid (single) / RM150k (couple) · 10 years renewable · 15 days/yr minimum stay · no property purchase · no age limit |
| **DE Rantau** | USD24k/yr foreign-sourced income · 12 months, renewable once |

**Every figure above must be verified against an official source before publishing** —
`mm2h.motac.gov.my`, `imi.gov.my`, Sarawak Immigration, MDEC — with the official URL recorded
in the `source` field. **Anything that cannot be confirmed officially is flagged for Jason
rather than published.**

Jason is the domain authority; the research is a draft for him to correct. He reviews the
key-facts card on each of the four guides before v1 is called done.

---

## 7. Environment & accounts

Verified 2026-07-22:

- Node v26.0.0 · npm 11.12.1 · git 2.50.1
- **`gh`** — `/opt/homebrew/bin/gh`, authenticated as **`jasonyapks`** (scopes `gist`,
  `read:org`, `repo`), https protocol
- **`wrangler`** — `/opt/homebrew/bin/wrangler`, OAuth as **jason@mypvip.com**, full write
  scopes including Workers and Pages

⚠️ **The GitHub identity (`jasonyapks`) is different from every other account (jason@mypvip.com).**
Check `gh auth status` before anything that depends on repo ownership. Both logins are already
done — **do not re-run the auth flows.**

Because both CLIs are authenticated, deployment is fully scriptable; no dashboard clicking
required.

### Still needs Jason

- **Web3Forms access key** — free, from web3forms.com using `admin@malaysiavisaguide.com`;
  arrives by email, no account needed
- **Fact review** — the key-facts card on each of the four guides
- **Repo visibility** — public or private (public suits a neutral resource; the content is the
  product, not the code)

---

## 8. Verification

1. `npm run build` — clean, every route prerenders without warnings
2. `npm run preview` — walk all 11 routes
3. **Drive it in Chrome via MCP.** Run the quiz through three profiles — a 30-year-old on
   USD100k, a 60-year-old retiree on USD40k, an HNW family — and confirm each recommendation
   matches what `programmes.ts` says. Run the calculator against PVIP and MM2H Gold and check
   the arithmetic by hand.
4. Submit the contact form with test data — **confirm the email actually lands in
   `admin@malaysiavisaguide.com`.** Not "the form submitted successfully."
5. Lighthouse via chrome-devtools MCP — performance and accessibility ≥ 95, contrast passes
6. View source on a guide page — real content in the HTML, not a JS shell
7. Fetch the deployed `*.pages.dev` URL; confirm `/sitemap.xml` and `/robots.txt` serve
8. Cross-check every number on `/compare/` against its `source` URL

---

## 9. Explicitly not in v1

Domain cutover and WordPress retirement · Chinese / Japanese / Korean localisation · the
blueprint's healthcare, where-to-live, property, money and education pillars · country
comparison pages (Malaysia vs Thailand et al.) · analytics and email capture · the Malaysia
Retirement Index.

All land on this same codebase later. Nothing in v1 forecloses any of them.
