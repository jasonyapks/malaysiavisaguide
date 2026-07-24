/**
 * The eligibility engine — SPEC.md §4.1, §5. One of the four consumers of the
 * data layer. Every threshold it checks is read from `programmes.ts`; nothing
 * is hardcoded here. When a rule changes in that file, the quiz updates with it.
 *
 * The quiz asks the user for bands (an age band, a capital band, an income
 * band), not exact figures. Each band is stored as its *lower bound*, so a
 * programme only ever reports "you qualify" when the entire band the user
 * selected clears the official floor. That is deliberately conservative: on the
 * margin the quiz under-promises rather than over-promises, which is the right
 * bias for a site whose only asset is being trusted.
 */

import {
  getProgramme,
  type Money,
  type Programme,
  type ProgrammeSlug,
} from "@/lib/data/programmes";
import { money, moneyPer } from "@/lib/format";

/**
 * Indicative rate used ONLY to compare a ringgit band against a US-dollar
 * floor (MM2H and DE Rantau are USD-denominated). It is never rendered as a
 * programme figure — every amount shown to the user comes straight from
 * `programmes.ts` via `format.ts`. The results screen discloses that the real
 * rate the user gets is part of the real cost. See SPEC.md §4.1.
 */
export const INDICATIVE_USD_TO_MYR = 4.7;

export type Goal = "live" | "remote" | "job" | "study";

export type Answers = {
  goal: Goal;
  /** Lower bound of the chosen age band. */
  ageFloor: number | null;
  /** Lower bound of the chosen capital band, in MYR. */
  capitalMYR: number | null;
  /** Lower bound of the chosen monthly-income band, in MYR. */
  incomeMYR: number | null;
  /** Willing to buy Malaysian property (MM2H only). */
  buyProperty: boolean | null;
  /** Employer or institution already lined up (Employment Pass / Student Pass). */
  hasSponsor: boolean | null;
};

/** Each programme slug points at the guide page that documents it. */
const GUIDE_HREF: Record<ProgrammeSlug, string> = {
  pvip: "/visas/pvip/",
  "mm2h-silver": "/visas/mm2h/",
  "mm2h-gold": "/visas/mm2h/",
  "mm2h-platinum": "/visas/mm2h/",
  smm2h: "/visas/sarawak-mm2h/",
  "de-rantau": "/visas/de-rantau/",
  "employment-pass": "/visas/employment-pass/",
  "student-pass": "/visas/student-pass/",
};

const LONG_STAY: ProgrammeSlug[] = [
  "pvip",
  "mm2h-silver",
  "mm2h-gold",
  "mm2h-platinum",
  "smm2h",
];

/**
 * Which programmes a goal can even lead to. The sponsor-gated passes describe
 * genuinely different situations — you cannot hold an Employment Pass without a
 * Malaysian job — so goal is a hard filter, not a preference. A remote worker
 * with capital is a real long-stay candidate, so "remote" sees both.
 */
function evaluatedSlugs(goal: Goal): ProgrammeSlug[] {
  switch (goal) {
    case "live":
      return LONG_STAY;
    case "remote":
      return ["de-rantau", ...LONG_STAY];
    case "job":
      return ["employment-pass"];
    case "study":
      return ["student-pass"];
  }
}

const toMYR = (m: Money): number =>
  m.currency === "USD" ? m.amount * INDICATIVE_USD_TO_MYR : m.amount;

function monthlyIncomeFloorMYR(p: Programme): number | null {
  const r = p.incomeRequirement;
  if (!r) return null;
  const monthly = r.period === "year" ? r.amount / 12 : r.amount;
  return r.currency === "USD" ? monthly * INDICATIVE_USD_TO_MYR : monthly;
}

export type Gate = { ok: boolean; requirement: string };

/**
 * The gates for one programme, each built from a field on the programme itself
 * so the requirement text always shows the official figure.
 */
function gatesFor(p: Programme, a: Answers): Gate[] {
  const gates: Gate[] = [];

  // Age. The Student Pass floor of 3 is not a meaningful gate for anyone
  // filling in a visa quiz, so it is skipped.
  if (p.minAge != null && p.minAge > 3) {
    gates.push({
      ok: (a.ageFloor ?? 0) >= p.minAge,
      requirement: `Minimum age ${p.minAge}`,
    });
  }

  // Fixed deposit — the capital gate on every long-stay programme.
  if (p.fixedDeposit) {
    gates.push({
      ok: (a.capitalMYR ?? 0) >= toMYR(p.fixedDeposit),
      requirement: `A fixed deposit of ${money(p.fixedDeposit)}`,
    });
  }

  // Income requirement (PVIP, S-MM2H, DE Rantau).
  const incomeFloor = monthlyIncomeFloorMYR(p);
  if (incomeFloor != null && p.incomeRequirement) {
    gates.push({
      ok: (a.incomeMYR ?? 0) >= incomeFloor,
      requirement: `Income of ${moneyPer(p.incomeRequirement)}`,
    });
  }

  // Salary floor (Employment Pass).
  if (p.salaryFloor) {
    gates.push({
      ok: (a.incomeMYR ?? 0) >= toMYR(p.salaryFloor),
      requirement: `A salary from ${money(p.salaryFloor)} a month`,
    });
  }

  // Property purchase — mandatory on MM2H, optional (so not gated) elsewhere.
  if (p.propertyPurchaseMin) {
    gates.push({
      ok: a.buyProperty === true,
      requirement: `Buying property from ${money(p.propertyPurchaseMin)}`,
    });
  }

  // A named sponsor the applicant must secure themselves.
  if (p.slug === "employment-pass") {
    gates.push({
      ok: a.hasSponsor === true,
      requirement: "A Malaysian employer approved to hire you",
    });
  }
  if (p.slug === "student-pass") {
    gates.push({
      ok: a.hasSponsor === true,
      requirement: "A place at an institution to sponsor the pass",
    });
  }

  return gates;
}

export type Result = {
  slug: ProgrammeSlug;
  name: string;
  href: string;
  gates: Gate[];
  /** Requirements the answers did not meet. */
  blockers: string[];
};

export type Outcome = {
  qualified: Result[];
  /** Ruled out by exactly one requirement — worth showing, because one changed
   *  circumstance would flip it. */
  nearMiss: Result[];
};

export function evaluate(a: Answers): Outcome {
  const qualified: Result[] = [];
  const nearMiss: Result[] = [];

  for (const slug of evaluatedSlugs(a.goal)) {
    const p = getProgramme(slug);
    if (!p) continue;
    const gates = gatesFor(p, a);
    const blockers = gates.filter((g) => !g.ok).map((g) => g.requirement);
    const result: Result = {
      slug: p.slug,
      name: p.name,
      href: GUIDE_HREF[p.slug],
      gates,
      blockers,
    };
    if (blockers.length === 0) qualified.push(result);
    else if (blockers.length === 1) nearMiss.push(result);
  }

  return { qualified, nearMiss };
}
