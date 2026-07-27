# malaysiavisaguide.com — Build Spec (v1.4)

**Status:** live on `https://malaysiavisaguide.com` (cut over 2026-07-25)
**Written:** 2026-07-22 · **Revised:** 2026-07-26
**Audience:** Jason, and any future Claude session picking this up cold
**Supersedes:** `WEBSITE-BLUEPRINT.md` (June 2026) *for the v1 build only*. That document
remains the strategic north star for later phases — positioning, monetisation sequencing,
the 9-pillar architecture, the 12-month roadmap. It is not edited or obsoleted. Where the two
disagree on stack or v1 scope, **this file wins**, and the two disagreements are deliberate:
the blueprint said WordPress (now Next.js) and specced a broad retiree/HNW authority site
(v1 narrows to long-stay visas plus the two work/study passes).

### What changed in v1.4 (2026-07-26)

1. **§4.3 Design is on its FOURTH direction — "Cobalt sky".** Champagne-and-gold is dead;
   the site is now cobalt, navy, sky blue and slate on a cool near-white page. Jason chose
   the palette from a four-swatch board. Do not resurrect gold from this file's history.
2. **The signature utilities were renamed `gold-*` → `accent-*`.** Hue-named utilities were
   the one part of the token system that did *not* survive a restyle for free, and they are
   the reason this change touched eight component files rather than one. Fixed at the root.
3. **`on-navy` added.** The accent gradient and the eyebrow are calibrated dark-on-light and
   vanish on a `forest-900` panel; this utility re-points them at the sky end for a subtree.
4. **`public/og.png` regenerated** in the new palette. It was still the *v1* card (dark
   navy + hibiscus red, "MV" monogram) and had been stale through two restyles.
5. **Status corrected** — the domain cutover completed on 2026-07-25; §10 is history, not a
   plan. §10f (decommission WordPress after ~2026-08-08) is the only step outstanding.
6. **Jason's credential changed sitewide.** The PVIP Agent Association chairmanship is gone
   from every byline, `Person`/`Article` schema block and disclosure; the credential is now
   Managing Director of two licensed agencies. The case count drops from 1,000+ to **500+**.
   Both were his call. See §2 — do not reintroduce either.

### What changed in v1.3 (2026-07-25)

1. **`/news/` is a blog, not a link list.** Each approved story now gets its own
   prerendered page at `/news/<slug>/` carrying an original article written on this site,
   so a reader stays here instead of bouncing to the publisher. §3 and §4.2 rewritten.
   The client-hydrated feed it replaced could not rank — there was nothing in the response
   to rank.
2. **The news pipeline is two-stage.** A cheap model triages the sweep; a large one writes
   the article, and only on approval. See §4.2.
3. **A 404 page exists.** `src/app/not-found.tsx` — Next's default is black, which read as
   a crash against the champagne palette, and 404s are now reachable by way of stale
   `/news/` links.
4. **`public/_redirects` shipped** — §10d's legacy `/pvip/` redirect, in both slash forms,
   which is what Pages actually needs.

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

Editorial authority comes from Jason: 500+ relocation cases, Managing Director of two
licensed Malaysian long-stay visa agencies. That is unfakeable E-E-A-T and it should be
visible on every page. **The PVIP Agent Association chairmanship is not used on this site**
— Jason removed it from every byline, schema block and disclosure on 2026-07-26. Do not
reintroduce it, and do not restore the "1,000+" figure it used to sit beside.

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
| `/news/` | Blog index — every published story as a card linking to its own page. Prerendered at build time from the `worker/` backend's `/api/news` |
| `/news/<slug>/` | One page per story. An **original article written on this site** about the news — key points, 2–4 sections, "what it means for an applicant" — with one attributed quote and a followed link to the source. Prerendered; `NewsArticle` + `BreadcrumbList` schema |
| `/insights/` | Index of Jason's own authored articles — evergreen, first-person, separate from `/news/` because news is perishable and these are the pages meant to be cited. **Built 2026-07-27, not launched** — see the launch checklist in `src/lib/data/insights.ts` |
| `/insights/<category>/` | Category index. Four categories: `comparisons`, `by-nationality`, `expat-living`, `perspective`. A category page is created when its first article lands, never in advance |
| `/insights/<category>/<slug>/` | One authored article. Category is in the URL by Jason's decision (2026-07-27) — keyword-bearing path and a free breadcrumb, at the cost of the URL changing if an article is recategorised. All literal folders, no dynamic segments; `Article` + breadcrumb schema |
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

**Header nav — four labelled dropdowns**, left to right: *Long-stay visas*, *Work & study*,
*Tools & compare*, *Insights & news*. The order is a funnel — what the programmes are, then
help deciding, then what is being written about them. Routes carrying `nav: "site"` (About,
Editorial policy, Contact) are the exception: the header skips them and the footer renders
them.

`SiteNav.tsx` names no route. Every group and link comes from `navGroups` and `routes` in
`lib/site.ts`, so a new section is added by editing the route table and nothing else. This
was learned the hard way on 2026-07-27: News had been a hardcoded link written twice into
the component, and `/insights/` shipped with `nav: "site"` and therefore no header slot at
all — invisible on the live site until someone went looking for it.

### 4.3a Type scale and card weights (2026-07-27)

**Nine role-named type steps**, defined as `clamp()` in `globals.css`:
`--text-eyebrow` · `caption` · `body-sm` · `body` · `lead` · `h3` · `h2` · `h1` · `display`.
They replaced **27 distinct hardcoded sizes across 29 files**, of which only 17 had any
responsive variant — so a 390px phone was rendering sizes chosen for a 1440px laptop, and
every page inherited that independently. `--text-base` is now `--text-body`, fluid rather
than a flat 19px.

Named by role, never by size, for the same reason the colours are: `--text-lead` can be
recalibrated for mobile without renaming anything. **If a size is not one of the nine, it
does not ship** — and never pair two of them across a breakpoint (`text-h2 sm:text-h1`),
because stacking two clamps reintroduces the jump they exist to remove.

**Three card weights**, replacing the single `card-lux` that was used 15 times across 10
files: `card-flat` (tinted, most content), `card-outline` (hairline, grouped data),
`card-lux` (raised — rationed to the Key Facts card and the homepage trust panel). Elevation
only means "look here" if most things are not elevated.

**One table component**, `components/DataTable.tsx`. Cells hold values, never sentences;
long conditions go to numbered footnotes (`minStayShort` + `minStayPerYear` in the data
layer is that split). The row-label column and the header row are both pinned. It stays a
real `<table>` at every width — stacked mobile cards would either duplicate every figure in
the HTML or drop the table role.

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
8. **Last reviewed** — "Reviewed [date] by Jason Yap, Managing Director of MYPVIP"
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

**Amendment, 2026-07-27 — attributed sources.** The rule was "no figure ships without an
official source", and PVIP broke it: the terms changed on 16 March 2026 and Immigration has
not republished its FAQ, so for four months the site served figures it knew were superseded
because the only alternative the rule allowed was silence. A government PDF is the best way
to let a reader check us, not the only honest one. So `Programme` now carries an optional
`superseded` block — what changed, **who is asserting it** (`attribution.by`, normally
"MYPVIP practice"), the date it was current, and a `figuresPending` flag while the numeric
fields are still the old ones. `components/SupersededNotice.tsx` renders it above the figures
on every page that shows them, names whose word they rest on, and links the stale official
document so the gap is explicit rather than hidden.

Two limits keep this from becoming a loophole. An attributed figure is a **weaker declared
source, never a substitute for knowing** — if we do not actually know a number, the field
stays `null` and the question goes to `UNVERIFIED` exactly as before. And attribution is
always **visible**: an unmarked number on the page still means an official source says so.

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
cron that fetches Malaysia visa news, triages it with Workers AI and queues it in D1; a
Cloudflare Access–locked `/dashboard` where Jason approves, edits and publishes; and a public
`/api/news` (+ `/api/news/<slug>`) the site reads **at build time**.

**Two models, two stages, and the split is the point.** `SUMMARY_MODEL`
(`llama-3.2-3b`) triages ~20 candidates a sweep into a blurb and a category — cheap, because
most of them are never published. `ARTICLE_MODEL` (`gpt-oss-120b`) writes the actual article,
and runs **only on approval**: one large call per published page, not twenty a day for
content nobody reads.

⚠️ **The article is ours; the reporting is theirs.** The pipeline never stores or renders the
publisher's article body — it reads the source, then writes something new about it. That is
not squeamishness: reproduced text is both an infringement and a duplicate-content signal
that hands the ranking back to the original publisher, so the page would not rank either.
Full reasoning at the head of `worker/src/article.ts`. If the source cannot be read
(paywall, bot block, JS-only page) **nothing is published** — it never writes from a headline
alone.

⚠️ **News goes live on a deploy, not on approval.** The pages are prerendered, so approving
an article in the dashboard puts it in D1 and nowhere else until `npm run build` +
`wrangler pages deploy`. A consequence worth knowing before it surprises you: **a static
export cannot build a dynamic route with zero paths**, so once `/news/[slug]` exists the
build requires at least one published article. `src/app/news/[slug]/page.tsx` throws a
message saying so rather than letting Next report it as a missing `generateStaticParams`.

To check the blog without deploying anything:
`NEWS_API_URL=http://localhost:8787/api/news npm run build`.

⚠️ **It deploys separately.** `wrangler pages deploy out` does **not** touch it —
`cd worker && npx wrangler deploy` does. IDs, bindings and the model live in
`worker/wrangler.jsonc`; the runbook is `worker/README.md`. Read those rather than
reconstructing values from memory.

⚠️ **Next.js 16 has breaking changes versus training data** — see `AGENTS.md`. Read the
relevant guide in `node_modules/next/dist/docs/` before writing framework code, and pull
Tailwind v4 docs via Context7.

### 4.3 Design

**Fourth direction — "Cobalt sky" — and the three before it are dead.** v1.0 specced deep
rainforest green + warm sand + hibiscus; 2026-07-24 replaced it with a navy/pale-cyan echo
of the official eVISA portal; 2026-07-25 replaced *that* with champagne-and-gold after
`connectinasia.com`; 2026-07-26 replaced that in turn with the cobalt palette Jason picked
from a four-swatch board. None should be resurrected from this file's history. The live
tokens in `src/app/globals.css` are the truth — this section describes them, it does not
compete with them.

**Structure** still follows `connectinasia.com` (the Korean-language MYPVIP partner site):
the photo hero, the centred section headings, the staggered cards. Only the *colour* left.
The identity is never borrowed — no CONNECT IN ASIA or MYPVIP wordmark, no Immigration
Department crest, never the word "official" (§1). Cobalt-and-navy is close enough to a
government skin that the "not a government body" line under the wordmark is now doing real
work; keep it.

- **Palette — four colours, each at its strongest role:** `#0047AB` cobalt (links, CTA),
  `#000080` navy (headings, dark panels), `#82C8E5` sky (hover borders, accents on
  photography, and everything on a navy ground), `#6D8196` slate (muted lines, form
  borders). Surfaces are a cool near-white through ice blue. Cool throughout; there is no
  warm tone left on the site.
- **Tokens are ROLE-named, not hue-named**, and the names are inherited from v1:
  `forest-*` is the cobalt→navy primary, `sand-*` the white/ice surfaces, `hibiscus-*` the
  cobalt CTA. **Read them by role, never by hue.** This one convention is why three complete
  restyles have landed without editing a single guide, table, quiz or calculator — it is the
  design equivalent of §4.1 and worth defending just as hard. **The corollary was learned
  the hard way:** the two utilities that *were* hue-named, `gold-text`/`gold-fill`, are the
  only reason this restyle touched component files at all. They are now `accent-text` /
  `accent-fill`. Never name a new one after a colour.
- **Two accent gradients, not one.** `--gradient-accent` lights a *fill* (pill, badge) that
  carries white text, so its brightest stop is capped at 5.4:1 against white.
  `--gradient-accent-text` lights *type* on the near-white page, so its ends run dark
  instead. Reusing the fill ramp on text is a mistake already made once.
- **`on-navy` for dark panels.** Both of the above, and `eyebrow`, are calibrated
  dark-on-light and all but vanish on a `forest-900` panel. `on-navy` re-points them at the
  sky end of the palette for the whole subtree — put it on any `bg-forest-900` block that
  contains an eyebrow or an accent word.
- **Type:** Plus Jakarta Sans throughout — body, UI, and headings at 800. Playfair Display
  italic is reserved for the single accent word per card. The v1.0 "editorial serif
  headlines" rule is dead: headings are the heavy sans, the serif is an accent only.
- **19px base, high contrast, generous line height, no thin grey text.** The reader is 45+,
  wealthy, and scam-alert. Readability is a genuine competitive differentiator here —
  competitors ignore it — not decoration. **4.5:1 is a floor, and it is audited rather than
  assumed** (§8) — every restyle so far has put at least one element under it.
- **Signature devices**, all `@utility` in `globals.css`: `accent-text`, `accent-fill`,
  `on-navy`, `eyebrow`, `card-lux`, `diamond-rule`, `ring-decor` — plus `full-bleed` (escape
  the centred column) and `rise` (motion-safe entrance). Compose these before inventing more.
- **`public/og.png` is hand-built, not generated at build time.** It carries the palette into
  every share, and it is easy to forget on a restyle — it survived two of them stale. Rebuild
  it from an HTML card screenshotted at 1200×630 whenever §4.3 changes.
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
