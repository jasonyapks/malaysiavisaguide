import type { CalculatorCopy } from "./types";

/** English cost-calculator copy — moved here from the page and the component. */
export const copy: CalculatorCopy = {
  meta: {
    title: "What each Malaysian visa really costs",
    description:
      "An itemised, honest cost estimate for every Malaysian long-stay programme and work/study pass — by family size, with refundable deposits kept strictly separate from the fees you never see again.",
  },

  heading: "What will it actually cost?",
  lead: "Pick a programme and your family size. Every figure is the official one from that programme's guide — and the money you get back (a fixed deposit) is kept well apart from the money you don't.",

  steps: {
    programme: "Choose a programme",
    dependants: "How many dependants?",
    dependantTerm: (years) => `How many take the ${years}-year term?`,
    nationality: "Which passport do you hold?",
  },

  plusMainApplicant: "plus you, the main applicant",
  ofTotal: (total) => `of ${total}`,
  othersTakeTerm: (count, years) => ` — the other ${count} take ${years} years`,
  termsMix: (options, ownTerm) =>
    `Each dependant chooses separately, so a family can mix the two: ${options}. Your own term is fixed at ${ownTerm} years and is not a choice.`,
  termOption: (amount, years) => `${amount} for ${years} years`,
  termOptionSeparator: ", or ",
  feesDoNotScale: (programme) =>
    `${programme}'s published fees don't change with family size — dependants are added to the pass, but no per-dependant fee is listed in the official source.`,
  nationalityNote:
    "The multiple-entry visa fee and the main applicant's security bond are set by passport, not by programme — the bond alone ranges from RM200 to RM2,000.",
  nationalityAriaLabel: "Nationality",

  results: {
    fullGuide: "Full guide",
    feesHeading: "Fees — money you don't get back",
    noFeesPublished:
      "No participation or processing fee is published for this pass — the cost is your sponsor's application handling and any agent you engage, neither of which is a government-set figure.",
    capitalHeading: "Capital — refundable, or an asset you own",
    capitalLead:
      "This is not a cost. A fixed deposit stays your money; property becomes your asset. You need it ready, but you don't spend it.",
    totalFees: "Total fees",
    totalCapital: "Total capital committed",
    readyHeading: "To have ready in year one",
    feesPlusCapital: "Fees + capital",
    currenciesNote:
      "Ringgit and US-dollar figures are shown separately and never added together — the exchange rate you get is itself part of the real cost. MM2H is denominated in USD; PVIP and S-MM2H in ringgit.",
  },

  footer: {
    leavesOutLabel: "What this leaves out:",
    leavesOutWithAgency: (paymentTerms) =>
      `renewal fees beyond the first term, medical insurance, the medical examination, and living costs. Agent fees are not among them: ${paymentTerms}`,
    leavesOutWithoutAgency:
      "agent fees (not set by the government on this programme, and never published — get them in writing before committing), renewal fees beyond the first term, insurance, and living costs.",
    everyFigureBefore: "Every figure shown is drawn from the official source cited on the",
    guideLinkLabel: (programme) => `${programme} guide`,
    everyFigureAfter: ".",
    pricedOverTerm: (years) => `Priced over a ${years}-year initial approval.`,
    pricedOverTermBody:
      "The pass and visa fees are charged per person for every year of the term, collected up front and again at each renewal.",
    agencyFeeWrittenAgainst: (years) =>
      `${years} years is what the agency fee is written against.`,
    passportCapped:
      "Your approval is capped by your passport's remaining validity, so it may run shorter or longer — scale the pass fee accordingly.",
    nationalityAttribution: (by, asAt) =>
      `Visa fee and security bond figures come from ${by}, as at ${asAt}. The schedules are not published at a government URL, so they carry that attribution rather than a link.`,
  },

  stepper: {
    fewer: (label) => `Fewer ${label}`,
    more: (label) => `More ${label}`,
    dependants: "dependants",
    dependantsOnLongerTerm: "dependants on the longer term",
  },
};
