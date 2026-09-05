# AI Image Prompts — malaysiavisaguide.com
**Direction: designed key visual, headline text inside the image.**
Tools: ChatGPT / DALL·E · Gemini (Nano Banana) · Canva. Written as plain sentences —
no Midjourney flags.

---

## The reference image

`public/images/home-visa-guide.webp` (approved 2026-09-02) is now the standard every other
page must match. What landed, so you can reproduce it:

- **Off-white ground**, no texture, soft even light, one soft shadow per object.
- **Headline in the top quarter**: heavy navy caps, wide, nearly edge to edge. Grey
  sentence-case subhead directly beneath at roughly a third the size.
- **Props laid flat, shot from above at a slight angle**, evenly spaced across the lower
  two-thirds, never overlapping: navy notebook (gold compass rose embossed) · brass
  compass · stack of blank cream documents · navy reading glasses.
- **The gold arc sweeps from the left edge across the full width** and terminates in a
  small gold dot on the right — thin, single weight, behind the objects.
- **Faint gold line-art KL skyline in the bottom right corner**, watermark weight.

Match the ground, headline placement, arc and skyline exactly on every page. Change only
the props. That is what makes fourteen images read as one set.

## Two routes

**Route A — one shot, text included.** This is what produced the reference image, and the
type came out clean. Use it for English pages.

**Route B — art only, text set in Canva.** Run the prompt with the *Text* line deleted and
"leave the top quarter empty for a headline" added, then set the headline in Canva in
**Poppins SemiBold navy #071D3A**. Required for `zh-hans` and `zh-hant` — no current model
renders Chinese characters correctly — and it means one artwork serves all three locales.

---

## Block A — Master style block (prepend to every page prompt)

```
Create a premium, editorial key visual for a Malaysian visa and residency reference
website. Clean designed composition, not a photograph and not a collage.

Ground: soft off-white #F7F7F9 with a gentle studio shadow, uncluttered, generous
white space. One deep navy #071D3A element anchors the composition. A single thin
gold #D4A017 arc — like a compass trajectory — sweeps through the frame as the only
decorative device. Gold is a 10% accent, never a fill or a gradient.

Objects: photorealistic 3D-rendered props, matte finish, soft realistic shadows, lit
from the upper left with even diffuse studio light. Arrange them with clear space
between them; nothing overlapping heavily, nothing floating without a shadow.

Mood: calm, precise, trustworthy — a premium financial or consulting publication, not
a travel agency and not a marketing flyer. Restrained colour: navy, off-white, mist
grey #E6E8EB, with gold as the single accent.

Composition: headline zone across the top quarter, artwork occupying the lower
two-thirds, centred and balanced.
```

**Then add the page's Objects + Text lines from Block C.**

## Block B — Always exclude

```
Do not include: bright red, green or any colour outside the navy / off-white / grey /
gold palette. No Malaysian flag. No rubber-stamp "APPROVED" graphic. No red ink. No
airport, aeroplane, globe or world map. No handshake. No cartoon or clip-art style. No
heavy gradients, glow, bevel or drop-shadow effects. No stock-photo people. No fake
official documents, seals, or anything resembling a real Malaysian immigration form or
a real passport data page. No watermark, no logo, no extra text beyond the headline
given.
```

> One flag on your current homepage image: it leads with the Malaysian flag, a red
> "APPROVED" stamp and passport data pages. Your branding template rules out all three
> (§2 "avoid literal Malaysian flag", §8 "avoid visa stamps as the main visual"), and a
> rendered passport page reads as a fake document. The prompts below keep the same
> designed-key-visual *format* you picked, with brand-legal props. Say the word if you
> want the flag and stamp back and I'll put them in.

---

## Block C — Per-page prompts

Each block gives **Objects** (append to Block A) and **Text** (delete for Route B).

### 1. Homepage — `home-visa-guide.webp` · 16:9 — ✅ DONE, this is the reference
```
Objects: a closed navy passport-style booklet lying flat, embossed with a simple gold
compass rose, no country name. Beside it a thin brass compass with the needle pointing
forward, a pair of reading glasses, and a small stack of plain cream documents with no
legible writing. A minimal gold line drawing of the Kuala Lumpur skyline sits faint and
small in the lower right, like a watermark.
Text: headline "MALAYSIA VISA GUIDE" in bold navy across the top, subhead
"Clarity for your journey to Malaysia" in smaller grey type beneath it.
```

### 2. PVIP — `pvip.webp` · 5:3
```
Objects: a single navy card, the size of a residence card, standing upright and catching
the light, embossed with a thin gold arc. Behind it, out of focus, a calm navy gradient
suggesting a modern city at dusk. To one side a small brass 20 numeral or an hourglass,
signalling a twenty-year horizon. Restrained and premium, almost like a private bank
brochure.
Text: headline "Premium Visa Programme (PVIP)" in bold navy, subhead
"20 years of residence. What it costs, and who qualifies."
```

### 3. MM2H — `mm2h.webp` · 5:3
```
Objects: a small architectural model of a modest Malaysian house or low-rise home in
matte navy, sitting on the off-white ground with a soft shadow. Beside it a brass house
key on a plain ring, and a simple cream folder. A thin gold arc curves behind the house
like a horizon. Warm, settled, domestic — a second home, not a luxury property listing.
Text: headline "Malaysia My Second Home (MM2H)" in bold navy, subhead
"Tiers, deposits and the renewal traps."
```

### 4. Sarawak MM2H — `sarawak-mm2h.webp` · 5:3
```
Objects: same family of props as MM2H but distinctly Sarawak — a matte navy silhouette of
a hornbill in the upper right rendered as a clean geometric form, a small architectural
model of a Kuching-style shophouse, and a thin gold arc suggesting a river bend across
the lower third. Nothing peninsular, no Petronas Towers.
Text: headline "Sarawak MM2H (S-MM2H)" in bold navy, subhead
"Sarawak sets its own rules. Here they are."
```

### 5. Employment Pass — `employment-pass.webp` · 5:3
```
Objects: a matte navy laptop closed and seen from a three-quarter angle, a plain lanyard
with a blank navy access card, a cream folder, and a small brass paperclip. A thin gold
arc rises diagonally behind them like a progress line. Sober and professional; no suits,
no people, no office.
Text: headline "Employment Pass" in bold navy, subhead
"Category I, II and III — salary bands and who sponsors you."
```

### 6. DE Rantau — `de-rantau.webp` · 5:3
```
Objects: an open matte navy laptop at a slight angle with a blank screen, a small ceramic
coffee cup, a pair of earphones coiled neatly, and a compact passport booklet in navy.
A thin gold arc loops around the group like a signal wave. Light, mobile, uncluttered —
work that travels.
Text: headline "DE Rantau Nomad Pass" in bold navy, subhead
"Malaysia's digital nomad pass, in plain terms."
```

### 7. Student Pass — `student-pass.webp` · 5:3
```
Objects: a short stack of matte navy hardback books lying flat, a rolled cream document
tied with a thin gold ribbon, a simple navy backpack rendered small and clean, and a
brass pen. A thin gold arc arcs above the stack. Academic but understated — no mortar
board, no graduation gown, no university crest.
Text: headline "Student Pass" in bold navy, subhead
"Study in Malaysia: sponsorship, EMGS and timelines."
```

### 8. Compare — `compare.webp` · 16:9
```
Objects: two identical matte navy cards standing side by side and slightly angled toward
each other, one marginally taller than the other, with a thin gold arc arcing between
them like a balance beam. Between and beneath them, a clean set of grey bar shapes
suggesting a comparison chart with no numbers. Symmetrical, analytical, calm.
Text: headline "Compare Malaysia's visa programmes" in bold navy, subhead
"PVIP, MM2H and the rest — side by side."
```

### 9. Tools hub — `tools.webp` · 16:9
```
Objects: a matte navy tablet or slate lying flat, showing a blank screen with three faint
grey placeholder lines, beside a brass compass and a small navy slider or dial. A thin
gold arc connects them. Instrument-like, precise, quietly technical.
Text: headline "Tools" in bold navy, subhead
"Check your eligibility. Cost it out."
```

### 10. Eligibility checker — `tools-eligibility.webp` · 16:9
```
Objects: three matte navy cards fanned out, one stepping forward from the others and
outlined in a thin gold line, as if selected. A small brass compass sits beside them,
needle pointing at the chosen card. Clean decision imagery, no ticks, no checkmarks, no
green.
Text: headline "Which Malaysian visa do you qualify for?" in bold navy, subhead
"Answer eight questions."
```

### 11. Cost calculator — `tools-cost-calculator.webp` · 16:9
```
Objects: a matte navy desk calculator seen at a three-quarter angle with a blank display,
a small stack of plain navy and grey chips or discs suggesting value without depicting
currency, and a cream document with faint unreadable ruled lines. A thin gold arc rises
behind them like a chart line. No banknotes, no coins, no currency symbols, no RM sign.
Text: headline "What each Malaysian visa really costs" in bold navy, subhead
"Every fee, government and otherwise."
```

### 12. Insights — `insights.webp` · 16:9
```
Objects: a folded cream broadsheet newspaper with unreadable grey column texture, a pair
of reading glasses resting on it, and a matte navy bookmark. A thin gold arc runs along
the fold. Editorial and quiet — a considered read, not breaking news.
Text: headline "Insights" in bold navy, subhead
"Analysis, comparisons and what the changes mean."
```

### 13. News — `news.webp` · 16:9
```
Objects: three cream cards layered in a shallow stack, each with faint unreadable grey
text lines and a small navy date block in the corner, the top card lifted slightly. A
thin gold arc sweeps left to right behind them, suggesting a timeline. Current and
factual, never celebratory.
Text: headline "News" in bold navy, subhead
"Policy changes, tracked and dated."
```

### 14. Contact — `contact.webp` · 16:9
```
Objects: a matte navy envelope lying flat and slightly open, a brass pen resting across
it, and a plain cream card. A thin gold arc curves from the envelope mouth outward.
Warm, simple, human. No telephone, no headset, no speech bubbles, no location pin.
Text: headline "Contact" in bold navy, subhead
"Ask a question. A person answers."
```

### 15. About — **do not generate**
The About portrait is Jason Yap. Use the real photograph (`jason-yap.webp`). An AI face on
the page that establishes the site's independence does direct damage to it.

### 16. Privacy / Editorial policy
No key visual. Gold compass arc on navy — the existing `compass-arc` device in the codebase.

---

## Trilingual — Route B text layers

Swap only the Canva text layer. Titles below are lifted from the live site, not translated
fresh, so they match the page exactly.

| Page | `zh-hans` | `zh-hant` |
|---|---|---|
| PVIP | 高端签证计划（PVIP） | 高端簽證計劃（PVIP） |
| MM2H | 马来西亚第二家园计划（MM2H） | 馬來西亞第二家園計劃（MM2H） |
| Sarawak MM2H | 砂拉越 MM2H（S-MM2H） | 砂拉越 MM2H（S-MM2H） |
| DE Rantau | DE Rantau 数字游民准证 | DE Rantau 數字遊民准證 |
| Employment Pass | 工作准证（Employment Pass） | 工作准證（Employment Pass） |
| Student Pass | 学生准证（Student Pass） | 學生准證（Student Pass） |

Chinese headlines set in **Noto Sans SC / TC SemiBold**, same navy. Never let an AI tool
render the Chinese characters — they come out malformed in every current model.

---

## Specs

| Use | Ratio | Export | Filename |
|---|---|---|---|
| Homepage banner | 16:9 | 1680×944 (shipped) | `home-visa-guide.webp` |
| Homepage banner, if moved above the headline | 21:9 | 1920×823 | same key |
| Visa guide hero | 5:3 | 1500×900 | page slug, e.g. `pvip.webp` |
| Compare / tools / hub | 16:9 | 1500×844 | page slug |
| Insight / news card | 16:9 | 1200×675 | article slug |

WebP, quality 62–70, **≤ 400 KB**. Drop into `public/images/`, matching the keys in
`src/lib/images.ts`.

## If the banner moves above the headline

At the 1104px content width a 16:9 image renders **621px tall** — on a 698px viewport it
fills the entire first screen on its own, pushing the h1, both CTAs and the quiz card below
the fold. That is why it currently sits *below* the hero copy.

To put it at the very top instead, regenerate at **21:9 (1920×823)**, which comes out around
470px tall at full width and leaves room for the headline beneath it. Same Block A recipe,
with one change appended:

```
Wide cinematic banner composition, 21:9. Spread the objects in a single horizontal row
across the frame with generous space between them, headline across the top, gold arc
sweeping the full width. Keep the composition shallow — nothing stacked vertically.
```

## Before it ships
1. **Read every word in the image.** AI misspells inside artwork constantly, and a typo on
   a page whose whole claim is accuracy is the worst possible place for one. This is the
   failure Route B exists to prevent.
2. Palette check — if anything red, green or saturated crept in, regenerate.
3. No flag, no stamp, no passport data page, no thing that could pass for an official form.
4. Crop-test 16:9 → 5:3 → 1:1. Cards and OG images use different ratios and the headline
   must not get cut.
5. Convert to WebP, confirm under 400 KB, then commit.
