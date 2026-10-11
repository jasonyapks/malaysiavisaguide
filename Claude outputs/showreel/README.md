# Showreel — malaysiavisaguide.com

A 25-second, 1920×1080, 60 fps motion piece that introduces the site. Everything in it
is generated in code: the animation is HTML/CSS/canvas driven frame by frame, and the
soundtrack is synthesised from oscillators and noise. No stock footage, no stock music,
no licences to track.

**Output:** `MalaysiaVisaGuide-Showreel-2026.mp4`

## Running order

| Time | Chapter | What happens |
|---|---|---|
| 0:00 | 01 Open | A gold line draws out, SHOWREEL rises, then collapses to a point |
| 0:02 | 02 Promise | Kinetic type, one word per beat: *Clarity for your journey to Malaysia*. A 14-point star zooms through the camera |
| 0:04 | 03 Identity | The Guided Passport logo rebuilds from vector parts: cover, pages, crescent, star, then the compass spins in and lands. Wordmark and tagline follow |
| 0:07 | 04 Programmes | Six programme cards fly in on a 3D cover-flow track with a live 01→06 counter |
| 0:10 | 05 Data | RM1,000,000 rolls in on slot-machine digits with motion blur, then MM2H Silver / Gold / Platinum deposits as bars, then the SOURCED · DATED stamp |
| 0:14 | 06 Tools | An iris reveals the eligibility quiz in a 3D browser. The cursor answers two questions, the shortlist pops in, and the cost calculator slider drags to three dependants |
| 0:17 | 07 Reach | A wireframe globe turns to Kuala Lumpur as gold arcs fly in from Dubai, London, Hong Kong, Mumbai, Singapore, New York, Toronto, Tokyo, Seoul, Taipei and Sydney. EN / 简体 / 繁體 |
| 0:21 | 08 Resolve | Camera zooms into KL, a gold flash, the logo rebuilds on navy, the URL types itself, a gold sweep runs across the lockup |

Every figure in it comes from `src/lib/data/programmes.ts`: the PVIP RM1M deposit and
20-year term, the MM2H US$150K / 500K / 1M deposits with their 5 / 15 / 20-year passes,
the Sarawak 10-year pass, the DE Rantau US$24K income floor, and the RM100,000 fee per
dependant on the 20-year term. The quiz answers and shortlist are an illustration of the
tool, not a real result.

## Rebuild

Needs Node with Playwright (Chromium), Python 3 with numpy and scipy, and ffmpeg.

```bash
python3 tools/score.py score.wav                       # soundtrack
node tools/render.mjs video.mp4 --sub 5 --workers 4    # picture, about 20 minutes
ffmpeg -i video.mp4 -i score.wav -map 0:v -map 1:a -c:v libx264 -crf 17 \
  -c:a aac -b:a 256k -af volume=-2.3dB -movflags +faststart -shortest out.mp4
```

Open `showreel.html` in a browser to watch the live preview loop. `tools/snap.mjs` renders
single frames for review (`node tools/snap.mjs out_dir 4.5 12.0`).

Fonts (Poppins, DM Serif Display) are vendored in `fonts/`. Inter comes from the system.
The programme photos come from `public/images/`.
