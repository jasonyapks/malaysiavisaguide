/**
 * Image registry — SPEC.md §4.3 ("original photography where possible, no stock
 * skylines"). Kept out of `programmes.ts` on purpose: that file is the source of
 * truth for *figures*, and an image is not a figure.
 *
 * The seven scene photos are from Unsplash (Unsplash Licence — free for
 * commercial use, no attribution required). See docs/IMAGES.md for provenance
 * and the swap-in process. The `about` portrait is intentionally NOT filled: it
 * must be a real photo of Jason, never stock, so it stays a placeholder until
 * his own headshot is dropped in.
 *
 * How this works:
 *   - `ready: true` means a real file sits at `src` and renders.
 *   - `ready` absent/false renders a branded placeholder carrying the `brief`,
 *     so the design is never broken and the spot for a photo is obvious.
 *   - `alt` describes what the photo actually shows (accessibility + SEO); it
 *     makes no claim the image can't back up (e.g. it doesn't assert a generic
 *     office is in Kuala Lumpur).
 */
export type SiteImage = {
  /** Path under /public. */
  src: string;
  /** Real, descriptive alt text for the photo that ships. */
  alt: string;
  /** Short subject label shown on the placeholder; the brief when sourcing. */
  brief: string;
  /**
   * Attribution line, when the licence requires one (Unsplash does not) or when
   * the provenance has to be disclosed (a generated image always does).
   * `prefix` overrides the default "Photo:" label — "Image: Illustration
   * generated with AI" is accurate where "Photo:" would be a false claim.
   */
  credit?: { name: string; url?: string; prefix?: string };
  /** True once a real photo sits at `src`. */
  ready?: boolean;
};

export const images: Record<string, SiteImage> = {
  // The one composed graphic on the site rather than a photograph, and the only
  // slot where that is right: the freshness band is about the paperwork, not
  // about Malaysian life, and the Chinatown street scene that sat here said
  // nothing about fees being checked. Nearly square (1024×997), so the Figure
  // that renders it uses aspect-square — cropping it to 4/3 would take the
  // title off the top.
  home: {
    src: "/images/home-visa-guide.webp",
    alt: "A Malaysia Visa Guide graphic: a Malaysian flag and an approval stamp over a visa application form, with passports and the Petronas Towers.",
    brief:
      "The paperwork itself — visa application, approval stamp, Malaysian flag. Composed graphic, not a street photo.",
    ready: true,
  },
  pvip: {
    src: "/images/pvip.webp",
    alt: "Business professionals meeting in a high-rise office with a city skyline view.",
    brief: "Business / investment lifestyle — professionals, a meeting or the city, a sense of enterprise.",
    ready: true,
  },
  mm2h: {
    src: "/images/mm2h.webp",
    alt: "A family with a young child enjoying a lush, green tree-lined path together.",
    brief: "Family life — parents and children, study or retirement lifestyle, warm and green.",
    ready: true,
  },
  "sarawak-mm2h": {
    src: "/images/sarawak-mm2h.webp",
    alt: "The Sarawak State Legislative Assembly and a river cruise boat on the Kuching waterfront.",
    brief: "Distinctly Sarawak — Kuching riverfront, Borneo rainforest or a longhouse. Not peninsular Malaysia.",
    ready: true,
  },
  "de-rantau": {
    src: "/images/de-rantau.webp",
    alt: "A laptop and backpack on a wooden table in a bright, plant-filled tropical café.",
    brief: "Digital-nomad scene — laptop, café or co-working space, tropical daylight.",
    ready: true,
  },
  "employment-pass": {
    src: "/images/employment-pass.webp",
    alt: "A diverse team collaborating over a laptop in a bright modern office.",
    brief: "Professional workplace — a small team in a bright modern office, mixed nationalities.",
    ready: true,
  },
  "student-pass": {
    src: "/images/student-pass.webp",
    alt: "A diverse group of students walking and laughing together.",
    brief: "Campus life — international students on a green Malaysian university campus.",
    ready: true,
  },
  about: {
    src: "/images/jason-yap.webp",
    alt: "Jason Yap, Managing Director of MYPVIP.",
    brief: "Jason's own portrait — a real headshot, not a stock person.",
    ready: true,
  },
};
