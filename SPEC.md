# malaysiavisaguide.com — Build Spec (v1.2)

**Status:** built and deployed to `malaysiavisaguide.pages.dev` — domain not yet cut over
**Written:** 2026-07-22 · **Revised:** 2026-07-25
**Audience:** Jason, and any future Claude session picking this up cold
**Supersedes:** `WEBSITE-BLUEPRINT.md` (June 2026) *for the v1 build only*. That document
remains the strategic north star for later phases — positioning, monetisation sequencing,
the 9-pillar architecture, the 12-month roadmap. It is not edited or obsoleted. Where the two
disagree on stack or v1 scope, **this file wins**, and the two disagreements are deliberate:
the blueprint said WordPress (now Next.js) and specced a broad retiree/HNW authority site
(v1 narrows to long-stay visas plus the two work/study passes).

### What changed in v1.2 (2026-07-25)

1. **§4.3 Design is rewritten, and this is the third direction.** The site now wears the
   champagne-and-gold visual language of `connectinasia.com`. The v1.0 rainforest-green
   palette and the navy "eVISA portal" restyle that briefly replaced it are both dead —
   do not resurrect either from this file's history.
2. **`/news/` added to §3.** It was shipped and never specced. It is fed by a Cloudflare
   **Worker backend in `worker/`** which §4.2 also failed to mention — a whole subsystem
   that deploys separately from the Pages site.
3. **Analytics moved out of §9.** Cloudflare Web Analytics is live, cookieless, and
   deliberate; "no analytics in v1" is no longer true.
4. **§8 Verification corrected** — it referenced 11 routes (there are 14) and an
   `npm run preview` script that does not exist.

### What changed in v1.1 (2026-07-23)

1. **Stack is Next.js 16, not SvelteKit.** v1.0 §4.2 specced SvelteKit; the scaffold that
   actually shipped is Next.js 16 static export. The shipped code wins. §4.2 is rewritten.
2. **Two work/study passes added to scope** — Student Pass and Employment Pass / PVP.
   Tourist / eVisa / visa-on-arrival remain explicitly out.
3. **Domain cutover is in scope**, no longer deferred. Nameservers move to Cloudflare —
   see §10. The whole point is publishing without WordPress in the path.
4. **Personal branding:** neutral resource now, Jason visible as author and reviewer on
   every page; a Jason-forward brand layer (newsletter, video, first-person commentary)
   is a later phase.

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

`https://malaysiavisaguide.com` serves this site over Cloudflare. Six researched guides, a
working eligibility checker, cost calculator, comparison table, and an enquiry form
delivering to `admin@malaysiavisaguide.com`. WordPress is dark and out of the publishing
path. **Email still works** — see §10.

---

## 2. Decisions on record

| Decision | Choice | Why |
|---|---|---|
| Audience | Neutral public / SEO resource | Independence earns citations a branded site can't |
| v1 scope | Four long-stay programmes + Student Pass + Employment Pass/PVP | Where Jason has practitioner authority; where it converts |
| Interactive | Eligibility checker, cost calculator, comparison table, enquiry form | All four; the quiz is the highest-value asset |
| Stack | Next.js 16 static export + Cloudflare Pages + GitHub | Site is ~static; static HTML is the best possible substrate for SEO and AI crawlers |
| Go-live | Cloudflare `*.pages.dev` first | Shareable immediately, zero DNS risk, WP untouched |
| Domain cutover | In scope — §10 | Nameservers move to Cloudflare; the domain carries live mail, so order matters |
| Publishing | Manual `wrangler pages deploy` — and `worker/` deploys separately | Nothing goes live on its own; no git-triggered builds. `git push` is **not** a deploy |
| Form delivery | Web3Forms → `admin@malaysiavisaguide.com` | No API keys, no DNS records, no account — working in minutes |
| Language | English only | Chinese first when localisation comes, per blueprint §3 |
| Content | Researched, verified against official sources, reviewed by Jason | See §6 |
| Repo root | `~/Claude/Projects/malaysiavisaguide/` | This file lives at its root and is committed |

---

## 3. Pages

| Route | Content |
|---|---|
| `/` | Hero + promise card · "which route is yours?" router — three long-stay cards, three work/study cards · freshness band carrying the last-reviewed date · tools row · closing CTA |
| `/news/` | Curated Malaysia visa news, hydrated client-side from the `worker/` backend's public `/api/news`. Every item is summarised, source-linked, and hand-approved before it appears |
| `/visas/pvip/` | Premium Visa Programme — full guide |
| `/visas/mm2h/` | MM2H — Silver / Gold / Platinum tiers |
| `/visas/sarawak-mm2h/` | S-MM2H — the cheapest serious long-stay route |
| `/visas/de-rantau/` | DE Rantau Nomad Pass |
| `/visas/student-pass/` | Student Pass — EMGS, institution sponsorship, duration, renewal |
| `/visas/employment-pass/` | Employment Pass I/II/III + Professional Visit Pass, dependants |
| `/compare/` | Side-by-side: cost, tenure, deposit, property, stay requirement, dependants, work rights. Long-stay and work/study tabbed separately — deposit-vs-salary comparison across the two is meaningless |
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

This is the **information order**, and it is fixed. How it is *dressed* is §4.3's business
and has changed twice; the order has not, and a restyle is not licence to reorder it. Items
1–2 stay above the page's own sections so the answer and the figures are reachable without
scrolling, and item 8 never ships absent.

---

## 4. Architecture

### 4.1 The decision that matters most: one typed data source

`src/lib/data/programmes.ts` is the **sole source of truth** for every number on the site.
Four consumers read from it: guide pages, comparison table, eligibility quiz, cost calculator.

When a rule changes — and Malaysian visa rules change often — Jason edits one file and the
whole site updates consistently. The failure mode being designed out is hardcoding RM figures
into four places, publishing contradictory numbers, and destroying the accuracy that is this
site's only real asset. A wrong fee is worse than a missing page.

The four long-stay programmes are deposit-gated; the Student and Employment passes are
**sponsor-gated** — no fixed deposit, no property minimum, but an institution or employer
must back the application. Rather than force them into deposit-shaped fields, the type
carries a `category` discriminant plus `sponsor` and `salaryFloor`.

```ts
export type Programme = {
  slug: 'pvip' | 'mm2h-silver' | 'mm2h-gold' | 'mm2h-platinum' | 'smm2h' | 'de-rantau'
      | 'student-pass' | 'employment-pass';
  name: string;
  category: 'long-stay' | 'work-study';
  authority: string;                    // MOTAC, Immigration, Sarawak Immigration, MDEC, EMGS, ESD
  sponsor: string | null;               // institution (EMGS) or employer (ESD) — work-study only
  salaryFloor: Money | null;            // EP I/II/III thresholds
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

- **Next.js 16 / React 19**, App Router, TypeScript
- **Fully static export** — `output: "export"` in `next.config.ts`, with
  `trailingSlash: true` (routes are written `/visas/pvip/`) and
  `images: { unoptimized: true }` (no optimisation server exists in a static export).
  Build output lands in `./out`.
- Static HTML: best achievable Core Web Vitals, and AI crawlers hit real content rather
  than a JS shell.
- **Deploy:** `wrangler pages deploy out --project-name=malaysiavisaguide`. No adapter, no
  Worker, no `wrangler.jsonc` — the Pages project serves `out/` as static assets.
- **Tailwind v4** via `@tailwindcss/postcss`
- Quiz, calculator and comparison table are **client components** (`"use client"`)
- Contact form posts client-side to Web3Forms; key in `.env.local` as
  `NEXT_PUBLIC_WEB3FORMS_KEY`

**There is a second deployable: `worker/`.** The Pages site is static, but it is not the
whole system. The `mvg-news` Worker (`https://mvg-news.jason-6bf.workers.dev`) runs a daily
cron that fetches Malaysia visa news, summarises each item with Workers AI, and queues it in
D1; a Cloudflare Access–locked `/dashboard` where Jason approves the queue; and a public
`/api/news` the site's `/news` page reads at runtime.

⚠️ **It deploys separately.** `wrangler pages deploy out` does **not** touch it —
`cd worker && npx wrangler deploy` does. IDs, bindings and the model live in
`worker/wrangler.jsonc`; the runbook is `worker/README.md`. Read those rather than
reconstructing values from memory.

⚠️ **Next.js 16 has breaking changes versus training data** — see `AGENTS.md`. Read the
relevant guide in `node_modules/next/dist/docs/` before writing framework code, and pull
Tailwind v4 docs via Context7.

### 4.3 Design

**Third direction, and the two before it are dead.** v1.0 specced deep rainforest green +
warm sand + hibiscus; that was replaced on 2026-07-24 by a navy/pale-cyan echo of the
official eVISA portal; both were superseded on 2026-07-25. Neither should be resurrected
from this file's history. The live tokens in `src/app/globals.css` are the truth — this
section describes them, it does not compete with them.

**Reference:** `connectinasia.com`, the Korean-language MYPVIP partner site. The *look* is
borrowed; the identity never is — no CONNECT IN ASIA or MYPVIP wordmark, no Immigration
Department crest, never the word "official" (§1).

- **Palette:** ivory and champagne surfaces, a metallic gold accent, espresso near-black
  type. Warm throughout; there are no cool tones left on the site.
- **Tokens are ROLE-named, not hue-named**, and the names are inherited from v1:
  `forest-*` is the bronze→espresso primary, `sand-*` the ivory/champagne surfaces,
  `hibiscus-*` the gold CTA. **Read them by role, never by hue.** This one convention is
  why two complete restyles have landed without editing a single guide, table, quiz or
  calculator — it is the design equivalent of §4.1 and worth defending just as hard.
- **Two gold gradients, not one.** `--gradient-gold` lights a *fill* (pill, badge), where
  dark text sits on the pale highlight. `--gradient-gold-text` runs darker at both ends,
  because that same pale highlight is illegible as *type* on ivory. Reusing the fill ramp
  on text is a mistake already made once.
- **Type:** Plus Jakarta Sans throughout — body, UI, and headings at 800. Playfair Display
  italic is reserved for the single gold accent word per card. The v1.0 "editorial serif
  headlines" rule is dead: headings are the heavy sans, the serif is an accent only.
- **19px base, high contrast, generous line height, no thin grey text.** The reader is 45+,
  wealthy, and scam-alert. Readability is a genuine competitive differentiator here —
  competitors ignore it — not decoration. **4.5:1 is a floor, and it is audited rather than
  assumed** (§8) — the palette change put one element under it.
- **Signature devices**, all `@utility` in `globals.css`: `gold-text`, `gold-fill`,
  `eyebrow`, `card-lux`, `diamond-rule`, `ring-decor` — plus `full-bleed` (escape the
  centred column) and `rise` (motion-safe entrance). Compose these before inventing more.
- **Guide pages** follow `connectinasia.com/mm2h`: a full-bleed photo hero with the title
  over it, centred section headings, and content cards staggered left/right. This is the
  **only** place on the site where text sits over a photo — `<Figure>` refuses to do it
  anywhere else, on purpose. The template's information *order* (§3) is unchanged.
- **Original photography, no stock skylines.** Assets are WebP, sized per slot — see
  `docs/IMAGES.md`. A static export emits **no `srcset`**, so the file you ship is the file
  a phone downloads; size to how it actually renders.
- Trust furniture (author credentials, review dates, sources, disclosure) is **conversion
  infrastructure** for this audience, not garnish.

Load the `frontend-design` skill before inventing new UI — but match what already exists
first; the system above is coherent and a one-off will read as a mistake.

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
1. ~~**Scaffold**~~ — ✅ done 2026-07-22. Next.js 16, Tailwind v4, static export, all 11
   routes stubbed, repo `jasonyapks/malaysiavisaguide`, live on `malaysiavisaguide.pages.dev`
2. **Data layer** — research, verify against official sources, write `programmes.ts`
3. **Design system** — layout, header/footer, type scale, palette, guide-template components
4. **Guide pages** — home, six programme guides, about, editorial policy
5. **Interactive** — comparison table → cost calculator → eligibility quiz (all read `programmes.ts`)
6. **Contact form** — Web3Forms, honeypot, success/error states
7. **SEO** — sitemap, robots, JSON-LD, meta/OG
8. **Domain cutover** — §10

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
| **Student Pass** | EMGS-processed, institution-sponsored · no deposit · tied to course duration |
| **Employment Pass** | EP I / II / III salary tiers · employer-sponsored via ESD · dependants vary by tier |

**Every figure above must be verified against an official source before publishing** —
`mm2h.motac.gov.my`, `imi.gov.my`, Sarawak Immigration, MDEC, `educationmalaysia.gov.my`
(EMGS), `esd.imi.gov.my` — with the official URL recorded in the `source` field. **Anything that cannot be confirmed officially is flagged for Jason
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
- **Fact review** — the key-facts card on each of the six guides
- **Registrar access** — the nameserver change in §10c is Jason's click
- **Repo visibility** — public or private (public suits a neutral resource; the content is the
  product, not the code)

---

## 8. Verification

1. `npm run build` — clean, every route prerenders without warnings
2. `npm run dev` — walk all 14 routes (there is no `preview` script; the alternative is
   `npx serve out` against the built export)
3. **Drive it in Chrome via MCP.** Run the quiz through three profiles — a 30-year-old on
   USD100k, a 60-year-old retiree on USD40k, an HNW family — and confirm each recommendation
   matches what `programmes.ts` says. Run the calculator against PVIP and MM2H Gold and check
   the arithmetic by hand.
4. Submit the contact form with test data — **confirm the email actually lands in
   `admin@malaysiavisaguide.com`.** Not "the form submitted successfully."
5. **Lighthouse via chrome-devtools MCP, against the deployed URL, on mobile.** Target
   100 on SEO, accessibility and best practices; contrast passes. Audit the *deployed*
   site, not localhost — the analytics beacon fails CORS on `localhost` and costs 4 points
   of best practices there, which reads as a real defect and is not one. Accessibility is
   the audit that earns its keep: it has already caught an invalid `<dl>` that broke the
   FAQ for screen readers, and a contrast failure introduced by a palette change
6. View source on a guide page — real content in the HTML, not a JS shell
7. Fetch the deployed `*.pages.dev` URL; confirm `/sitemap.xml` and `/robots.txt` serve
8. Cross-check every number on `/compare/` against its `source` URL

---

## 9. Explicitly not in v1

Tourist / eVisa / visa-on-arrival / social-visit-pass content · the Jason-forward brand
layer (newsletter, video, first-person commentary) · Chinese / Japanese / Korean
localisation · the blueprint's healthcare, where-to-live, property, money and education
pillars · country comparison pages (Malaysia vs Thailand et al.) · email capture ·
the Malaysia Retirement Index.

All land on this same codebase later. Nothing in v1 forecloses any of them.

**Analytics came in anyway, deliberately.** v1.0 excluded it; Cloudflare Web Analytics
now ships in the root layout — cookieless, no cross-site tracking, token public by design.
It is the exception, not a precedent for the rest of this list.

---

## 10. Domain cutover

**The one step that can break something already working: the domain carries live mail.**
`admin@malaysiavisaguide.com` and anything else on the domain routes through mschosting.
Order matters, and two of the traps are silent.

### 10a. Build the Cloudflare zone *before* switching anything

Add the domain to Cloudflare and hand-enter every record below. Cloudflare's automatic
scan misses records; do not trust it. Verify with `dig @<cloudflare-ns> …` while the
domain is still resolving from mschosting.

| Type | Name | Value | Proxy |
|---|---|---|---|
| MX 0 | `@` | `mx3.mschosting.online` | — |
| MX 0 | `@` | `mx4.mschosting.online` | — |
| MX 10 | `@` | `mail.malaysiavisaguide.com` | — |
| A | `mail` | `103.6.196.47` | **DNS only** |
| A | `webmail` | `103.6.196.47` | **DNS only** |
| TXT | `@` | `v=spf1 ip4:103.6.196.47 include:se.mschosting.online -all` | — |
| TXT | `default._domainkey` | existing DKIM `p=` value | — |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; adkim=s; aspf=s` | — |

Captured from the live zone 2026-07-23. The DKIM record is published as two quoted
strings and must be re-entered as one concatenated value.

**Trap 1 — `mail` and `webmail` must stay grey-cloud.** Proxying a mail host through
Cloudflare breaks SMTP, and it fails silently: nothing errors until someone mentions a
bounced email days later.

**Trap 2 — drop `+a` from SPF.** The live record is
`v=spf1 +a +mx ip4:103.6.196.47 include:se.mschosting.online -all`. `+a` authorises
whatever the apex A record points at — which becomes Cloudflare's proxy IPs after cutover.
The explicit `ip4:103.6.196.47` already covers the real mail server, so `+a` goes.

### 10b–10f. Sequence

- **10b** Attach apex and `www` to the Pages project:
  `wrangler pages domain add`. Cloudflare writes the proxied records itself.
- **10c** Switch nameservers at the registrar. Rollback is pointing NS back at
  `ns1–4.mschosting.cloud`; the WordPress box stays up and untouched throughout.
- **10d** Redirects via `public/_redirects`: `/pvip/` → `/visas/pvip/` (301, the one legacy
  URL with any equity); `/sample-page/` → `/` .
- **10e** Flip `site.url` in `src/lib/site.ts` from the `pages.dev` URL to
  `https://malaysiavisaguide.com` — that single constant feeds canonicals, sitemap and OG
  tags — then rebuild and redeploy.
- **10f** Leave WordPress running but unreferenced for two weeks before asking the host to
  decommission it. Cheap insurance.

### Post-cutover checks (before calling it done)

Send a test email **to and from** `admin@malaysiavisaguide.com`. Confirm MX, SPF, DKIM and
DMARC all resolve from the Cloudflare nameservers. Confirm `/pvip/` 301s and that
`/sitemap.xml` and `/robots.txt` serve on the real domain.
