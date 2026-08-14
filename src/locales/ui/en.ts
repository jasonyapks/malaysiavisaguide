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
    /** The correction banner — components/SupersededNotice.tsx. */
    superseded: {
      termsChangedOn: (programme: string, date: string) => string;
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
    superseded: {
      termsChangedOn: (programme, date) => `${programme} terms changed on ${date}`,
      figuresArePrevious: " — the figures below are the previous ones",
      showWhatChanged: "Show what changed",
      hide: "Hide",
      confirmedByBefore: "Confirmed by ",
      confirmedByAfter: (date) => `, current as at ${date}. The `,
      officialDocument: (authority) => `official ${authority} document`,
      notYetUpdated:
        " has not yet been updated, so these terms cannot be cited to a government source. ",
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
