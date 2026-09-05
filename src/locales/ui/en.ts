import type { InsightCategory as InsightCategoryId } from "@/lib/data/insights";
import type { NewsCategory as NewsCategoryId } from "@/lib/news";

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
    /** The full stop that ends the byline sentence. Chinese uses 。 */
    bylineEnd: string;
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
  /**
   * The news section's chrome, and the names of its categories.
   *
   * News *articles* are content files under `content/` and are translated by
   * `scripts/translate-content.mjs`; what lives here is everything around them
   * that a translator would otherwise have to find inside a .tsx file —
   * headings, breadcrumbs, the CTA prose, and the category names, which are
   * shared by the cards, the browse strip, the sitemap and the JSON-LD.
   *
   * Prose carrying an inline link is split the way `notFound` above splits it:
   * a `Before`/`Between`/`After` run around the label of each link. Clumsy to
   * read, and the alternative is either markup in a string or a sentence that
   * cannot be reordered — and Chinese reorders this one.
   */
  news: {
    categoryLabel: Record<NewsCategoryId, string>;
    categoryBlurb: Record<NewsCategoryId, string>;
    /** "<label> news" is wrong for some labels; only those are listed. */
    categoryPageTitle: Partial<Record<NewsCategoryId, string>>;
    categoryPageTitleFor: (label: string) => string;
    /** The guide each category hands the reader on to. Paths live in lib/news.ts. */
    guideTitle: Record<NewsCategoryId, string>;
    comparisonTitle: string;
    guidesTitle: string;
    eligibilityLink: string;
    index: {
      metaTitle: string;
      metaDescription: string;
      h1: string;
      lead: string;
      empty: string;
      moreEyebrow: string;
      moreTitle: string;
      moreTitleAccent: string;
      footerBefore: string;
      footerBetween: string;
      footerAfter: string;
    };
    card: {
      readFull: string;
      minRead: (minutes: number) => string;
      via: (source: string) => string;
      browseAria: string;
      allStories: string;
      /** Read aloud in place of the bare digit beside a category name. */
      countLabel: (label: string, count: number) => string;
    };
    article: {
      breadcrumbHome: string;
      breadcrumbNews: string;
      shortVersion: string;
      whatItMeansEyebrow: string;
      whatItMeansTitle: string;
      whatItMeansAccent: string;
      quotedFrom: string;
      /** Empty in English. Elsewhere: the quote the reader sees is a translation. */
      quoteTranslated: string;
      sourceHeading: string;
      sourceBefore: string;
      sourceAfter: string;
      lastUpdated: (date: string) => string;
      ctaLead: string;
      ctaBefore: string;
      ctaBetween: string;
      ctaAfter: string;
      authorJobTitle: string;
    };
    category: {
      oneStory: string;
      manyStories: (count: number) => string;
      reviewedNote: string;
      moreOn: (label: string) => string;
      moreTitle: string;
      moreTitleAccent: string;
      footerBefore: string;
      footerBetween: string;
      footerAfter: string;
    };
  };
  /**
   * The /insights/ section's chrome, and the names of its categories.
   *
   * Same split as `news` above: the articles are content files translated by
   * scripts/translate-content.mjs, and everything around them lives here.
   */
  insights: {
    categoryLabel: Record<InsightCategoryId, string>;
    /** The h1 of the category's own index page. */
    categoryTitle: Record<InsightCategoryId, string>;
    categoryBlurb: Record<InsightCategoryId, string>;
    browseAria: string;
    index: {
      metaTitle: string;
      metaDescription: string;
      eyebrow: string;
      h1: string;
      h1Accent: string;
      moreEyebrow: string;
      moreTitle: string;
      moreTitleAccent: string;
      empty: string;
      footerBefore: string;
      newsLink: string;
      footerBetween: string;
      compareLink: string;
      footerAfter: string;
    };
    article: {
      breadcrumb: string;
      publishedLine: (minutes: number, date: string) => string;
      reviewedLine: (minutes: number, date: string) => string;
      sourcesHeading: string;
      sourcesNoteBefore: string;
      editorialLink: string;
      sourcesNoteAfter: string;
      checkedOn: (date: string) => string;
      handoffBefore: string;
      listSeparator: string;
      listLast: string;
      handoffBetween: string;
      eligibilityLink: string;
      handoffAfter: string;
    };
    category: {
      oneArticle: string;
      manyArticles: (count: number) => string;
      tracedNote: string;
      footerBefore: string;
      compareLink: string;
      footerBetween: string;
      calculatorLink: string;
      footerAfter: string;
    };
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
    bylineEnd: ".",
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

  news: {
    categoryLabel: {
      pvip: "PVIP",
      mm2h: "MM2H",
      "sarawak-mm2h": "Sarawak MM2H",
      "de-rantau": "DE Rantau",
      "employment-pass": "Employment Pass",
      "student-pass": "Student Pass",
      general: "Immigration",
      world: "Other countries",
    },
    categoryBlurb: {
      pvip: "Changes to the Premium Visitor Pass — the participation fee, the fixed deposit, and how the 20-year term is being applied in practice.",
      mm2h: "Malaysia My Second Home news — the Silver, Gold and Platinum tiers, deposit and property thresholds, and the agent requirement.",
      "sarawak-mm2h":
        "Sarawak's own MM2H — the state programme with its own deposit, its own approvals and its own rules, reported separately because it moves separately.",
      "de-rantau":
        "DE Rantau, Malaysia's digital nomad pass — income thresholds, eligible professions and how the twelve-month pass is renewed.",
      "employment-pass":
        "Employment Pass news — the EP I, II and III salary tiers, ESD processing, and the rules employers and holders both have to meet.",
      "student-pass":
        "Student Pass news — EMGS processing, institution sponsorship, and the conditions attached to studying in Malaysia.",
      general:
        "Malaysian immigration policy that affects foreign nationals across the programmes rather than any single one of them.",
      world:
        "Long-stay, retirement and investor visas in other countries — the alternatives a reader is weighing Malaysia against, reported for comparison rather than recommendation.",
    },
    categoryPageTitle: {
      world: "Visa news from other countries",
      general: "Malaysian immigration news",
    },
    categoryPageTitleFor: (label) => `${label} news`,
    guideTitle: {
      pvip: "the PVIP guide",
      mm2h: "the MM2H guide",
      "sarawak-mm2h": "the Sarawak MM2H guide",
      "de-rantau": "the DE Rantau guide",
      "employment-pass": "the Employment Pass guide",
      "student-pass": "the Student Pass guide",
      general: "the programme comparison",
      world: "how Malaysia compares",
    },
    comparisonTitle: "the programme comparison",
    guidesTitle: "programme guides",
    eligibilityLink: "run the eligibility checker",
    index: {
      metaTitle: "Malaysia visa news",
      metaDescription:
        "Malaysia long-stay visa news, explained — PVIP, MM2H, Sarawak MM2H, DE Rantau and the work and study passes. Each story written up in full, with its source cited.",
      h1: "Malaysia visa news",
      lead: "What changes in Malaysia's long-stay visa programmes, written up in full — the figures, and what each change actually means if you are applying. Every story is hand-reviewed before it appears, and every story cites the reporting it is based on.",
      empty:
        "No stories published yet — the programme guides carry the current verified figures in the meantime.",
      moreEyebrow: "More updates",
      moreTitle: "Everything else",
      moreTitleAccent: "worth knowing",
      footerBefore: "News is a starting point, not advice. For what a rule actually means for your case, read the ",
      footerBetween: " or ",
      footerAfter: ".",
    },
    card: {
      readFull: "Read the full story",
      minRead: (minutes) => `${minutes} min read`,
      via: (source) => `via ${source}`,
      browseAria: "Browse news by category",
      allStories: "All stories",
      countLabel: (label, count) =>
        `${label} — ${count} ${count === 1 ? "story" : "stories"}`,
    },
    article: {
      breadcrumbHome: "Home",
      breadcrumbNews: "News",
      shortVersion: "The short version",
      whatItMeansEyebrow: "What it means",
      whatItMeansTitle: "What this changes",
      whatItMeansAccent: "for an applicant",
      quotedFrom: "Quoted from",
      quoteTranslated: "",
      sourceHeading: "Source",
      sourceBefore: "This article was written by Malaysia Visa Guide, based on reporting by ",
      sourceAfter:
        ". We summarise and explain the news in our own words; we do not reproduce it. Read the original report for the publisher's full account.",
      lastUpdated: (date) => `Last updated ${date}.`,
      ctaLead: "News is a starting point, not advice.",
      ctaBefore: "For what this means in your own case, the verified figures live in ",
      ctaBetween: ", or ",
      ctaAfter: ".",
      authorJobTitle: "Managing Director, MYPVIP",
    },
    category: {
      oneStory: "One story so far.",
      manyStories: (count) => `${count} stories, newest first.`,
      reviewedNote:
        "Every one is hand-reviewed before it appears and cites the reporting it is based on.",
      moreOn: (label) => `More on ${label}`,
      moreTitle: "Everything else",
      moreTitleAccent: "in this category",
      footerBefore: "News is a starting point, not advice. For what these changes mean for your own case, read ",
      footerBetween: " or ",
      footerAfter: ".",
    },
  },

  insights: {
    categoryLabel: {
      comparisons: "Comparisons",
      "by-nationality": "By nationality",
      "expat-living": "Expat living",
      perspective: "From the desk",
      "how-to": "How-to",
    },
    categoryTitle: {
      comparisons: "Comparisons and decision guides",
      "by-nationality": "Malaysia visas by nationality",
      "expat-living": "Expat living, tax and money",
      perspective: "From the desk",
      "how-to": "How to apply, step by step",
    },
    categoryBlurb: {
      comparisons:
        "Side-by-side decisions rather than feature lists — which programme actually fits a given income, a given pile of capital, and a given plan for the next twenty years.",
      "by-nationality":
        "What changes when the passport changes: documentation, visa fees rated by nationality, and the parts of an application that behave differently depending on where you are from.",
      "expat-living":
        "The questions that arrive straight after the visa question — tax residency and offshore income, property thresholds by state, opening a bank account, schools and healthcare.",
      perspective:
        "First-person notes from running two licensed Malaysian long-stay agencies — where the published rules and the counter behave differently, and what that costs an applicant.",
      "how-to":
        "The application itself, in the order it actually happens — what has to be in hand before you file, what only unlocks after approval, and the steps that must be done inside Malaysia rather than from home.",
    },
    browseAria: "Browse by category",
    index: {
      metaTitle: "Insights",
      metaDescription:
        "Comparisons, decision guides and first-person notes on Malaysia's long-stay visas — written by Jason Yap from 500+ relocation cases, with every figure traced to an official source.",
      eyebrow: "Insights",
      h1: "Which programme is",
      h1Accent: "actually yours",
      moreEyebrow: "More",
      moreTitle: "Everything else",
      moreTitleAccent: "worth reading",
      empty: "No articles published yet.",
      footerBefore: "Looking for what changed rather than what to choose? That is ",
      newsLink: "the news feed",
      footerBetween: ". For the programme reference pages, start with ",
      compareLink: "the comparison table",
      footerAfter: ".",
    },
    article: {
      breadcrumb: "Insights",
      publishedLine: (minutes, date) => `${minutes} min read · Published ${date}`,
      reviewedLine: (minutes, date) => `${minutes} min read · Reviewed ${date}`,
      sourcesHeading: "Sources",
      sourcesNoteBefore:
        "Every figure above comes from an official government document. Where an official source is silent, this site says so rather than fill the gap — see ",
      editorialLink: "how we research and date pages",
      sourcesNoteAfter: ".",
      checkedOn: (date) => ` — checked ${date}`,
      handoffBefore: "This is a comparison, not advice on your own case. Read ",
      listSeparator: ", ",
      listLast: " or ",
      handoffBetween: ", or ",
      eligibilityLink: "run the eligibility checker",
      handoffAfter: " against your own numbers.",
    },
    category: {
      oneArticle: "One article so far.",
      manyArticles: (count) => `${count} articles, newest first.`,
      tracedNote:
        "Every figure is traced to an official government document and carries the date it was checked.",
      footerBefore: "Prefer the numbers side by side without the argument? Use ",
      compareLink: "the comparison table",
      footerBetween: " or ",
      calculatorLink: "the cost calculator",
      footerAfter: ".",
    },
  },
};
