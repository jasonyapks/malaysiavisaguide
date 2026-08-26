import type { Answers, Goal } from "@/lib/eligibility";

export type StepId =
  | "goal"
  | "age"
  | "capital"
  | "income"
  | "property"
  | "sponsor";

/**
 * One answer button. `patch` is the shape of the answer, not words — it stays
 * in the copy file because the bands and their labels have to move together:
 * a translated "RM 1 million – RM 2.05 million" that still patched the old
 * band would silently score the reader against the wrong tier.
 */
export type Choice = { label: string; hint?: string; patch: Partial<Answers> };

export type Step = { prompt: string; help?: string; choices: Choice[] };

export type EligibilityCopy = {
  meta: { title: string; description: string };
  heading: string;
  lead: string;

  steps: Record<StepId, Step>;

  progress: {
    /** "Question 2 of 5" — both numbers supplied. */
    counter: (current: number, total: number) => string;
    start: string;
    back: string;
  };

  results: {
    heading: string;
    /** One line per goal, setting up what the reader is about to read. */
    goalIntro: Record<Goal, string>;
    /** Chinese has no plural, so the whole line is a function of the count. */
    fitsHeading: (count: number) => string;
    nearMissHeading: string;
    nearMissLead: string;
    needsOnly: string;
    readGuide: string;
    /** Shown when nothing qualifies and nothing is a near miss. */
    nothingFits: string;
  };

  cta: {
    title: string;
    body: string;
    ask: string;
    compare: string;
  };

  /** The disclaimer under the results. `rate` arrives already formatted. */
  disclaimer: (rate: string) => string;
  startOver: string;
};
