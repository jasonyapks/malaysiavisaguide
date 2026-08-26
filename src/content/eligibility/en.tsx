import type { EligibilityCopy } from "./types";

/**
 * English eligibility-checker copy — moved here from the page and the quiz
 * component, verbatim apart from the strings that had to become functions to
 * carry a count or a figure.
 *
 * The capital bands are the USD floors converted at INDICATIVE_USD_TO_MYR, so
 * they move when the rate does. At RM4.10 the top two bands sit lower than they
 * did at RM4.70 — a reader with RM2.1 million now clears the USD 500,000 tier,
 * and did not before. Change a band and change its `patch` in the same edit.
 */
export const copy: EligibilityCopy = {
  meta: {
    title: "Which Malaysian visa do you qualify for?",
    description:
      "A short quiz that reads your age, means and plans and tells you which Malaysian long-stay programmes and work/study passes you actually qualify for — and which you just miss.",
  },

  heading: "Which visa do you qualify for?",
  lead: "Six questions at most. No sign-up, nothing stored, no sales pitch — just an honest read of which programmes fit your situation, checked against the same official figures used across this site.",

  steps: {
    goal: {
      prompt: "What's your main plan for Malaysia?",
      help: "This decides which programmes are even open to you.",
      choices: [
        {
          label: "Live here long-term",
          hint: "Retire, relocate, or set up a family base — no local job needed",
          patch: { goal: "live" },
        },
        {
          label: "Work remotely for a foreign employer or clients",
          hint: "Income paid from outside Malaysia",
          patch: { goal: "remote" },
        },
        {
          label: "Take a job with a Malaysian employer",
          hint: "A local company hires and sponsors you",
          patch: { goal: "job" },
        },
        {
          label: "Study at a Malaysian institution",
          hint: "A school, college or university place",
          patch: { goal: "study" },
        },
      ],
    },
    age: {
      prompt: "How old are you?",
      help: "Two long-stay programmes carry a minimum age.",
      choices: [
        { label: "Under 25", patch: { ageFloor: 24 } },
        { label: "25 – 29", patch: { ageFloor: 25 } },
        { label: "30 – 49", patch: { ageFloor: 30 } },
        { label: "50 or older", patch: { ageFloor: 50 } },
      ],
    },
    capital: {
      prompt: "Roughly how much could you place as a deposit or investment?",
      help: "Money you could lock in a fixed deposit or put into property. It stays yours — a deposit is not a fee.",
      choices: [
        { label: "Under RM 500,000", patch: { capitalMYR: 0 } },
        { label: "RM 500,000 – RM 1 million", patch: { capitalMYR: 500_000 } },
        {
          label: "RM 1 million – RM 2.05 million",
          hint: "≈ USD 150,000 – 500,000",
          patch: { capitalMYR: 1_000_000 },
        },
        {
          label: "RM 2.05 million – RM 4.1 million",
          hint: "≈ USD 500,000 – 1 million",
          patch: { capitalMYR: 2_050_000 },
        },
        {
          label: "More than RM 4.1 million",
          hint: "≈ USD 1 million+",
          patch: { capitalMYR: 4_100_000 },
        },
      ],
    },
    income: {
      prompt: "What's your income, before tax?",
      help: "Use the ringgit equivalent if you're paid in another currency.",
      choices: [
        { label: "Under RM 5,000 a month", patch: { incomeMYR: 0 } },
        { label: "RM 5,000 – RM 10,000 a month", patch: { incomeMYR: 5_000 } },
        { label: "RM 10,000 – RM 40,000 a month", patch: { incomeMYR: 10_000 } },
        { label: "RM 40,000 a month or more", patch: { incomeMYR: 40_000 } },
      ],
    },
    property: {
      prompt: "Would you buy Malaysian property to qualify?",
      help: "MM2H requires a property purchase. The other programmes never do.",
      choices: [
        { label: "Yes, I'd buy property", patch: { buyProperty: true } },
        { label: "No, or I'd rather not", patch: { buyProperty: false } },
      ],
    },
    sponsor: {
      prompt: "Do you already have an employer or institution lined up?",
      help: "This pass can't be applied for without one.",
      choices: [
        { label: "Yes", patch: { hasSponsor: true } },
        { label: "Not yet", patch: { hasSponsor: false } },
      ],
    },
  },

  progress: {
    counter: (current, total) => `Question ${current} of ${total}`,
    start: "Let's start",
    back: "Back",
  },

  results: {
    heading: "Your results",
    goalIntro: {
      live: "Based on what you told us, here's where you stand on the four long-stay programmes.",
      remote:
        "Here's the remote-work route, plus the long-stay programmes your means could also open.",
      job: "Working for a Malaysian employer means one route — the Employment Pass.",
      study: "Studying in Malaysia means one route — the Student Pass.",
    },
    fitsHeading: (count) =>
      count === 1 ? "One programme fits" : `${count} programmes fit`,
    nearMissHeading: "So close",
    nearMissLead:
      "Ruled out by a single requirement — worth a look if your situation might change.",
    needsOnly: "Needs only:",
    readGuide: "Read the full guide",
    nothingFits:
      "Nothing lines up cleanly with the answers you gave — which is common, and doesn't mean there's no route. The programmes change often, and the edge cases are exactly where an experienced agent earns their fee.",
  },

  cta: {
    title: "Want a second opinion from someone who's done this 500+ times?",
    body: "Jason reviews cases personally — no obligation, and he'll tell you if the DIY route is genuinely better for you.",
    ask: "Ask a question",
    compare: "Compare side by side",
  },

  disclaimer: (rate) =>
    `This is a guide, not a determination or legal advice. US-dollar thresholds are compared at an indicative USD 1 ≈ RM${rate} — the rate you actually get is part of the real cost. Every figure behind these results is drawn from the official sources cited on each programme's guide page.`,

  startOver: "Start over",
};
