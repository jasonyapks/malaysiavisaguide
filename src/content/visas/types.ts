import type { ReactNode } from "react";
import type { FaqItem } from "@/components/Faq";

/**
 * A programme guide's copy, per locale.
 *
 * Mirrors `GuideLayout`'s props one for one, minus the things that are not
 * words: the programme record, the hero image and the locale itself. `sections`
 * is a function rather than a value because the body needs `href()` to build
 * locale-correct internal links, and a plain JSX value would have to hardcode
 * the prefix — which is exactly the bug that leaves a reader stranded in
 * English halfway down a Chinese page.
 */
export type GuideCopy = {
  title: string;
  /** 40–60 words. AI Overviews and a skimming reader both get the answer
   *  without scrolling. */
  answer: string;
  suits: { yes: string[]; no: string[] };
  faq: FaqItem[];
  cta: { text: string; label: string; href: string };
  /** Page metadata. `title` here is the SERP title, which is usually not the
   *  same sentence as the h1. */
  meta: { title: string; description: string };
  /** The guide's own <Section> blocks. */
  sections: (href: (path: string) => string) => ReactNode;
};
