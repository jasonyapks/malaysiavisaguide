import type { ReactNode } from "react";

/**
 * The thank-you page's copy, per locale.
 *
 * ## Why this page exists
 *
 * The contact form used to confirm in place, swapping the form for a success
 * box. That is fine for the reader and useless for measurement: the URL never
 * changes, so there is nothing for GA4 to count. A submission and a bounce look
 * identical in the reports.
 *
 * Sending the reader to a real URL fixes that — `/thank-you/` is reached only
 * by submitting, so a page_view on it *is* the conversion. See ContactForm.tsx
 * for why the redirect is a full navigation rather than a client-side push.
 *
 * Same JSX-not-strings shape as `AboutCopy`: `body` carries inline links, and a
 * missing key should be a type error rather than a blank section.
 */
export type ThankYouCopy = {
  /**
   * SERP title and description. Present because the tab still needs a name —
   * the page is `noindex`, so neither reaches a search result.
   */
  meta: { title: string; description: string };
  title: string;
  /** The bordered standfirst under the h1: what was sent, and what happens next. */
  standfirst: ReactNode;
  /**
   * Takes `href()` because every link here is internal and must be
   * locale-correct — see `linkPath` in lib/translated.ts.
   */
  body: (href: (path: string) => string) => ReactNode;
  /** The closing band: prompt, link label, then the rest of the sentence. */
  cta: { text: string; label: string; tail: string };
};
