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
