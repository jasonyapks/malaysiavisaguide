import type { ReactNode } from "react";

/**
 * The editorial policy page's copy, per locale.
 *
 * ## Why this page is worth translating
 *
 * It is the page that answers "why should I believe this number?" — the one a
 * sceptical reader opens after a guide quotes a figure that decides whether
 * they can move country. That question does not arrive in English only, and a
 * Chinese reader who follows the footer link into an English page has been told
 * the sourcing argument is not addressed to them.
 *
 * Same shape as `AboutCopy`: JSX rather than a string dictionary, because the
 * paragraphs carry `<strong>` and inline links that are part of the sentence.
 *
 * The sections are a fixed tuple of named keys rather than an array. An array
 * would let a translation ship five sections where English has six and the type
 * would be satisfied; a missing key here is a compile error.
 */
export type EditorialPolicyCopy = {
  /** SERP title and description. `title` is not the same sentence as the h1. */
  meta: { title: string; description: string };
  title: string;
  /** The bordered standfirst under the h1. */
  standfirst: ReactNode;

  /**
   * `sources` and `oneSourceOfTruth` take `href()` because they carry internal
   * links, which must be locale-correct — see `linkPath` in lib/translated.ts.
   * The rest are prose only and take nothing.
   */
  oneSourceOfTruth: {
    heading: string;
    body: (href: (path: string) => string) => ReactNode;
  };
  sources: { heading: string; body: ReactNode };
  review: { heading: string; body: ReactNode };
  changes: { heading: string; body: ReactNode };
  independence: {
    heading: string;
    body: (href: (path: string) => string) => ReactNode;
  };
};
