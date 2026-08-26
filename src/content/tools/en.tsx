import type { ToolsCopy } from "./types";

/**
 * English /tools/ copy — moved here verbatim from app/(en)/tools/page.tsx.
 *
 * The page is written as a *decision* — which of the two answers your question,
 * and in what order to run them — rather than as a list of links. An index that
 * only restates its children's titles is thin content, and everything on it
 * already appears in the header dropdown.
 */
export const copy: ToolsCopy = {
  meta: { title: "Visa tools" },

  description:
    "Two free tools for Malaysia's long-stay visas: a six-question eligibility check that tells you which programmes you qualify for, and an itemised cost calculator that separates the deposit you get back from the fees you don't.",

  eyebrow: "Tools",

  heading: (
    <>
      Work out{" "}
      <span className="font-display accent-text font-medium italic">
        where you stand
      </span>
    </>
  ),

  order: {
    eyebrow: "Start here",
    title: (
      <>
        Eligibility first,{" "}
        <span className="font-display accent-text font-medium italic">
          then cost
        </span>
      </>
    ),
    sub: "Run them in that order. Cost is the question everyone opens with, and it is the wrong one to open with: a total for MM2H Platinum means nothing if the liquid-asset threshold rules you out on the first question. Find out what is open to you, then price only those.",
  },

  tools: {
    "/tools/eligibility/": {
      title: "Eligibility checker",
      question: "Which ones am I allowed to apply for?",
      body: "Six questions at most — age, income, capital and what you plan to do here. It returns the programmes you qualify for, the ones you just miss and by how much, and it stores nothing.",
      minutes: "about 2 minutes",
    },
    "/tools/cost-calculator/": {
      title: "Cost calculator",
      question: "What will it actually cost me?",
      body: "An itemised total by programme and family size, built on the same official figures as the guides. Refundable fixed deposits are kept strictly apart from the fees you never see again — the distinction most quoted prices blur.",
      minutes: "about 1 minute",
    },
  },

  openLabel: "Open",

  footnote: {
    before:
      "Neither tool asks for your name or email, and neither one stores an answer. If you would rather read the numbers side by side than answer questions, that is",
    compareLink: "the comparison table",
    between: ". If you already know which programme you want, go straight to",
    guideLink: "its guide",
    after: ".",
  },

  schemaName: "Malaysia visa tools",
};
