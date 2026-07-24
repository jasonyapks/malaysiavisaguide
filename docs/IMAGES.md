# Images — sourcing & swap-in checklist

Living checklist for the site's photography. The single source of truth for what
each slot needs is [`src/lib/images.ts`](../src/lib/images.ts) — this doc is the
"where to get it and how to add it" companion.

Design rules come from `SPEC.md` §4.3: **original photography where possible,
no stock skylines, readability first.** For a 45+, wealthy, scam-alert audience,
imagery is trust infrastructure — a generic stock look actively costs credibility.

---

## How the system works

- Every slot lives in `src/lib/images.ts` with its `alt` text and a short `brief`
  (the brief is your shot list) already written.
- `<Figure>` renders a **branded placeholder** carrying the brief until a real
  photo exists — the design never shows a broken image.
- The guide heroes come in via the `hero` prop on `<GuideLayout>`; the home hero
  and the About portrait use `<Figure>` directly.

### To add a photo

1. Compress it first — static export serves images as-is. Target **~150–250 KB,
   ~1600 px wide, JPEG or WebP**. (Squoosh.app is a quick free compressor.)
2. Drop it at the slot's `src`, e.g. `public/images/pvip.jpg`.
3. In `src/lib/images.ts`, set `ready: true` on that slot.
4. If the licence requires attribution, fill `credit: { name, url }` — it renders
   as a caption under the image.
5. `npm run build` and check the page.

---

## The slots

| Slot | File to add | Shot brief | Suggested source |
|---|---|---|---|
| `home` | `public/images/home-hero.jpg` | Warm expat-life scene — balcony, garden or café in KL at golden hour. Not a corporate skyline. | Unsplash → *Adobe Stock* if you want it premium |
| `pvip` | `public/images/pvip.jpg` | Upscale modern condo interior with a city view — premium, calm, lived-in. | Unsplash / Adobe Stock |
| `mm2h` | `public/images/mm2h.jpg` | Second-home retirement lifestyle — couple 55+, veranda or garden, tropical green. | Unsplash / Pexels |
| `sarawak-mm2h` | `public/images/sarawak-mm2h.jpg` | Distinctly Sarawak — Kuching riverfront, Borneo rainforest or a longhouse. Not peninsular Malaysia. | **Wikimedia Commons** (best for local place) / Unsplash |
| `de-rantau` | `public/images/de-rantau.jpg` | Digital-nomad scene — laptop, café or co-working space, tropical daylight. | Pexels / Unsplash |
| `employment-pass` | `public/images/employment-pass.jpg` | Professional workplace — small team, bright modern office, mixed nationalities. | Pexels |
| `student-pass` | `public/images/student-pass.jpg` | Campus life — international students on a green Malaysian university campus. | Unsplash / Wikimedia |
| `about` | `public/images/jason-yap.jpg` | **Jason's own portrait — a real headshot, never stock.** | Local photographer / a clean phone headshot |

---

## Where to source

### Free — start here
All of these allow commercial use; the first three need no attribution.

- **Unsplash** — highest quality, best Malaysia coverage. First stop for home, PVIP,
  MM2H, and Borneo/Kuching.
- **Pexels** — strong on modern work/nomad/lifestyle. Best for DE Rantau and
  Employment Pass.
- **Pixabay** — more volume, variable quality; backup only.
- **Wikimedia Commons** — best for genuinely local Sarawak shots (longhouses, Kuching
  waterfront). **Attribution required** — check each file's licence (CC-BY vs CC0)
  and record it in the slot's `credit` field.
- **Tourism Malaysia media** — authentic scenery; confirm reuse terms first.

The catch: the popular free shots read as "stock." Dig past page one and favour
specific/local over generic, per the no-skyline rule.

### Cheapest suitable paid — for distinctiveness
1. **Envato Elements — ~US$16.50/mo, unlimited downloads. Best value here.** You need
   ~8 images once: subscribe one month, download everything, cancel. Covers commercial
   web use.
2. **Adobe Stock on-demand credits** — ~US$10–12/image, no subscription. Highest
   quality and best Malaysia + affluent-lifestyle library. Good for just the 2–3 hero
   shots you want to be excellent.
3. **Dreamstime / Depositphotos** — cheapest per-image; mixed library; fine for
   supporting images.

Skip Getty/Shutterstock — overkill on price for a site this size.

### Recommendation
Free (Unsplash + Pexels + Wikimedia for Sarawak) for 6 of the 7 scene images —
RM0 — and spend only on a **real portrait of Jason**. If the home + PVIP heroes
later need to feel more premium than the free pool allows, buy those two on Adobe
Stock credits (~US$25 total).

**Avoid AI-generated people anywhere on the site** — the positioning is "real
practitioner, verified facts," and a synthetic face undercuts exactly that.

---

## Licence hygiene

For every paid or attribution-required image, record source + licence in the
`credit` field so the provenance travels with the code. Keep receipts/licence
PDFs out of this repo — file them in your `private/` folder per the knowledge-system
convention.
