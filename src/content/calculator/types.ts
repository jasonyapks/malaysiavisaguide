/**
 * Copy for /tools/cost-calculator/.
 *
 * The line items inside the estimate are not here — `lib/cost.ts` composes
 * those while walking the programme data, from the `cost` block of the ui
 * dictionary, so that a label and the figure it sits beside are produced in one
 * place. What lives here is the page around them: the questions, the section
 * headings, and the honesty footer.
 */
export type CalculatorCopy = {
  meta: { title: string; description: string };
  heading: string;
  lead: string;

  steps: {
    /** Numbered at render time — two of the three are conditional. */
    programme: string;
    dependants: string;
    dependantTerm: (years: number) => string;
    nationality: string;
  };

  /** "plus you, the main applicant" */
  plusMainApplicant: string;
  /** "of 3 — the other 1 take 10 years" */
  ofTotal: (total: number) => string;
  othersTakeTerm: (count: number, years: number) => string;
  /** The note under the dependant-term stepper. */
  termsMix: (options: string, ownTerm: number) => string;
  termOption: (amount: string, years: number) => string;
  termOptionSeparator: string;
  /** Shown when a programme's fees don't scale with family size. */
  feesDoNotScale: (programme: string) => string;
  nationalityNote: string;
  nationalityAriaLabel: string;

  results: {
    fullGuide: string;
    feesHeading: string;
    noFeesPublished: string;
    capitalHeading: string;
    capitalLead: string;
    totalFees: string;
    totalCapital: string;
    readyHeading: string;
    feesPlusCapital: string;
    currenciesNote: string;
  };

  footer: {
    leavesOutLabel: string;
    /** When the government fixes the agency fee, its terms are quoted instead. */
    leavesOutWithAgency: (paymentTerms: string) => string;
    leavesOutWithoutAgency: string;
    everyFigureBefore: string;
    guideLinkLabel: (programme: string) => string;
    everyFigureAfter: string;
    pricedOverTerm: (years: number) => string;
    pricedOverTermBody: string;
    agencyFeeWrittenAgainst: (years: number) => string;
    passportCapped: string;
    nationalityAttribution: (by: string, asAt: string) => string;
  };

  stepper: {
    fewer: (label: string) => string;
    more: (label: string) => string;
    dependants: string;
    dependantsOnLongerTerm: string;
  };
};
