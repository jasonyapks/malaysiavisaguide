# Webinars and events: sources

AI-maintained. Every entry cites a file in `raw/events/`. Event facts live in `src/lib/data/events.ts`. Copy lives in `src/content/events/<locale>.tsx`. Page: `/events/`. Also shown in the first-visit pop-up (`src/components/WebinarPopup.tsx`).

## Posters

| Event id | Original | Served as |
|---|---|---|
| `pvip-vs-mm2h-mandarin-2026-11-25` | `raw/events/2026-11-25-mandarin-pvip-vs-mm2h-poster.png` (1024×1280, from Jason, 15 Nov 2026) | `public/images/events/pvip-vs-mm2h-mandarin-2026-11-25.webp` (896×1120, cwebp q82) |

- The poster is Simplified Chinese only. The Traditional host (tw.) shows the same Simplified artwork.
- A poster's alt text is `posterAlt` in the locale's events copy. When `events.ts` sets `poster`, the pop-up shows the poster in place of the text summary.
