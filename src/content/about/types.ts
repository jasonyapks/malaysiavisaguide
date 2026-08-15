import type { ReactNode } from "react";

/**
 * The about page's copy, per locale.
 *
 * ## Why this page is worth extracting rather than duplicating
 *
 * /about/ is where E-E-A-T lives — SPEC.md §1. It is the page that says who
 * writes this and what he sells, and it is the target of the byline link at the
 * foot of every guide. A Chinese reader who follows that link and lands on an
 * English page has just been told the trust argument is not for them.
 *
 * Same shape as `HomeCopy` and `GuideCopy`: JSX rather than a string dictionary,
 * because the disclosure paragraphs carry `<strong>` and inline links that are
 * part of the sentence, and because a missing key should be a type error rather
 * than a blank section a reader finds first.
 */
export type AboutCopy = {
  /** SERP title and description. `title` is not the same sentence as the h1. */
  meta: { title: string; description: string };
  title: string;
  /** The bordered standfirst under the h1. */
  standfirst: ReactNode;
  /**
   * Alt text for Jason's portrait, overriding the English one on the shared
   * `images.about` record. The asset is the same file in every locale; the
   * sentence a screen reader speaks is not.
   */
  portraitAlt: string;
  /**
   * `beside` sits in the two-column grid next to the portrait; `body` runs full
   * width under it. Split because the grid is layout, not copy — a translation
   * that merged them would push the portrait against a wall of text.
   */
  who: { heading: string; beside: ReactNode; body: ReactNode };
  /**
   * Takes `href()` because this is the only section with internal links, and
   * they must be locale-correct — see `linkPath` in lib/translated.ts.
   */
  disclosure: {
    heading: string;
    body: (href: (path: string) => string) => ReactNode;
  };
  government: { heading: string; body: ReactNode };
  /** The closing band: prompt, link label, then the rest of the sentence. */
  cta: { text: string; label: string; tail: string };
  /**
   * `description` on the Person schema. The name, job title and company names
   * are not translated — they are the legal identities that appear on the
   * licences — but the sentence describing him is prose, and prose on a Chinese
   * page should be Chinese. Mirrors how `GuideLayout` localises the Article
   * headline while leaving the author's `jobTitle` in English.
   */
  schemaDescription: string;
};
