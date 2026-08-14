import type { ReactNode } from "react";

/**
 * The home page's copy, per locale.
 *
 * ## Why this is a typed object of ReactNode and not a JSON dictionary
 *
 * Almost every heading on this page carries markup that is part of the design,
 * not the sentence: a hard `<br/>` that controls where a two-line display
 * heading breaks, and one `<span>` that sets a single word in the cobalt
 * display face. Flattening that to strings would either lose the design or
 * force a templating syntax to put it back. And the break point is genuinely
 * per-language — "Malaysia's / long-stay visas, / explained plainly" breaks
 * where English grammar allows, and Chinese breaks somewhere else entirely.
 *
 * So copy is JSX, typed, one module per locale, and `HomePage.tsx` holds the
 * layout that all of them share. A missing key is a type error rather than a
 * blank section discovered by a reader.
 */
export type SectionCopy = {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
};

export type HomeCopy = {
  hero: {
    eyebrow: string;
    /** Two or three lines with the accent word in the display face. */
    heading: ReactNode;
    lead: string;
    /** Three short pills under the lead. */
    chips: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    cardEyebrow: string;
    cardTitle: ReactNode;
    promises: { title: string; body: string }[];
  };
  /** One line per programme route, keyed by canonical path. */
  blurbs: Record<string, string>;
  /**
   * The single serif word set in cobalt on each card — the reference's
   * "Settlement / Family / Lifestyle" device. One word, no punctuation: it is a
   * mood label for the route, not its name. Two characters in Chinese, where a
   * transliteration of the English word would be meaningless.
   */
  displayWords: Record<string, string>;
  programmes: SectionCopy;
  workStudy: SectionCopy;
  freshness: {
    eyebrow: string;
    /** Receives the formatted review date, which differs by locale. */
    heading: (date: string) => ReactNode;
    body: string;
  };
  sources: SectionCopy & { prose: ReactNode };
  tools: SectionCopy & { indexLink: string; indexTail: string };
  insights: SectionCopy;
  closing: {
    eyebrow: string;
    heading: ReactNode;
    body: string;
    cta: string;
  };
};
