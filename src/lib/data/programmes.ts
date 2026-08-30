/**
 * The sole source of truth for every number on this site — SPEC.md §4.1.
 *
 * Four consumers read from here: guide pages, the comparison table, the
 * eligibility quiz, and the cost calculator. When a rule changes, this file
 * is the only file that changes.
 *
 * Rule: nothing renders a number that didn't come from this file. If a figure
 * has no `source`, it doesn't ship.
 *
 * Every entry below was verified against an official government source on the
 * date in `lastVerified`. Where an official source is stale or silent, the
 * field is `null` and the gap is recorded in `UNVERIFIED` at the bottom of
 * this file rather than guessed at.
 */

export type ProgrammeSlug =
  | "pvip"
  | "mm2h-silver"
  | "mm2h-gold"
  | "mm2h-platinum"
  | "smm2h"
  | "de-rantau"
  | "student-pass"
  | "employment-pass";

export type Currency = "MYR" | "USD";

export type Money = {
  amount: number;
  currency: Currency;
};

/**
 * Long-stay programmes are deposit-gated: you qualify by placing capital.
 * Work/study passes are sponsor-gated: an employer or institution must back
 * you, and no deposit exists. The discriminant keeps the comparison table
 * from putting a fixed deposit and a salary floor in the same column, which
 * would be meaningless.
 */
export type ProgrammeCategory = "long-stay" | "work-study";

/**
 * A figure's authority when no official document states it yet.
 *
 * §4.1 says nothing renders a number without a source, and the intent behind
 * that rule is that a reader can check us. A government PDF is the best way to
 * satisfy it but not the only honest one: when a programme's terms change and
 * the published FAQ lags by months, the choice is between serving figures we
 * know are superseded and attributing the current ones to the practice that is
 * filing applications under them every week.
 *
 * So attribution is a *named, dated* assertion, rendered on the page — never an
 * unmarked number. The reader is told exactly whose word a figure rests on and
 * what the official source still says, and can weigh that themselves. An
 * attributed figure is not a guess and must never be used to launder one; if we
 * do not actually know it, the field stays null and the question goes to
 * UNVERIFIED as before.
 */
export type Attribution = {
  /** Rendered verbatim. Who is asserting this. */
  by: string;
  /** ISO date the assertion was made and was current. */
  asAt: string;
};

/**
 * Set when a programme's official source is known to be out of date.
 *
 * This is what makes the lag visible instead of invisible. `whatChanged` may
 * only contain things we can actually stand behind; anything still unknown
 * belongs in UNVERIFIED, not here, and `figuresPending` says out loud that the
 * numbers rendered on the page are still the superseded ones.
 */
export type Superseded = {
  /** When the change took effect, ISO. Formatted at render through
   *  `reviewDate(_, locale)` — it used to be stored as English prose
   *  ("16 March 2026"), which no locale could do anything with, and it read as
   *  an English date mid-sentence on every Chinese page that showed it. */
  changedOn: string;
  attribution: Attribution;
  /** Publishable, confirmed changes. Qualitative where a figure is not yet known. */
  whatChanged: string[];
  /**
   * True while the numeric fields on this Programme are still the superseded
   * ones. Drives the warning; set false only once every field is corrected.
   */
  figuresPending: boolean;
};

/**
 * Government charges beyond the participation and processing fees.
 *
 * All of these ARE government fees — the participation fee is one too, not a
 * separate category from them. The split is a modelling convenience only: the
 * fees above are flat per person, these are priced per year or by passport.
 *
 * These were missing from the site entirely until 2026-07-28, and their absence
 * flattered both programmes: a PVIP applicant on a five-year initial approval
 * pays RM10,000 in pass fees alone, and an MM2H applicant pays a government-set
 * agency fee that is larger than every other fee on the tier combined. A cost
 * page that omits them is not a cost page.
 *
 * Two of them — the multiple-entry visa fee and the principal's security bond —
 * are priced by nationality, not by programme. Those amounts live in
 * `nationality-fees.ts`; a programme only declares that it charges them.
 */
export type GovernmentExtras = {
  /**
   * Immigration pass fee, per person per year of the approved term. Collected
   * for the whole term when the visa is issued or renewed, not annually.
   */
  passFeePerYear?: {
    principal?: number;
    dependant?: number;
    currency: Currency;
    note: string;
  };
  /** Multiple-entry visa fee. Amount is nationality-dependent. */
  visaFee?: {
    appliesTo: ("principal" | "dependant")[];
    /** True where the fee is charged for each year of the term. */
    perYear: boolean;
    note: string;
  };
  /** Security bond. The principal's is nationality-dependent; a dependant's is flat. */
  securityBond?: {
    principalByNationality: boolean;
    dependant?: number;
    currency: Currency;
    note: string;
  };
  /**
   * Agency fee, where the government fixes it. MM2H only — PVIP agency fees are
   * set by the agency and are deliberately absent rather than guessed at.
   */
  agencyFee?: {
    principal: number;
    /** Charged per dependant beyond `dependantsIncluded`. */
    perDependant: number;
    /** How many dependants the principal's fee already covers. */
    dependantsIncluded: number;
    currency: Currency;
    /**
     * What the principal's fee already contains, so nothing is double-counted.
     *
     * Optional because the MM2H schedule publishes it and Sarawak's does not.
     * An empty list would read as "it covers nothing", which is a claim; absent
     * reads as "not published", which is the truth. Same rule as PVIP's agency
     * fee being missing entirely rather than estimated.
     */
    includes?: string[];
    /** True where the principal's processing fee is inside the agency fee. */
    absorbsPrincipalProcessingFee: boolean;
    /** When each part of it falls due. Absent where it is not published. */
    paymentTerms?: string;
    note: string;
  };
  /**
   * Years the initial approval runs, and the multiplier every per-year fee is
   * priced over.
   *
   * Five on both programmes, and fixed rather than offered as a choice: MM2H's
   * agency fee is written against exactly five years, and PVIP's approval is
   * capped by passport validity, where five is the ordinary case. The
   * calculator briefly let a reader vary it; Jason cut that on 2026-07-28
   * because a term dial invites the reader to model an edge case instead of
   * reading the figure that will actually be quoted to them.
   */
  defaultTermYears: number;
};

export type Programme = {
  slug: ProgrammeSlug;
  name: string;
  category: ProgrammeCategory;
  /** MOTAC, Immigration, Sarawak Immigration/MTCP, MDEC, EMGS, ESD */
  authority: string;
  tenureYears: number;
  renewable: boolean;
  /**
   * Qualifies `renewable` where the right to renew is capped. Rendered after
   * "renewable" wherever tenure is shown, so a limited renewal can never be
   * read as an open-ended one. Omit when renewal is unlimited.
   */
  renewalLimit?: string;
  minAge: number | null;
  fixedDeposit: (Money & { withdrawable?: string }) | null;
  incomeRequirement: (Money & { period: "month" | "year" }) | null;
  propertyPurchaseMin: Money | null;
  /**
   * Qualifies `propertyPurchaseMin` where a state floor overrides it.
   *
   * The programme minimum is a national figure, but a foreigner buying property
   * in Malaysia must also clear the threshold set by the state the property sits
   * in — and in the two states most applicants actually buy in, that threshold
   * is several times the programme's. Rendered anywhere the minimum is, because
   * "from RM600,000" read alone is the single most expensive misunderstanding
   * on this site.
   */
  propertyStateFloorNote?: string;
  participationFee:
    | {
        principal: number;
        /**
         * The dependant fee at the principal's own term. Where a dependant may
         * elect a shorter term for less, `dependantTerms` carries the full set
         * and this is the longest of them — so a consumer that ignores the
         * options quotes the higher number rather than the cheaper one.
         */
        dependant: number;
        currency: Currency;
        /**
         * Set only where a dependant's term is a choice rather than inherited
         * from the principal. PVIP is the sole case: the principal is fixed at
         * 20 years, a dependant may take 20 or 10.
         */
        dependantTerms?: { years: number; amount: number }[];
      }
    | null;
  /** Government processing fee, separate from any participation fee. */
  processingFee:
    | { principal: number; dependant: number; currency: Currency }
    | null;
  minStayPerYear: string | null;
  /**
   * Table-cell form of `minStayPerYear` — a few words, not a sentence.
   *
   * A comparison table is scanned, not read: one full sentence in one cell made
   * the Minimum stay row five times the height of its neighbours and pushed the
   * last programme column off the screen. The long form is still authoritative
   * and still published — the table renders this and footnotes that.
   */
  minStayShort: string | null;
  workRights: "full" | "restricted" | "none";
  dependants: string[];
  /** Work/study only: who must sponsor the application. */
  sponsor: string | null;
  /** Table-cell form of `sponsor`, for the same reason as `minStayShort`. */
  sponsorShort: string | null;
  /** Work/study only: minimum monthly salary the role must pay. */
  salaryFloor: Money | null;
  /** Further government charges, priced per year or by nationality. */
  governmentExtras?: GovernmentExtras;
  /** Official URL — every claim traceable. */
  source: string;
  /** ISO date. */
  lastVerified: string;
  /**
   * Present only when `source` is known to be superseded. Absent on a programme
   * whose official source is current, which is the normal case.
   */
  superseded?: Superseded;
};

/**
 * MM2H tier figures all come from one official MOTAC document — the One Stop
 * Centre category table published December 2025. Note it contradicts most
 * secondary reporting: the minimum age is 25 (not 30), the minimum stay is
 * 90 days for ages 25–49 with no requirement at all from 50, and the
 * participation fee varies enormously by tier.
 *
 * The participation fee is **per application, not per person** — confirmed by
 * Jason 2026-07-27. A dependant adds the RM2,500 processing fee below, plus
 * medical insurance and a medical examination, neither of which has a published
 * government figure (they are priced by the insurer and the clinic).
 */
// MOTAC's own 51-page MM2H guide, which supersedes the Insights-on-The-Categories
// extract previously cited: it carries the same category table plus the
// per-category detail pages, including the work-rights rows that extract omits.
// Every Silver/Gold/Platinum figure below was re-checked against it on 2026-07-28
// — deposit, property minimum, participation fee, term, minimum age and minimum
// stay all matched; only work rights had to change.
const MM2H_SOURCE =
  "https://www.motac.gov.my/wp-content/uploads/2025/12/Guide-Malaysia-My-Second-Home.pdf";

/**
 * The caveat that has to travel with `incomeRequirement: null` on MM2H.
 *
 * "No income requirement" is true and is the most useful single fact about the
 * programme — it is why an asset-rich, income-light applicant can take MM2H and
 * cannot take PVIP. But stated bare it invites the wrong inference, that an
 * applicant may turn up with nothing to show. No threshold is published and none
 * is scored; sustainability is still looked at, and an application is stronger
 * with bank statements or proof of income attached.
 *
 * This is practice, not a published rule, so it carries a named and dated
 * attribution wherever it is rendered — the same standard as any other figure
 * the official document does not yet state. It lives here rather than in three
 * page bodies because three copies of a nuance drift apart, and the flat claim
 * is made in three places.
 */
export const MM2H_INCOME_PRACTICE = {
  note: "No income threshold is published and none is applied. That is not the same as bringing nothing: an applicant is still expected to show they can sustain themselves in Malaysia, so bank statements or proof of income are worth attaching even though no figure has to be met.",
  attribution: { by: "MYPVIP practice", asAt: "2026-07-28" } satisfies Attribution,
} as const;

const MM2H_COMMON = {
  category: "long-stay" as const,
  authority: "MOTAC (One Stop Centre MM2H)",
  renewable: true,
  minAge: 25,
  incomeRequirement: null,
  // `incomeRequirement: null` says there is no published figure. It cannot say
  // what actually happens at the counter, and "no threshold" is easy to
  // over-read as "bring nothing". This carries that, with the attribution it
  // needs, and it lives on the programme so an article can reference it rather
  // than restate it.
  incomePractice: MM2H_INCOME_PRACTICE,
  processingFee: {
    principal: 5000,
    dependant: 2500,
    currency: "MYR" as const,
  },
  minStayPerYear:
    "90 days per year for ages 25–49, met between the main applicant and/or spouse and dependants. No minimum stay from age 50.",
  minStayShort: "90 days, ages 25–49",
  // Gold and Silver are "Not allowed" outright — the official guide's per-category
  // pages say business/investment activities and career opportunities are both
  // barred (pp.35, 39). Not "restricted": that would read as "you may work under
  // conditions", which is the opposite of what the document says. Platinum
  // overrides this to "full" — it is the only tier where both are Permissible.
  workRights: "none" as const,
  dependants: [
    "Spouse",
    // Up to 34 — that is, before the 35th birthday. MOTAC's guide says "up to
    // age 35", which reads as though the 35th year still qualifies; Jason
    // corrected it on 2026-08-03. A dependant turning 35 is already out.
    "Children up to age 34, unmarried",
    "Parents and parents-in-law",
  ],
  sponsor: null,
  sponsorShort: null,
  salaryFloor: null,
  source: MM2H_SOURCE,
  lastVerified: "2026-07-28",
  // MOTAC's December 2025 guide still carries the pre-correction wording on
  // both of the fields below, so they rest on named, dated practice rather than
  // on `source`. `lastVerified` stays at the date the guide was checked — it
  // dates the document, not our departures from it. See §4.1 of SPEC.md.
  //
  // `changedOn` stays at 3 August — the date the terms themselves changed.
  // `asAt` moved to 23 August, when Jason restated the withdrawal item and
  // struck the permitted-use claim it used to carry; the age-34 item below is
  // unchanged from 3 August and was not re-confirmed on that date.
  superseded: {
    changedOn: "2026-08-03",
    attribution: { by: "MYPVIP practice", asAt: "2026-08-23" },
    whatChanged: [
      "The 50% fixed-deposit withdrawal opens once the property purchase completes, not on approval of the application. On Silver, Gold and Platinum the purchase follows approval, so the sequence is approval, then purchase, then withdrawal. The purchase itself remains a permitted use, alongside education, medical and tourism in Malaysia. SEZ and SFZ run the other way round: the in-zone purchase is a condition of approval rather than a step after it.",
      "Dependent children qualify up to age 34, meaning before the 35th birthday. The guide's \"up to age 35\" reads a year wider than the counter applies.",
    ],
    figuresPending: false,
  },
};

// Corrected three times. This string covers Silver, Gold and Platinum only.
//
// The per-category pages (pp.28, 33, 37) read as though the withdrawal right
// opens on approval; the summary page (p.18) adds a "second year onwards"
// gloss. This site quoted the p.18 gloss until 2026-07-28, when Jason replaced
// it with "from approval". On 2026-08-03 he corrected it again: in practice the
// window opens once the property purchase completes.
//
// Between 2026-08-03 and 2026-08-23 this string also asserted that purchasing a
// residence had dropped off the permitted-use list, reasoning that money
// released by completion cannot have funded that completion. Jason struck that
// on 2026-08-23: the purchase IS a permitted use — the withdrawal reimburses a
// completed purchase rather than funding one. Timing and permitted use are two
// separate questions, and the deleted sentence answered the second by deducing
// it from the first.
//
// The order on these three tiers is approval → purchase → withdrawal. SEZ/SFZ
// inverts the first two — the in-zone purchase is a condition of approval, not
// something that follows it — so this string does not describe SEZ, and the
// SEZ withdrawal trigger is deliberately unstated until Jason confirms it.
//
// MOTAC's guide still reads the old way, so this rests on attribution rather
// than on `source` — see the `superseded` block on MM2H_COMMON.
export const MM2H_FD_WITHDRAWAL =
  "Up to 50% of the principal may be withdrawn once the property purchase completes, which on Silver, Gold and Platinum follows approval of the application. It may go towards the property purchase itself, or towards education, medical or tourism activities in Malaysia.";

/**
 * The state-law floor that sits on top of every MM2H property minimum.
 *
 * MOTAC's own fee schedule carries the caveat — "Minimum purchase prices are
 * also subject to respective State Laws" — but the number that reaches readers
 * is always the programme's, and the gap is enormous: a Silver applicant told
 * "from RM600,000" who intends to buy in Selangor is looking at RM2,000,000.
 * Attached to all three tiers, since a state floor above the tier minimum binds
 * on Gold as well as Silver.
 */
const MM2H_PROPERTY_STATE_FLOOR =
  "This is the programme's national minimum, not the price you will actually be allowed to buy at. A foreign buyer must also clear the floor set by the state the property sits in, and in the two states most applicants buy in that floor is higher: RM2,000,000 in Selangor and RM1,000,000 in Kuala Lumpur. Where the state floor is the higher of the two, it is the one that binds.";

/**
 * The same two state floors as structured data.
 *
 * The note above is English prose and stays that way — it is the long-form
 * caveat on a programme page. But the compare page quotes the same two figures
 * mid-sentence, and it now does so in three languages. Three translations of a
 * sentence with a number baked into it is three places a corrected number can
 * fail to reach, which is the duplication SPEC.md §4.1 exists to stop.
 *
 * So the figures live here and the prose interpolates them. The state NAMES are
 * not here: they are words, they need translating, and they belong in the ui
 * dictionary keyed by these slugs.
 */
export const STATE_PROPERTY_FLOORS = [
  { slug: "selangor", floor: { amount: 2_000_000, currency: "MYR" } },
  { slug: "kuala-lumpur", floor: { amount: 1_000_000, currency: "MYR" } },
] as const satisfies readonly { slug: string; floor: Money }[];

/**
 * Employment Pass salary floors by category.
 *
 * Category III is also `salaryFloor` on the programme itself, because that is
 * the figure the tier table shows and the eligibility checker tests. I and II
 * existed only in a code comment until the compare page needed to quote them in
 * three languages. Policy effective 1 June 2026.
 */
export const EMPLOYMENT_PASS_SALARY_FLOORS = {
  i: { amount: 20_000, currency: "MYR" },
  ii: { amount: 10_000, currency: "MYR" },
  iii: { amount: 5_000, currency: "MYR" },
} as const satisfies Record<"i" | "ii" | "iii", Money>;

/**
 * DE Rantau's non-tech income floor.
 *
 * `incomeRequirement` on the programme is the tech-talent figure, which is the
 * one the tables compare. Non-tech professions must show this instead — see the
 * MDEC FAQ cited as the programme's source.
 */
export const DE_RANTAU_NON_TECH_INCOME = {
  amount: 60_000,
  currency: "USD",
  period: "year",
} as const;

/**
 * MM2H agency fees are set by the government, not by the agency.
 *
 * This is the opposite of PVIP, where the agency fee is commercial and
 * unpublished, and it is worth stating plainly: on MM2H there is nothing to
 * shop around for, and a quote above these figures is wrong rather than
 * expensive. All figures include 8% SST. Supplied by Jason on 2026-07-28 from
 * the MM2H fee structure and schedule; MOTAC's December 2025 guide does not
 * publish them, so they carry the attribution below.
 */
export const MM2H_AGENCY_FEE_ATTRIBUTION: Attribution = {
  by: "MYPVIP, from the government MM2H fee schedule",
  asAt: "2026-07-28",
};

/**
 * PVIP's pass fee, visa fee and security bond rest on the same footing as the
 * rest of the 2026 terms: Immigration's published FAQ states none of them.
 * The superseded notice on the guide page covers the terms; this covers the
 * fee schedule specifically, so the section that introduces it can say whose
 * word it is on without borrowing the notice's.
 *
 * Corroborated 2026-08-26 by the Immigration Department guideline behind the
 * superseded block below: it states the RM2,000 pass fee and reproduces both
 * nationality schedules. The fields are unchanged — a second document agreeing
 * with the first is a reason to trust the figures, not a reason to restate who
 * asserted them or when.
 */
export const PVIP_GOVERNMENT_FEE_ATTRIBUTION: Attribution = {
  by: "MYPVIP, from the Immigration Department fee schedules",
  asAt: "2026-07-28",
};

/** Payment terms attached to the government-fixed agency fee. */
export const MM2H_AGENCY_FEE_TERMS =
  "20% of the agency fee is payable on submission and the remaining 80% after approval. All agency fees are inclusive of 8% SST.";

const MM2H_AGENCY_FEE_INCLUDES = [
  "The main applicant's processing fee",
  "The main applicant's first five years of pass fee and visa fee",
  "The main applicant's security bond",
];

function mm2hAgencyFee(principal: number) {
  return {
    principal,
    // From the 2nd dependant onwards, so the first is already covered.
    perDependant: 2_160,
    dependantsIncluded: 1,
    currency: "MYR" as const,
    includes: MM2H_AGENCY_FEE_INCLUDES,
    absorbsPrincipalProcessingFee: true,
    paymentTerms: MM2H_AGENCY_FEE_TERMS,
    // Carried on the fee itself, not left beside it as a loose export. An
    // article body can only address programme data, so an attribution that
    // lives outside the programme is one an article has to hardcode — which is
    // exactly the staleness §4.1 exists to prevent.
    attribution: MM2H_AGENCY_FEE_ATTRIBUTION,
    note: "Fixed by the government, not by the agency — there is nothing to negotiate here, and a quote above this figure is wrong rather than expensive.",
  };
}

/**
 * Everything a dependant is charged that the principal's agency fee does not
 * cover. Identical across the three tiers.
 */
const MM2H_GOVERNMENT_EXTRAS = {
  passFeePerYear: {
    dependant: 500,
    currency: "MYR" as const,
    note: "Per dependant per year of the approved term, paid to Immigration at the approval stage. The main applicant's first five years are already inside the agency fee.",
  },
  visaFee: {
    appliesTo: ["dependant"] as ("principal" | "dependant")[],
    perYear: true,
    note: "Per dependant per year, set by the dependant's nationality. The main applicant's first five years are already inside the agency fee.",
  },
  securityBond: {
    principalByNationality: false,
    dependant: 10,
    currency: "MYR" as const,
    note: "RM10 per dependant, one-off. The main applicant's bond is inside the agency fee.",
  },
  // The initial approval runs five years, which is what the agency fee's
  // inclusion of "the first five years" is measured against.
  defaultTermYears: 5,
};

export const programmes: Programme[] = [
  {
    slug: "pvip",
    name: "Premium Visa Programme (PVIP)",
    category: "long-stay",
    authority: "Immigration Department of Malaysia",
    tenureYears: 20,
    renewable: true,
    // "No age limits" — official FAQ, benefit (i).
    minAge: null,
    fixedDeposit: {
      amount: 1_000_000,
      currency: "MYR",
      withdrawable:
        "Up to 50% may be withdrawn after six months in the programme — reduced from one year under the 2026 terms. The withdrawal is restricted to medical costs, education costs or a property purchase, and is paid on a reimbursement basis against receipts.",
    },
    // RM480,000 a year, and broader on both axes than most write-ups suggest.
    // Not restricted to salary: realised investment gains, rental income and
    // pension drawdown all count. Not restricted to offshore either — onshore
    // income qualifies with proof of Malaysian income tax paid on it, which
    // reverses what the 2022 FAQ says and what this page used to say.
    incomeRequirement: { amount: 40_000, currency: "MYR", period: "month" },
    propertyPurchaseMin: null,
    participationFee: {
      principal: 200_000,
      // The principal's term is fixed at 20 years, so the principal has no fee
      // choice. A dependant does — see dependantTerms.
      dependant: 100_000,
      currency: "MYR",
      // The 20-year dependant fee is unchanged from the 2022 terms. What 2026
      // added is the 10-year option beneath it, at half the price.
      dependantTerms: [
        { years: 20, amount: 100_000 },
        { years: 10, amount: 50_000 },
      ],
    },
    processingFee: null,
    // "Exemption of minimum staying requirement" — official FAQ, benefit (iii).
    minStayPerYear: null,
    minStayShort: null,
    workRights: "full",
    // Per the PVIP management guidelines §1.3. "Children" alone was too loose:
    // the age ceiling is 25 and a child who reaches it has to move to another
    // pass, which is a planning fact for a family with teenagers, not a
    // footnote. Parents-in-law are sponsorable and the site did not say so.
    dependants: [
      "Spouse",
      "Children under 25 (no age limit if disabled)",
      "Parents and parents-in-law",
      "One foreign domestic helper",
    ],
    sponsor: null,
    sponsorShort: null,
    salaryFloor: null,
    // Three government charges the site omitted until 2026-07-28. On a
    // five-year initial approval the pass fee alone is RM10,000 a head — an
    // order of magnitude above the visa fee and bond, and the one most quotes
    // leave out. Supplied by Jason 2026-07-28; Immigration's FAQ states none of
    // them, so they rest on the same attribution as the rest of the 2026 terms.
    governmentExtras: {
      passFeePerYear: {
        principal: 2_000,
        dependant: 2_000,
        currency: "MYR",
        note: "RM2,000 per person per year, collected for the whole approved term when the visa is issued and again on renewal. A five-year approval means RM10,000 per person up front, not RM2,000.",
      },
      visaFee: {
        appliesTo: ["principal", "dependant"],
        perYear: true,
        note: "The multiple-entry visa fee, set by your nationality rather than by the programme. Small next to everything else here, but it is a real line on the invoice.",
      },
      securityBond: {
        principalByNationality: true,
        dependant: 10,
        currency: "MYR",
        note: "One-off. The main applicant's bond is set by nationality and ranges from RM200 to RM2,000; each dependant is a flat RM10.",
      },
      // The approval is capped by passport validity, so five years is the
      // common case rather than the twenty the programme itself runs.
      defaultTermYears: 5,
    },
    source: "https://imigresen-online.imi.gov.my/eservices/doc/FAQ_PVIP.pdf",
    lastVerified: "2026-07-23",
    // The fields above are now the 2026 terms, supplied by Jason on 2026-07-27.
    // Immigration's FAQ still shows the 2022 launch terms, so they rest on
    // attribution rather than on `source` — which is exactly what the notice
    // above the figures tells the reader. See §4.1 of SPEC.md.
    //
    // 2026-08-26: the attribution strengthened. Every term below is now stated
    // by an Immigration Department guideline Jason holds — the income, the
    // deposit, the six-month 50% withdrawal, the two dependant terms and the
    // pass fee — so the assertion is no longer one agency's practice but a
    // government document. It has no public URL, so it cannot become `source`,
    // and Jason's instruction on 2026-08-26 was to name it without describing
    // it. `asAt` moves to the day he supplied it; `changedOn` stays at the date
    // the terms themselves changed.
    superseded: {
      changedOn: "2026-03-16",
      attribution: {
        by: "an Immigration Department guideline, supplied by MYPVIP",
        asAt: "2026-08-26",
      },
      whatChanged: [
        "The fixed deposit becomes withdrawable after six months rather than one year. The ceiling is unchanged at 50% of the amount pledged.",
        "A dependant may now elect a 10-year term at RM50,000, half the price of the unchanged 20-year term at RM100,000. The principal's term is fixed at 20 years and has no such option.",
        "The RM40,000 monthly income requirement is unchanged, but what counts towards it is broader than the 2022 FAQ states. Salary is not required — realised investment gains, rental income and pension drawdown all qualify. Nor must the income be offshore: Malaysian-sourced income now counts, with proof of Malaysian income tax paid on it.",
      ],
      figuresPending: false,
    },
  },

  {
    ...MM2H_COMMON,
    slug: "mm2h-silver",
    name: "MM2H Silver",
    tenureYears: 5,
    fixedDeposit: {
      amount: 150_000,
      currency: "USD",
      withdrawable: MM2H_FD_WITHDRAWAL,
    },
    propertyPurchaseMin: { amount: 600_000, currency: "MYR" },
    propertyStateFloorNote: MM2H_PROPERTY_STATE_FLOOR,
    participationFee: { principal: 1_000, dependant: 0, currency: "MYR" },
    governmentExtras: {
      ...MM2H_GOVERNMENT_EXTRAS,
      agencyFee: mm2hAgencyFee(40_000),
    },
  },
  {
    ...MM2H_COMMON,
    slug: "mm2h-gold",
    name: "MM2H Gold",
    tenureYears: 15,
    fixedDeposit: {
      amount: 500_000,
      currency: "USD",
      withdrawable: MM2H_FD_WITHDRAWAL,
    },
    propertyPurchaseMin: { amount: 1_000_000, currency: "MYR" },
    propertyStateFloorNote: MM2H_PROPERTY_STATE_FLOOR,
    participationFee: { principal: 3_000, dependant: 0, currency: "MYR" },
    governmentExtras: {
      ...MM2H_GOVERNMENT_EXTRAS,
      agencyFee: mm2hAgencyFee(55_000),
    },
  },
  {
    ...MM2H_COMMON,
    slug: "mm2h-platinum",
    name: "MM2H Platinum",
    tenureYears: 20,
    // The only tier where the guide marks both Business/Investment Activities
    // and Career Opportunities "Permissible" (p.31). Silver and Gold inherit
    // "none" from MM2H_COMMON.
    workRights: "full",
    fixedDeposit: {
      amount: 1_000_000,
      currency: "USD",
      withdrawable: MM2H_FD_WITHDRAWAL,
    },
    propertyPurchaseMin: { amount: 2_000_000, currency: "MYR" },
    propertyStateFloorNote: MM2H_PROPERTY_STATE_FLOOR,
    participationFee: { principal: 200_000, dependant: 0, currency: "MYR" },
    governmentExtras: {
      ...MM2H_GOVERNMENT_EXTRAS,
      agencyFee: mm2hAgencyFee(70_000),
    },
  },

  {
    slug: "smm2h",
    name: "Sarawak MM2H (S-MM2H)",
    category: "long-stay",
    authority:
      "Ministry of Tourism, Creative Industry and Performing Arts Sarawak (MTCP)",
    // Issued 5+5, then a fresh application is required.
    tenureYears: 10,
    renewable: true,
    minAge: 30,
    fixedDeposit: {
      amount: 500_000,
      currency: "MYR",
      withdrawable:
        "Up to 50% may be withdrawn after one year in the programme, for a residential house, a car, medical costs or children's education in Sarawak.",
    },
    // RM10,000/month for an individual; RM15,000/month with a dependant. The
    // alternative qualification is savings of RM100,000 (individual) or
    // RM200,000 (with dependant) — see the liquid-asset note on the guide page.
    incomeRequirement: { amount: 10_000, currency: "MYR", period: "month" },
    // Property purchase is optional, not required. The figure is the floor a
    // participant may buy at: RM600,000 in Kuching Division, RM500,000 elsewhere.
    propertyPurchaseMin: null,
    participationFee: null,
    processingFee: { principal: 5_000, dependant: 0, currency: "MYR" },
    // The agent's fee is set by the government, not negotiated between the
    // applicant and the agency — the same arrangement MM2H runs under, and the
    // reason this row must not read "not government-set".
    //
    // RM12,000 for the principal and RM2,000 per dependant, both before 8% SST.
    // Stored gross, because every other SST-bearing figure in this file is:
    // MM2H's dependant fee is the same RM2,000 and is carried here as 2,160,
    // and DE Rantau's RM1,000 processing fee is carried as 1,080. A file that
    // mixed net and gross would price a quote wrong by exactly one tax.
    //
    // What the fee covers, and when each part of it falls due, are published
    // for MM2H and not for Sarawak. They are absent rather than filled in from
    // the MM2H schedule, which is a different programme run by a different
    // authority.
    governmentExtras: {
      agencyFee: {
        principal: 12_960,
        perDependant: 2_160,
        // MM2H's principal fee already covers the first dependant. Sarawak's
        // is charged from the first, so nothing is included.
        dependantsIncluded: 0,
        currency: "MYR",
        // Unlike MM2H, where the agency fee swallows it. Sarawak's RM5,000 is
        // billed separately and is already its own row, so absorbing it here
        // would delete a real cost from the estimate.
        absorbsPrincipalProcessingFee: false,
        note: "Fixed by the government rather than by the agency, and inclusive of 8% SST — a quote above this figure is wrong rather than expensive. The RM5,000 processing fee is charged separately, on top of it.",
      },
      // Issued 5+5. The first approval runs five years, which is the term any
      // per-year figure would be priced over.
      defaultTermYears: 5,
    },
    minStayPerYear:
      "30 cumulative days per year in Sarawak, main applicant only.",
    minStayShort: "30 days in Sarawak",
    workRights: "restricted",
    dependants: ["Spouse", "Children", "Parents"],
    sponsor: null,
    sponsorShort: null,
    salaryFloor: null,
    source: "https://mtcp.sarawak.gov.my/admin/file_manager/download/?id=2319",
    // Re-checked 2026-08-30 against the MTCP guide "SMM2H Application
    // Guidelines - English Version as of 5.5.2026" (cover: amended 31 July
    // 2025). Every figure in this record held; the guide pages did not, and
    // were corrected in the same pass.
    lastVerified: "2026-08-30",
  },

  {
    slug: "de-rantau",
    name: "DE Rantau Nomad Pass",
    category: "work-study",
    authority: "MDEC",
    // Issued for 3–12 months, renewable once for a further 12.
    tenureYears: 1,
    renewable: true,
    renewalLimit: "one time only",
    minAge: null,
    fixedDeposit: null,
    // USD24,000/year for tech talent. Non-tech professions must show
    // USD60,000/year — see the guide page.
    incomeRequirement: { amount: 24_000, currency: "USD", period: "year" },
    propertyPurchaseMin: null,
    participationFee: null,
    // Inclusive of 8% SST. An immigration pass fee of RM360 per year is charged
    // on top.
    processingFee: { principal: 1_080, dependant: 540, currency: "MYR" },
    minStayPerYear: null,
    minStayShort: null,
    workRights: "restricted",
    dependants: [
      "Spouse",
      "Children",
      "Parents (main pass holder only)",
    ],
    sponsor: "Foreign-registered employer or foreign-based clients",
    sponsorShort: "Foreign employer or clients",
    salaryFloor: null,
    source:
      "https://www.mdec.my/static/pdf/derantau/251105_DE%20Rantau_Pass_FAQ_V8.pdf",
    lastVerified: "2026-07-23",
  },

  {
    slug: "employment-pass",
    name: "Employment Pass",
    category: "work-study",
    authority: "Expatriate Services Division (ESD) / Immigration",
    // Category III caps at 5 years; I and II run to 10. Stored as the ceiling.
    tenureYears: 10,
    renewable: true,
    minAge: null,
    fixedDeposit: null,
    incomeRequirement: null,
    propertyPurchaseMin: null,
    participationFee: null,
    processingFee: null,
    minStayPerYear: null,
    minStayShort: null,
    workRights: "restricted",
    dependants: [
      "Spouse (salary above RM5,000 required)",
      "Children under 18",
      "Legally adopted children under 18",
      "Parents and parents-in-law",
    ],
    sponsor: "A Malaysian employer, approved by the Expatriate Committee",
    sponsorShort: "A Malaysian employer",
    // Category III floor under the policy effective 1 June 2026. Category II
    // starts at RM10,000 and Category I at RM20,000.
    salaryFloor: { amount: 5_000, currency: "MYR" },
    source:
      "https://esd.imi.gov.my/portal/latest-news/announcement/announcement-266-ep-salary-policy-2026/",
    lastVerified: "2026-07-23",
  },

  {
    slug: "student-pass",
    name: "Student Pass",
    category: "work-study",
    authority: "Immigration Department / EMGS",
    // Tied to course duration; the official page states no fixed term.
    tenureYears: 1,
    renewable: true,
    minAge: 3,
    fixedDeposit: null,
    incomeRequirement: null,
    propertyPurchaseMin: null,
    participationFee: null,
    processingFee: { principal: 60, dependant: 90, currency: "MYR" },
    minStayPerYear: null,
    minStayShort: null,
    workRights: "restricted",
    dependants: [
      "Spouse (Master's and PhD students only)",
      "Children under 18 (Master's and PhD students only)",
      "Disabled children, any age",
      "Parents",
    ],
    sponsor: "The education institution, screened by EMGS",
    sponsorShort: "Your institution",
    salaryFloor: null,
    source:
      "https://www.imi.gov.my/index.php/en/main-services/pass/student-pass/",
    lastVerified: "2026-07-23",
  },
];

/**
 * Gaps where no official source could confirm a figure. Nothing here may be
 * published as fact — these are questions for Jason, who is the domain
 * authority, not guesses to fill in.
 *
 * Reviewed 2026-07-23.
 */
export const UNVERIFIED: { slug: ProgrammeSlug; question: string }[] = [
  {
    slug: "pvip",
    question:
      "Qualification by NET ASSETS is confirmed to exist — the PVIP management guidelines §2.1 offer it as an alternative to the RM40,000 monthly income — but the threshold as transcribed reads RM1,000,000,000 (one billion ringgit), which is 2,083 times the annual income it substitutes for and would make the route theoretical. Is that a digit-count error for RM1,000,000 or RM100,000,000, or is the billion real? Nothing about net assets is published on the site until the figure is settled.",
  },
  {
    slug: "pvip",
    question:
      "Answered in part on 2026-08-26: a government document does now state the 2026 terms, and the attribution above names it. What is still missing is a public URL — it is not on imigresen-online.imi.gov.my and no copy is findable. Until one exists it cannot become `source`, and the notice keeps pointing at the unrevised FAQ. Ask again whenever Immigration republishes.",
  },
  {
    slug: "pvip",
    question:
      "Does a retiree, or anyone else without a fixed salary, have to show RM5,000,000 in savings ON TOP of the RM40,000 a month? The document checklist for a new application asks a non-fixed-income applicant for 12 months of bank statements plus proof of RM5,000,000 in savings, marked as strictly required for retirees. Read as an eligibility bar that removes most of the retirees the guide page currently tells they qualify; read as a supporting-document convention it changes nothing. Jason held it on 2026-08-26 pending his own check — nothing about it is published until he settles which it is. This is the single largest open question on the programme.",
  },
  {
    slug: "pvip",
    question:
      "Is the multiple-entry visa fee charged per year of the approved term, or once at issuance? Still open after the guidelines: Lampiran L(1) prints one flat rate per country with no 'per annum' marking, while the MM2H schedule marks its equivalent line per annum, and the calculator prices PVIP the same way on that basis. The amounts are small (RM6–RM50), so the answer changes very little — but the guidelines' silence is not a confirmation.",
  },
  {
    slug: "mm2h-silver",
    question:
      "The government agency fee schedule prints one figure for 'Silver/SEZ' (RM40,000). Do the SEZ and SFZ tiers really carry the same agency fee as Silver despite a fixed deposit a fifth the size? The SEZ tiers are described in prose on the MM2H guide page but are not modelled as programmes here, so nothing renders the figure for them yet.",
  },
  {
    slug: "student-pass",
    question:
      "The Immigration page gives the RM60 pass fee but no standard validity period. Is a Student Pass issued for one year at a time, or for the full course duration?",
  },
  {
    slug: "employment-pass",
    question:
      "The 1 June 2026 policy sets a different salary threshold for the Manufacturing Related Services sector but the published FAQ does not state the figure. What is it?",
  },
];

export function getProgramme(slug: ProgrammeSlug): Programme | undefined {
  return programmes.find((p) => p.slug === slug);
}

export const byCategory = (category: ProgrammeCategory) =>
  programmes.filter((p) => p.category === category);
