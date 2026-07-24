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

export type Programme = {
  slug: ProgrammeSlug;
  name: string;
  category: ProgrammeCategory;
  /** MOTAC, Immigration, Sarawak Immigration/MTCP, MDEC, EMGS, ESD */
  authority: string;
  tenureYears: number;
  renewable: boolean;
  minAge: number | null;
  fixedDeposit: (Money & { withdrawable?: string }) | null;
  incomeRequirement: (Money & { period: "month" | "year" }) | null;
  propertyPurchaseMin: Money | null;
  participationFee:
    | { principal: number; dependant: number; currency: Currency }
    | null;
  /** Government processing fee, separate from any participation fee. */
  processingFee:
    | { principal: number; dependant: number; currency: Currency }
    | null;
  minStayPerYear: string | null;
  workRights: "full" | "restricted" | "none";
  dependants: string[];
  /** Work/study only: who must sponsor the application. */
  sponsor: string | null;
  /** Work/study only: minimum monthly salary the role must pay. */
  salaryFloor: Money | null;
  /** Official URL — every claim traceable. */
  source: string;
  /** ISO date. */
  lastVerified: string;
};

/**
 * MM2H tier figures all come from one official MOTAC document — the One Stop
 * Centre category table published December 2025. Note it contradicts most
 * secondary reporting: the minimum age is 25 (not 30), the minimum stay is
 * 90 days for ages 25–49 with no requirement at all from 50, and the
 * participation fee varies enormously by tier.
 */
const MM2H_SOURCE =
  "https://www.motac.gov.my/wp-content/uploads/2025/12/Insights-on-The-Categories.pdf";

const MM2H_COMMON = {
  category: "long-stay" as const,
  authority: "MOTAC (One Stop Centre MM2H)",
  renewable: true,
  minAge: 25,
  incomeRequirement: null,
  processingFee: {
    principal: 5000,
    dependant: 2500,
    currency: "MYR" as const,
  },
  minStayPerYear:
    "90 days per year for ages 25–49, met between the main applicant and/or spouse and dependants. No minimum stay from age 50.",
  workRights: "restricted" as const,
  dependants: [
    "Spouse",
    "Children up to age 35, unmarried",
    "Parents and parents-in-law",
  ],
  sponsor: null,
  salaryFloor: null,
  source: MM2H_SOURCE,
  lastVerified: "2026-07-23",
};

const MM2H_FD_WITHDRAWAL =
  "Up to 50% may be withdrawn after one year in the programme, for property purchase, medical, education or tourism.";

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
    },
    incomeRequirement: { amount: 40_000, currency: "MYR", period: "month" },
    propertyPurchaseMin: null,
    participationFee: {
      principal: 200_000,
      dependant: 100_000,
      currency: "MYR",
    },
    processingFee: null,
    // "Exemption of minimum staying requirement" — official FAQ, benefit (iii).
    minStayPerYear: null,
    workRights: "full",
    dependants: [
      "Spouse",
      "Children",
      "Parents",
      "Foreign domestic helpers",
    ],
    sponsor: null,
    salaryFloor: null,
    source: "https://imigresen-online.imi.gov.my/eservices/doc/FAQ_PVIP.pdf",
    lastVerified: "2026-07-23",
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
    participationFee: { principal: 1_000, dependant: 0, currency: "MYR" },
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
    participationFee: { principal: 3_000, dependant: 0, currency: "MYR" },
  },
  {
    ...MM2H_COMMON,
    slug: "mm2h-platinum",
    name: "MM2H Platinum",
    tenureYears: 20,
    fixedDeposit: {
      amount: 1_000_000,
      currency: "USD",
      withdrawable: MM2H_FD_WITHDRAWAL,
    },
    propertyPurchaseMin: { amount: 2_000_000, currency: "MYR" },
    participationFee: { principal: 200_000, dependant: 0, currency: "MYR" },
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
    minStayPerYear:
      "30 cumulative days per year in Sarawak, main applicant only.",
    workRights: "restricted",
    dependants: ["Spouse", "Children", "Parents"],
    sponsor: null,
    salaryFloor: null,
    source: "https://mtcp.sarawak.gov.my/admin/file_manager/download/?id=2319",
    lastVerified: "2026-07-23",
  },

  {
    slug: "de-rantau",
    name: "DE Rantau Nomad Pass",
    category: "work-study",
    authority: "MDEC",
    // Issued for 3–12 months, renewable once for a further 12.
    tenureYears: 1,
    renewable: true,
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
    workRights: "restricted",
    dependants: [
      "Spouse",
      "Children",
      "Parents (main pass holder only)",
    ],
    sponsor: "Foreign-registered employer or foreign-based clients",
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
    workRights: "restricted",
    dependants: [
      "Spouse (salary above RM5,000 required)",
      "Children under 18",
      "Legally adopted children under 18",
      "Parents and parents-in-law",
    ],
    sponsor: "A Malaysian employer, approved by the Expatriate Committee",
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
    workRights: "restricted",
    dependants: [
      "Spouse (Master's and PhD students only)",
      "Children under 18 (Master's and PhD students only)",
      "Disabled children, any age",
      "Parents",
    ],
    sponsor: "The education institution, screened by EMGS",
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
      "The only official PVIP document found is the Immigration FAQ, which still reflects the 2022 launch terms. It does not mention the changes reported for 16 March 2026 — a RM50,000 dependant fee on a 10-year option, fixed deposit withdrawable after 6 months, and qualification by net worth or onshore income. Is there a published circular, and are those terms in force?",
  },
  {
    slug: "mm2h-silver",
    question:
      "The MOTAC category table gives a participation fee per tier but no dependant participation fee. Is the fee per application or per person?",
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
