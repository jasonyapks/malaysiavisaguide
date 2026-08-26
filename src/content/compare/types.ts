import type { ReactNode } from "react";

/**
 * Every figure the compare prose quotes mid-sentence, formatted for the locale.
 *
 * ## Why the copy takes figures instead of containing them
 *
 * The essay at the bottom of this page is the one place on the site where hard
 * numbers sit inside running prose rather than in a table cell. In English that
 * was fine — one file, one copy of each number. In three languages it is the
 * failure SPEC.md §4.1 names: a fee corrected in `programmes.ts` reaches the
 * tables automatically and the prose not at all, and the Chinese pages go on
 * quoting last year's agency fee with no error anywhere to show for it.
 *
 * So the locale files hold sentences with holes in them, `ComparePage` fills the
 * holes from `programmes.ts`, and a corrected figure lands in all three
 * languages at once. Adding a figure to the prose means adding it here first —
 * if it is not on this type, it is not available to translate around, which is
 * the point.
 */
export type CompareFigures = {
  /** MM2H Silver's fixed deposit — the money that stays yours. */
  mm2hSilverDeposit: string;
  /** Participation + processing + agency on MM2H Silver. Computed, not typed in. */
  mm2hSilverSpend: string;
  mm2hSilverParticipation: string;
  mm2hSilverProcessing: string;
  mm2hSilverAgency: string;
  mm2hGoldAgency: string;
  mm2hPlatinumAgency: string;
  mm2hSilverProperty: string;
  /** The state-law floors, already paired with their translated state names. */
  stateFloors: { name: string; amount: string }[];
  epCategoryI: string;
  epCategoryII: string;
  deRantauNonTech: string;
};

export type CompareCopy = {
  meta: { title: string; description: string };
  heading: string;
  /** The gated-how framing that has to land before any table. */
  intro: string;
  longStay: {
    heading: string;
    /** Why the deposits are in different currencies. */
    note: string;
  };
  workStudy: {
    heading: string;
    intro: string;
    note: (f: CompareFigures) => ReactNode;
  };
  essay: {
    heading: string;
    /** Four points the table cannot carry. `title` is the bolded lead-in. */
    items: { title: string; body: (f: CompareFigures) => ReactNode }[];
  };
  quizCta: string;
  sourcesNote: (lastReviewed: string) => string;
};
