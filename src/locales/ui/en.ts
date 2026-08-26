/**
 * Sitewide chrome strings — header, footer, nav, 404.
 *
 * Page *content* does not live here. Prose on this site is full of inline
 * links, `<strong>` runs and interpolated live figures from programmes.ts, and
 * flattening that into key/value strings would either shred the markup or
 * produce keys like `pvip.section3.para2.boldRun1`. Page copy lives in
 * `src/content/<page>/<locale>.tsx` as real JSX instead. This file is only for
 * the short, structural strings that genuinely are single words or sentences.
 *
 * `en.ts` is the shape of record: every other locale is typed against
 * `UiStrings`, so adding a string here fails the build until it is translated,
 * which is the only reliable defence against a half-translated header.
 */
export type UiStrings = {
  siteName: string;
  siteDescription: string;
  /** Two lines, stacked in the header beside the mark. Kept short — as one
   *  45-character row this set the width of the whole brand block. */
  strapline: [string, string];
  askQuestion: string;
  menu: string;
  /** aria-labels. Translated because a screen reader announces them. */
  ariaPrimaryNav: string;
  ariaFooterNav: string;
  ariaLanguage: string;
  navGroups: Record<"programmes" | "work-study" | "tools" | "reading", string>;
  /** Keyed by the canonical (English, unprefixed) path in lib/site.ts.
   *  `assertRouteTitles()` there checks every route is covered. */
  routeTitles: Record<string, string>;
  /** The cost calculator's line-item labels and notes.
   *  `lib/cost.ts` composes each estimate while walking the programme data, so
   *  the wording lives here and the figures stay in `programmes.ts`. Every
   *  count-bearing label is a function: English pluralises, Chinese does not,
   *  and the two disagree about where a term suffix belongs in the phrase. */
  cost: {
    agencyFeePrincipal: string;
    agencyFeeCovers: (note: string, includes: string) => string;
    includesSeparator: string;
    additionalAgencyFee: (dependants: number) => string;
    additionalAgencyFeeNote: (from: string, included: number) => string;
    ordinal: (n: number) => string;
    participationFee: string;
    processingFee: string;
    passFee: string;
    visaFee: string;
    visaFeeNote: (
      note: string,
      nationality: string,
      amount: string,
      perYear: boolean,
    ) => string;
    securityBondPrincipal: string;
    securityBondNote: (
      note: string,
      nationality: string,
      amount: string,
    ) => string;
    securityBondDependants: (dependants: number) => string;
    fixedDeposit: string;
    propertyPurchase: string;
    propertyNote: (stateFloor: string | null) => string;
    /** "<fee> — main applicant (5 years)" */
    forPrincipal: (label: string, term: string) => string;
    /** "<fee> — 3 dependants (5 years)" */
    forDependants: (label: string, count: number, term: string) => string;
    /** "<fee> — 2 dependants on the 10-year term" */
    forDependantsOnTerm: (
      label: string,
      count: number,
      years: number,
    ) => string;
    termSuffix: (years: number) => string;
    each: (amount: string) => string;
    pricedAtFullTerm: (alternatives: string) => string;
    termAlternative: (years: number, amount: string) => string;
    termAlternativeSeparator: string;
  };
  /** Malaysian state and territory names, keyed by the slugs in
   *  `STATE_PROPERTY_FLOORS`. The figures are data; the place names are words,
   *  so they live here and the two are paired at render time. */
  states: Record<string, string>;
  /** The requirement lines the eligibility checker builds from programme data.
   *  They live here rather than in the quiz's copy because `lib/eligibility.ts`
   *  composes them while evaluating, before any copy is in scope — and each one
   *  takes its figure already formatted, so no number is written in words. */
  gates: {
    minAge: (age: number) => string;
    fixedDeposit: (amount: string) => string;
    income: (perPeriod: string) => string;
    salaryFrom: (monthly: string) => string;
    property: (from: string) => string;
    employerSponsor: string;
    institutionSponsor: string;
  };
  footer: {
    heading: string;
    /** The one accent word, set in the display face. */
    headingAccent: string;
    disclosureTitle: string;
    /** Split around the two inline links rather than carrying markup. */
    disclosureBefore: string;
    disclosureMypvip: string;
    disclosureBetween: string;
    disclosureAbout: string;
    disclosureAfter: string;
    rights: string;
  };
  /** Chrome around every programme guide — GuideLayout and its sub-components. */
  guide: {
    onThisPage: string;
    contentsSuits: string;
    contentsQuestions: string;
    honestFitEyebrow: string;
    honestFitTitleLead: string;
    honestFitTitleAccent: string;
    goodFitIf: string;
    lookElsewhereIf: string;
    ctaDefault: string;
    faqEyebrow: string;
    faqTitleLead: string;
    faqTitleAccent: string;
    atAGlance: string;
    keyFactsHeading: string;
    sourceLabel: string;
      /** Joins "20 years" to "renewable" — a full-width comma in Chinese. */
    listSeparator: string;
    keyFactsLabel: (programme: string) => string;
    /** Split around the two inline links: "<before>Jason Yap<mid>MYPVIP<after>".
     *  Three segments rather than two because Chinese puts the job title after
     *  the company ("MYPVIP 董事总经理") where English puts it before. */
    bylineBefore: string;
    bylineMid: string;
    bylineAfter: string;
    bylineLastReviewed: (date: string) => string;
    /** The tier comparison table — components/TierTable.tsx. */
    tiers: {
      fixedDeposit: string;
      propertyPurchase: string;
      optional: string;
      term: string;
      participationFee: string;
      agencyFee: string;
      notGovernmentSet: string;
      agencyFeeCommercialNote: string;
      /** Joins the agency fee's inclusions inside `agencyFeeCovers`. */
      includesSeparator: string;
      agencyFeeCovers: (note: string, includes: string, terms: string) => string;
      processingFee: string;
      processingFeePrincipal: (amount: string) => string;
      processingFeeAbsorbed: string;
      minAge: string;
      minStay: string;
      workRights: string;
      workYes: string;
      workRestricted: string;
      workNo: string;
      workFullNote: string;
      workRestrictedNote: string;
      sponsor: string;
      incomeFloor: string;
      noneStated: string;
      maximumTerm: string;
      governmentFee: string;
      dependants: string;
      permitted: string;
      notPermitted: string;
      renewableSuffix: string;
      /** Screen-reader-only labels in the table shell. */
      attributeColumn: string;
      seeNote: string;
    };
    /** The correction banner — components/SupersededNotice.tsx. */
    superseded: {
      /** The date half of the summary. The programmes are rendered separately
       *  and first, so this no longer takes a name. */
      changedOn: (date: string) => string;
      /** Joins the programme names one change applies to. Chinese enumerates
       *  parallel nouns with 、 rather than the comma `listSeparator` uses. */
      nameSeparator: string;
      /** aria-label for the notice's landmark; takes the joined name list. */
      termsChangedLabel: (programmes: string) => string;
      figuresArePrevious: string;
      showWhatChanged: string;
      hide: string;
      confirmedByBefore: string;
      confirmedByAfter: (date: string) => string;
      officialDocument: (authority: string) => string;
      notYetUpdated: string;
      treatAsUnconfirmed: string;
    };
    /** KeyFacts row labels and the phrases its values are assembled from. */
    facts: {
      authority: string;
      tenure: string;
      minAge: string;
      fixedDeposit: string;
      incomeRequirement: string;
      minSalary: string;
      sponsorRequired: string;
      propertyPurchase: string;
      participationFee: string;
      processingFee: string;
      minStay: string;
      workRights: string;
      none: string;
      renewable: string;
      aMonth: (amount: string) => string;
      from: (amount: string) => string;
      principal: (amount: string) => string;
      principalAndDependant: (principal: string, dependant: string) => string;
      perDependantTerms: (principal: string, terms: string) => string;
      forYears: (amount: string, years: string) => string;
      or: string;
      workRightsFull: string;
      workRightsRestricted: string;
      workRightsNone: string;
    };
  };
  consent: {
    heading: string;
    body: string;
    bodyOptOut: string;
    privacyLink: string;
    decline: string;
    accept: string;
  };
  notFound: {
    eyebrow: string;
    heading: string;
    headingAccent: string;
    lead: string;
    tailBefore: string;
    tailNews: string;
    tailBetween: string;
    tailContact: string;
    tailAfter: string;
    metaTitle: string;
  };
};

export const ui: UiStrings = {
  siteName: "Malaysia Visa Guide",
  siteDescription:
    "An independent guide to Malaysia's long-stay visa programmes — PVIP, MM2H, Sarawak MM2H and DE Rantau. Costs, requirements and timelines, verified against official sources.",
  strapline: ["Independent visa guide", "not a government body"],
  askQuestion: "Ask a question",
  menu: "Menu",
  ariaPrimaryNav: "Primary",
  ariaFooterNav: "Footer",
  ariaLanguage: "Language",

  navGroups: {
    programmes: "Long-stay visas",
    "work-study": "Work & study",
    tools: "Tools & compare",
    reading: "Insights & news",
  },

  cost: {
    agencyFeePrincipal: "Agency fee — main applicant",
    agencyFeeCovers: (note, includes) => `${note} Covers: ${includes}.`,
    includesSeparator: "; ",
    additionalAgencyFee: (d) =>
      `Additional agency fee — ${d} dependant${d > 1 ? "s" : ""}`,
    additionalAgencyFeeNote: (from, included) =>
      `Charged from the ${from} dependant onwards, so the first ${included === 1 ? "one is" : `${included} are`} already inside the fee above.`,
    ordinal: (n) => {
      const suffix =
        n % 100 >= 11 && n % 100 <= 13
          ? "th"
          : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th");
      return `${n}${suffix}`;
    },
    participationFee: "Participation fee",
    processingFee: "Government processing fee",
    passFee: "Immigration pass fee",
    visaFee: "Multiple-entry visa fee",
    visaFeeNote: (note, nationality, amount, perYear) =>
      `${note} ${nationality}: ${amount}${perYear ? " a year" : ""}.`,
    securityBondPrincipal: "Security bond — main applicant",
    securityBondNote: (note, nationality, amount) =>
      `${note} Set by nationality — ${nationality}: ${amount}.`,
    securityBondDependants: (d) =>
      `Security bond — ${d} dependant${d > 1 ? "s" : ""}`,
    fixedDeposit: "Fixed deposit",
    propertyPurchase: "Property purchase (minimum)",
    propertyNote: (stateFloor) =>
      stateFloor
        ? `A property you own, not a fee — but capital you must commit to qualify. ${stateFloor}`
        : "A property you own, not a fee — but capital you must commit to qualify.",
    forPrincipal: (label, term) => `${label} — main applicant${term}`,
    forDependants: (label, count, term) =>
      `${label} — ${count} dependant${count > 1 ? "s" : ""}${term}`,
    forDependantsOnTerm: (label, count, years) =>
      `${label} — ${count} dependant${count > 1 ? "s" : ""} on the ${years}-year term`,
    termSuffix: (years) => (years > 1 ? ` (${years} years)` : ""),
    each: (amount) => `${amount} each.`,
    pricedAtFullTerm: (alternatives) =>
      `Priced at the full term. The other term available is ${alternatives}.`,
    termAlternative: (years, amount) => `${years} years at ${amount} each`,
    termAlternativeSeparator: ", or ",
  },
  states: {
    selangor: "Selangor",
    "kuala-lumpur": "Kuala Lumpur",
  },
  gates: {
    minAge: (age) => `Minimum age ${age}`,
    fixedDeposit: (amount) => `A fixed deposit of ${amount}`,
    income: (perPeriod) => `Income of ${perPeriod}`,
    salaryFrom: (monthly) => `A salary from ${monthly} a month`,
    property: (from) => `Buying property from ${from}`,
    employerSponsor: "A Malaysian employer approved to hire you",
    institutionSponsor: "A place at an institution to sponsor the pass",
  },
  routeTitles: {
    "/": "Home",
    "/insights/": "Insights",
    "/news/": "News",
    "/visas/pvip/": "PVIP",
    "/visas/mm2h/": "MM2H",
    "/visas/sarawak-mm2h/": "Sarawak MM2H",
    "/visas/de-rantau/": "DE Rantau",
    "/visas/employment-pass/": "Employment Pass",
    "/visas/student-pass/": "Student Pass",
    "/compare/": "Compare",
    "/tools/eligibility/": "Eligibility checker",
    "/tools/cost-calculator/": "Cost calculator",
    "/tools/": "Tools",
    "/about/": "About",
    "/editorial-policy/": "Editorial policy",
    "/privacy/": "Privacy",
    "/contact/": "Contact",
  },

  footer: {
    heading: "The programmes, the real numbers, and",
    headingAccent: "no sales pitch",
    disclosureTitle: "Publisher & disclosure",
    disclosureBefore:
      "An independent guide — not affiliated with the Immigration Department of Malaysia or any government agency. Published by Jason Yap, Managing Director of ",
    disclosureMypvip: "MYPVIP",
    disclosureBetween:
      ", a licensed agency whose services are described on ",
    disclosureAbout: "the about page",
    disclosureAfter: ".",
    rights: "All rights reserved.",
  },

  guide: {
    onThisPage: "On this page",
    contentsSuits: "Who it suits",
    contentsQuestions: "Common questions",
    honestFitEyebrow: "Honest fit",
    honestFitTitleLead: "Who it suits — and",
    honestFitTitleAccent: "who it doesn't",
    goodFitIf: "A good fit if",
    lookElsewhereIf: "Look elsewhere if",
    ctaDefault: "Continue",
    faqEyebrow: "FAQ",
    faqTitleLead: "Common",
    faqTitleAccent: "questions",
    atAGlance: "At a glance",
    keyFactsHeading: "Key facts",
    sourceLabel: "Source:",
    listSeparator: ", ",
    keyFactsLabel: (programme) => `Key facts: ${programme}`,
    bylineBefore: "Written and reviewed by ",
    bylineMid: ", Managing Director of ",
    bylineAfter: "",
    bylineLastReviewed: (date) => `Last reviewed ${date}.`,
    tiers: {
      fixedDeposit: "Fixed deposit",
      propertyPurchase: "Property purchase",
      optional: "Optional",
      term: "Term",
      participationFee: "Participation fee",
      agencyFee: "Agency fee",
      notGovernmentSet: "Not government-set",
      agencyFeeCommercialNote:
        "Set commercially by the agency and published nowhere official. Get the figure in writing before committing.",
      includesSeparator: "; ",
      agencyFeeCovers: (note, includes, terms) =>
        `${note} Covers ${includes}. ${terms}`,
      processingFee: "Processing fee",
      processingFeePrincipal: (amount) => `${amount} principal`,
      processingFeeAbsorbed:
        "Already inside the agency fee above — it should not appear twice on a quote.",
      minAge: "Minimum age",
      minStay: "Minimum stay",
      workRights: "Work rights",
      workYes: "Yes",
      workRestricted: "Restricted",
      workNo: "No",
      workFullNote: "May work and run a business.",
      workRestrictedNote: "Conditions apply.",
      sponsor: "Sponsor",
      incomeFloor: "Income floor",
      noneStated: "None stated",
      maximumTerm: "Maximum term",
      governmentFee: "Government fee",
      dependants: "Dependants",
      permitted: "Permitted",
      notPermitted: "Not permitted",
      renewableSuffix: ", renewable",
      attributeColumn: "Attribute",
      seeNote: "See note ",
    },
    superseded: {
      changedOn: (date) => `terms changed on ${date}`,
      nameSeparator: ", ",
      termsChangedLabel: (programmes) => `${programmes}: terms have changed`,
      figuresArePrevious: " — the figures below are the previous ones",
      showWhatChanged: "Show what changed",
      hide: "Hide",
      confirmedByBefore: "Confirmed by ",
      confirmedByAfter: (date) => `, current as at ${date}. The `,
      officialDocument: (authority) => `official ${authority} document`,
      /* "cannot be cited to a government source" was true while every
         superseded block rested on an agency's practice. PVIP's now rests on a
         government guideline with no public URL, so the honest limit is that
         the reader cannot check us against the linked document — not that no
         document exists. Still true of the MM2H notices, which is why one
         string covers both. */
      notYetUpdated:
        " has not yet been updated, so the figures above cannot be checked against it. ",
      treatAsUnconfirmed:
        "Until it is, treat every figure on this page as needing confirmation before you act on it.",
    },
    facts: {
      authority: "Authority",
      tenure: "Tenure",
      minAge: "Minimum age",
      fixedDeposit: "Fixed deposit",
      incomeRequirement: "Income requirement",
      minSalary: "Minimum salary",
      sponsorRequired: "Sponsor required",
      propertyPurchase: "Property purchase",
      participationFee: "Participation fee",
      processingFee: "Processing fee",
      minStay: "Minimum stay",
      workRights: "Work rights",
      none: "None",
      renewable: "renewable",
      aMonth: (amount) => `${amount} a month`,
      from: (amount) => `From ${amount}`,
      principal: (amount) => `${amount} principal`,
      principalAndDependant: (principal, dependant) =>
        `${principal} principal, ${dependant} per dependant`,
      perDependantTerms: (principal, terms) =>
        `${principal} principal. Per dependant: ${terms}`,
      forYears: (amount, years) => `${amount} for ${years}`,
      or: ", or ",
      workRightsFull: "Full — may work and run a business",
      workRightsRestricted: "Restricted — conditions apply",
      workRightsNone: "None",
    },
  },

  consent: {
    heading: "Cookies on this site",
    body: "Analytics cookies help us see which guides get read. They are off until you turn them on, and the site works exactly the same either way.",
    bodyOptOut: "Analytics cookies help us see which guides get read. They are on unless you turn them off, and the site works exactly the same either way.",
    privacyLink: "Privacy policy",
    decline: "Decline",
    accept: "Accept",
  },

  notFound: {
    eyebrow: "Error 404",
    heading: "That page isn't",
    headingAccent: "here",
    lead: "The link may be out of date, or the page may have moved. Everything the guide covers is below.",
    tailBefore: "Looking for something specific? Read the ",
    tailNews: "latest news",
    tailBetween: ", or ",
    tailContact: "ask a question",
    tailAfter:
      " and you'll get a reply from the person who writes these guides.",
    metaTitle: "Page not found",
  },
};
