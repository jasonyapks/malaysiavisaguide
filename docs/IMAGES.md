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
- The guide heroes come in via the `hero` prop on `<GuideLayout>` and render
  **full-bleed at 100vw** behind the page title; the home hero and the About
  portrait use `<Figure>` directly at a fixed, much smaller width.

### To add a photo

1. Compress it first — static export serves images as-is (`next.config.ts` sets
   `images: { unoptimized: true }`, because a static export has no optimiser).
   There is **no `srcset`**: whatever you drop in is what a phone downloads.
   Target **~150–250 KB**, WebP.
2. Size it to how it actually renders, not to a fixed 1600 px:

   | Slot | Renders at | Source width |
   |---|---|---|
   | The six guide heroes | full-bleed, 100vw | 1500–1600 px |
   | `home` | ~460 px in the freshness band | 1100 px |
   | `about` | 200 px portrait | 500 px |

3. Drop it at the slot's `src`, e.g. `public/images/pvip.webp`.
4. In `src/lib/images.ts`, set `ready: true` on that slot.
5. If the licence requires attribution, fill `credit: { name, url }` — it renders
   as a caption under the image. **Note:** `<Figure>` renders the caption, the
   full-bleed guide hero does not — a credited photo does not belong in a hero
   slot until that is handled.
6. `npm run build` and check the page.

### The WebP conversion (2026-07-25)

All eight slots were JPEG and totalled 1.84 MB; several were well over the
250 KB target, and the guide heroes had just become the LCP element on their
pages. Converted with:

```sh
cwebp -q 78 -m 6 -sharp_yuv -metadata none in.jpg -o out.webp
# home-hero and jason-yap were also oversized for their slot, so:
cwebp -q 80 -m 6 -sharp_yuv -metadata none -resize 1100 0 home-hero.jpg -o home-hero.webp
cwebp -q 82 -m 6 -sharp_yuv -metadata none -resize 500 0  jason-yap.jpg -o jason-yap.webp
```

1.84 MB → 887 KB (52%). The JPEG masters were deleted; recover any of them with
`git show <commit-before-this>:public/images/pvip.jpg > pvip.jpg` — the masters
were `.jpg`, so ask git for the old extension, not the new one.

---

## The slots

| Slot | File to add | Shot brief | Suggested source |
|---|---|---|---|
| `home` | `public/images/home-visa-guide.webp` | The paperwork itself — visa application, approval stamp, Malaysian flag. The one composed graphic on the site, supplied by Jason 2026-07-28; it fills the freshness band, which is about checked figures rather than about Malaysian life. Nearly square, so the Figure uses `aspect-square`. | Jason (own asset) |
| `pvip` | `public/images/pvip.webp` | Upscale modern condo interior with a city view — premium, calm, lived-in. | Unsplash / Adobe Stock |
| `mm2h` | `public/images/mm2h.webp` | Second-home retirement lifestyle — couple 55+, veranda or garden, tropical green. | Unsplash / Pexels |
| `sarawak-mm2h` | `public/images/sarawak-mm2h.webp` | Distinctly Sarawak — Kuching riverfront, Borneo rainforest or a longhouse. Not peninsular Malaysia. | **Wikimedia Commons** (best for local place) / Unsplash |
| `de-rantau` | `public/images/de-rantau.webp` | Digital-nomad scene — laptop, café or co-working space, tropical daylight. | Pexels / Unsplash |
| `employment-pass` | `public/images/employment-pass.webp` | Professional workplace — small team, bright modern office, mixed nationalities. | Pexels |
| `student-pass` | `public/images/student-pass.webp` | Campus life — international students on a green Malaysian university campus. | Unsplash / Wikimedia |
| `about` | `public/images/jason-yap.webp` | **Jason's own portrait — a real headshot, never stock.** | Local photographer / a clean phone headshot |

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

---

## Article hero images (attached by hand)

The seven scene photos above are sourced once and live in `images.ts`. **Article
heroes are attached per article** — Jason picks the picture in the dashboard, by
file or by URL. Set up 2026-07-27.

An AI-generation pipeline (Workers AI, FLUX.1 [schnell]) was built first and
removed the same day: the pictures were plausible and consistent and still did
not fit the site. Do not rebuild it. The reason it failed is not the model —
it is that a hero image on a reference site makes a claim about a real place, and
a synthesised one cannot back it.

### Attaching one

In the dashboard, open an approved article and press **Edit**. The hero image
panel takes either an upload or the address of an image already on the web, plus
alt text (required) and a credit (optional). Its **Save image** button is
separate from the article's Save on purpose: a file transfer fails on its own
terms — too big, a URL that is really a web page, a publisher's 403 — and a
rejected picture should not look like lost edits to the prose.

An upload is downscaled to 1800px wide in the browser before it is sent. A
four-thousand-pixel phone photo is bytes nobody will ever see: the site renders a
hero at 1440 at most.

### Getting it onto the site

```
npm run images:pull      # bring across everything attached since the last deploy
npm run publish:site     # runs the pull, then builds and deploys
```

The pull is idempotent and it also **removes**: take a picture off an article in
the dashboard, run the pull, and the files and the registry entry go with it.

For `/insights/` articles, which live in this repo rather than in D1 and so have
no dashboard:

```
node scripts/article-image.mjs insights comparisons/<slug> \
  --file ~/Desktop/photo.jpg --alt "what the picture shows" --credit "Name"
```

### What lands where

| Path | What |
|---|---|
| `public/images/news/<slug>.webp` | 1440×810, the page hero |
| `public/images/news/<slug>-og.jpg` | 1200×630, the social card and the `image` in JSON-LD |
| `src/lib/data/article-images.json` | alt, credit and the sync stamp |

**Do not hand-edit the registry** — the next pull overwrites it. Alt text and
credit are edited in the dashboard, which is also the only place that knows what
the picture shows.

No entry means no image slot renders. An article published before anyone has
chosen a picture looks like an article without one, not like a broken page.

### Two limits worth knowing

- **D1 holds at most 2 MB per row**, and that row also carries the article body
  and up to 12,000 characters of pasted source text. The upload cap is 1.2 MB of
  base64, about a 900 KB file, which leaves that clear.
- **A SQL statement is capped at 100 KB**, separately. It does not affect the
  dashboard, where the image travels as a bound parameter, but it is why
  `wrangler d1 execute` refuses to insert the same image from the command line.
  Do not conclude from that failure that the image is too big.

The image is deleted from D1's holding pen only by removing it from the article;
the durable copy is the file committed here.
