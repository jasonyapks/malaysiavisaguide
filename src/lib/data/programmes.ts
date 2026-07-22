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
 * STATUS: empty by design. SPEC.md §6 holds preliminary figures gathered from
 * secondary sources — they are a research draft, not publishable. Each entry
 * gets filled in only once verified against mm2h.motac.gov.my, imi.gov.my,
 * Sarawak Immigration, or MDEC, with that official URL in `source`.
 */

export type ProgrammeSlug =
  | "pvip"
  | "mm2h-silver"
  | "mm2h-gold"
  | "mm2h-platinum"
  | "smm2h"
  | "de-rantau";

export type Currency = "MYR" | "USD";

export type Money = {
  amount: number;
  currency: Currency;
};

export type Programme = {
  slug: ProgrammeSlug;
  name: string;
  /** MOTAC, Immigration, Sarawak Immigration, MDEC */
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
  minStayPerYear: string | null;
  workRights: "full" | "restricted" | "none";
  dependants: string[];
  /** Official URL — every claim traceable. */
  source: string;
  /** ISO date. */
  lastVerified: string;
};

export const programmes: Programme[] = [];

export function getProgramme(slug: ProgrammeSlug): Programme | undefined {
  return programmes.find((p) => p.slug === slug);
}
