/**
 * Image registry — SPEC.md §4.3 ("original photography where possible, no stock
 * skylines"). Kept out of `programmes.ts` on purpose: that file is the source of
 * truth for *figures*, and an image is not a figure.
 *
 * How this works:
 *   - Every slot has its `alt` and a short `brief` written now, before the photo
 *     exists. The brief doubles as the shot list when you go sourcing.
 *   - `ready` is false until a real file is dropped at `src`. Until then the
 *     <Figure> component renders a branded placeholder, so the design is never
 *     broken and never ships a missing-image icon.
 *   - To activate a photo: drop the file at `src` (e.g. public/images/pvip.jpg),
 *     set `ready: true`, add a `credit` if the licence asks for one, rebuild.
 */
export type SiteImage = {
  /** Path under /public once a real photo is added. */
  src: string;
  /** Real, descriptive alt text — written now; also does SEO work. */
  alt: string;
  /** Short subject label shown on the placeholder; your brief when sourcing. */
  brief: string;
  /** Attribution line, when the licence requires one (Unsplash/Pexels don't). */
  credit?: { name: string; url?: string };
  /** Flip to true once a real photo sits at `src`. */
  ready?: boolean;
};

export const images: Record<string, SiteImage> = {
  home: {
    src: "/images/home-hero.jpg",
    alt: "A relaxed expatriate couple on a leafy Kuala Lumpur balcony in warm evening light.",
    brief:
      "Warm expat-life scene — a balcony, garden or café in KL at golden hour. Real life, not a corporate skyline.",
  },
  pvip: {
    src: "/images/pvip.jpg",
    alt: "Interior of a modern high-floor Kuala Lumpur residence with an open view.",
    brief: "Upscale modern condo interior with a city view — premium, calm, lived-in.",
  },
  mm2h: {
    src: "/images/mm2h.jpg",
    alt: "A mature couple relaxing on the veranda of a tropical Malaysian home.",
    brief: "Second-home retirement lifestyle — a couple 55+, veranda or garden, tropical greenery.",
  },
  "sarawak-mm2h": {
    src: "/images/sarawak-mm2h.jpg",
    alt: "The Kuching waterfront in Sarawak with the Borneo rainforest beyond.",
    brief: "Distinctly Sarawak — Kuching riverfront, Borneo rainforest or a longhouse. Not peninsular Malaysia.",
  },
  "de-rantau": {
    src: "/images/de-rantau.jpg",
    alt: "A remote worker at a laptop in a bright tropical co-working café.",
    brief: "Digital-nomad scene — laptop, café or co-working space, tropical daylight.",
  },
  "employment-pass": {
    src: "/images/employment-pass.jpg",
    alt: "Professionals collaborating in a modern Kuala Lumpur office.",
    brief: "Professional workplace — a small team in a bright modern office, mixed nationalities.",
  },
  "student-pass": {
    src: "/images/student-pass.jpg",
    alt: "International students walking through a Malaysian university campus.",
    brief: "Campus life — international students on a green Malaysian university campus.",
  },
  about: {
    src: "/images/jason-yap.jpg",
    alt: "Jason Yap, Chairman of the PVIP Agent Association.",
    brief: "Jason's own portrait — a real headshot, not a stock person.",
  },
};
