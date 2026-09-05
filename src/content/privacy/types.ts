import type { ReactNode } from "react";
import type { CookiePreferencesStrings } from "@/components/CookiePreferences";

/**
 * The privacy page's copy, per locale.
 *
 * ## Why this one has to be translated rather than linked out to
 *
 * It is the page that tells a reader what is collected about them and how to
 * switch it off, and the switch itself lives on it. "Read the English one" is
 * an acceptable answer for a comparison table and not for this — under the UK
 * and EU GDPR the withdrawal route has to be as easy as the grant, and a
 * control whose buttons a reader cannot read is not that.
 *
 * Same shape as `AboutCopy`: JSX rather than a string dictionary, because the
 * paragraphs carry `<strong>` and inline links that are part of the sentence.
 */
export type PrivacyCopy = {
  /** SERP title and description. `title` is not the same sentence as the h1. */
  meta: { title: string; description: string };
  title: string;
  /** The bordered standfirst under the h1. */
  standfirst: ReactNode;

  /** Takes `href()` — internal links must be locale-correct. See `linkPath`. */
  who: { heading: string; body: (href: (path: string) => string) => ReactNode };
  measured: { heading: string; body: ReactNode };

  /**
   * The cookie table. Only the prose cells are copy: the identifiers
   * `mvg-consent` and `_ga, _ga_*` are what a reader will actually find in
   * their browser's storage inspector, so the layout renders them and no
   * translation can reach them. Same rule as digits — see SPEC.md §4.1.
   */
  stored: {
    heading: string;
    columns: { name: string; what: string; when: string };
    consentCookie: { what: ReactNode; when: ReactNode };
    analyticsCookies: { what: ReactNode; when: ReactNode };
    after: ReactNode;
  };

  enquiry: {
    heading: string;
    body: (href: (path: string) => string) => ReactNode;
  };

  /**
   * The heading and lead-in for the consent control, plus the control's own
   * strings — passed down as props because `CookiePreferences` is a client
   * component and must not import the dictionary.
   */
  control: {
    heading: string;
    intro: ReactNode;
    preferences: CookiePreferencesStrings;
  };

  rights: { heading: string; body: ReactNode };

  /**
   * `lastUpdatedLabel` only. The date itself is a single ISO constant in the
   * layout, rendered through `reviewDate(iso, locale)` — three hand-written
   * copies of it would be three chances for the Chinese pages to claim a
   * policy revision that never happened.
   */
  changes: { heading: string; body: ReactNode; lastUpdatedLabel: string };
};
