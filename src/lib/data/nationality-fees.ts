/**
 * Two government fee schedules that are set by nationality rather than by
 * programme — SPEC.md §4.1.
 *
 * They live here rather than in `programmes.ts` because they cut across it: the
 * same two tables price the multiple-entry visa and the security bond on PVIP
 * and on every MM2H tier. A programme says *whether* it charges them; this file
 * says *how much* for a given passport.
 *
 * Both tables are reproduced from the Immigration Department schedules supplied
 * by MYPVIP on 2026-07-28 ("Malaysia Visa Fee By Country" and "Security Bond By
 * Country"). Country labels are kept as the schedules print them — "Burma",
 * "Czech & Slovak" — because a reader checking us against the original needs to
 * find the same row. The one exception is the schedule's "Republic of China",
 * which is confirmed to mean China and is labelled that way here rather than in
 * a form an international reader would take for Taiwan.
 *
 * The schedules are not published on an Immigration URL, so every figure here
 * carries the attribution below rather than a `source` link. Same standard as
 * any other attributed figure on this site: named, dated, and rendered.
 */

import type { Attribution } from "@/lib/data/programmes";

export const NATIONALITY_FEE_ATTRIBUTION: Attribution = {
  by: "MYPVIP, from the Immigration Department fee schedules",
  asAt: "2026-07-28",
};

/** Charged where a country is not named in the visa fee schedule. */
export const VISA_FEE_DEFAULT = 20;

/** Charged where a country is not named in the security bond schedule. */
export const SECURITY_BOND_DEFAULT = 1_500;

export type NationalityFee = {
  /** Rendered in the picker. Matches the schedule's own label where one exists. */
  label: string;
  /** Multiple-entry visa fee, RM per year. */
  visaFee: number;
  /** Security bond, RM, one-off. */
  securityBond: number;
  /** Shown under the picker when this entry needs a caveat. */
  note?: string;
};

/**
 * The union of both schedules, alphabetical.
 *
 * A country named in only one of the two takes the other's default, which is
 * what the schedules themselves say to do ("Countries which are not listed are
 * to pay RM20.00"; "Fee for other countries is RM1,500.00"). The security bond
 * schedule's regional rows — Africa, Europe, British C.I, Portugal C.I — all
 * sit at RM1,500, which is the default, so they need no expansion: an unnamed
 * European or African country lands on the right figure either way.
 */
export const NATIONALITIES: NationalityFee[] = [
  { label: "Angola", visaFee: 20, securityBond: 2_000 },
  { label: "Argentina", visaFee: 20.15, securityBond: 1_500 },
  { label: "Australia", visaFee: 20, securityBond: 1_500 },
  { label: "Bangladesh", visaFee: 20, securityBond: 750 },
  { label: "Bhutan", visaFee: 20, securityBond: 1_500 },
  { label: "Bolivia", visaFee: 11, securityBond: 1_500 },
  { label: "Brazil", visaFee: 17, securityBond: 1_500 },
  { label: "Brunei", visaFee: 20, securityBond: 1_500 },
  {
    label: "Burma",
    visaFee: 19.5,
    securityBond: 750,
    note: "The visa fee schedule lists Burma and Myanmar as separate rows, at RM19.50 and RM20.00. Both are shown; take the one your agent quotes.",
  },
  { label: "Burkina Faso", visaFee: 20, securityBond: 2_000 },
  { label: "Bulgaria", visaFee: 21.9, securityBond: 1_500 },
  { label: "Burundi", visaFee: 20, securityBond: 2_000 },
  { label: "Cameroon", visaFee: 20, securityBond: 2_000 },
  { label: "Canada", visaFee: 20, securityBond: 2_000 },
  { label: "Central African Republic", visaFee: 20, securityBond: 2_000 },
  { label: "Chile", visaFee: 24.5, securityBond: 1_500 },
  // The visa schedule prints this row as "Republic of China". Confirmed by
  // Jason 2026-07-28 as China, and rendered that way — the schedule's own label
  // is a legacy form that would read as Taiwan to an international audience,
  // which is the opposite of what it means here.
  { label: "China", visaFee: 30, securityBond: 1_500 },
  { label: "Colombia", visaFee: 20, securityBond: 2_000 },
  { label: "Congo, Democratic Republic of the", visaFee: 20, securityBond: 2_000 },
  { label: "Congo, Republic of the", visaFee: 20, securityBond: 2_000 },
  { label: "Costa Rica", visaFee: 9, securityBond: 1_500 },
  { label: "Côte d’Ivoire", visaFee: 20, securityBond: 2_000 },
  { label: "Czech & Slovak", visaFee: 19.3, securityBond: 1_500 },
  { label: "Denmark", visaFee: 6, securityBond: 1_500 },
  { label: "Djibouti", visaFee: 20, securityBond: 2_000 },
  { label: "Dominican Republic", visaFee: 12.9, securityBond: 1_500 },
  { label: "Ecuador", visaFee: 7, securityBond: 1_500 },
  { label: "Equatorial Guinea", visaFee: 20, securityBond: 2_000 },
  { label: "Eritrea", visaFee: 20, securityBond: 2_000 },
  { label: "Ethiopia", visaFee: 20, securityBond: 2_000 },
  { label: "Finland", visaFee: 7, securityBond: 1_500 },
  { label: "France", visaFee: 12.9, securityBond: 1_500 },
  { label: "Ghana", visaFee: 20, securityBond: 2_000 },
  { label: "Guinea-Bissau", visaFee: 20, securityBond: 2_000 },
  { label: "Haiti", visaFee: 16, securityBond: 1_500 },
  { label: "Hong Kong", visaFee: 20, securityBond: 1_000 },
  { label: "Hungary", visaFee: 21.45, securityBond: 1_500 },
  { label: "India", visaFee: 50, securityBond: 750 },
  { label: "Indonesia", visaFee: 15, securityBond: 500 },
  { label: "Iran", visaFee: 20, securityBond: 1_500 },
  { label: "Iraq", visaFee: 20, securityBond: 1_500 },
  { label: "Israel", visaFee: 9.7, securityBond: 1_500 },
  { label: "Italy", visaFee: 9.5, securityBond: 1_500 },
  { label: "Japan", visaFee: 20, securityBond: 1_000 },
  { label: "Liberia", visaFee: 13, securityBond: 2_000 },
  { label: "Macao", visaFee: 20, securityBond: 1_000 },
  { label: "Mali", visaFee: 20, securityBond: 2_000 },
  { label: "Mexico", visaFee: 17.5, securityBond: 1_500 },
  { label: "Mozambique", visaFee: 20, securityBond: 2_000 },
  { label: "Myanmar", visaFee: 20, securityBond: 750 },
  { label: "Nepal", visaFee: 20, securityBond: 750 },
  { label: "Niger", visaFee: 20, securityBond: 2_000 },
  { label: "Nigeria", visaFee: 20, securityBond: 2_000 },
  { label: "Pakistan", visaFee: 20, securityBond: 750 },
  { label: "Panama", visaFee: 14.5, securityBond: 1_500 },
  { label: "Peru", visaFee: 20, securityBond: 1_500 },
  { label: "Philippines", visaFee: 20, securityBond: 750 },
  { label: "Poland", visaFee: 26.2, securityBond: 1_500 },
  { label: "Portugal", visaFee: 6.5, securityBond: 1_500 },
  { label: "Rwanda", visaFee: 20, securityBond: 2_000 },
  { label: "Saudi Arabia", visaFee: 17.2, securityBond: 1_500 },
  { label: "Singapore", visaFee: 20, securityBond: 200 },
  { label: "South Korea", visaFee: 30, securityBond: 1_000 },
  { label: "Sri Lanka", visaFee: 15, securityBond: 750 },
  { label: "Sudan", visaFee: 12.9, securityBond: 1_500 },
  { label: "Taiwan", visaFee: 20, securityBond: 1_500 },
  { label: "Thailand", visaFee: 20, securityBond: 300 },
  { label: "Tunisia", visaFee: 20, securityBond: 1_500 },
  { label: "United States of America", visaFee: 6, securityBond: 2_000 },
  { label: "Uruguay", visaFee: 13.5, securityBond: 1_500 },
  { label: "Venezuela", visaFee: 18, securityBond: 1_500 },
  { label: "Vietnam", visaFee: 13, securityBond: 1_500 },
  { label: "Western Sahara", visaFee: 20, securityBond: 2_000 },
];

/**
 * The fallback entry, and the calculator's default selection.
 *
 * Defaulting to "not listed" rather than to a country is deliberate: a reader
 * who never touches the picker sees the schedules' own default figures with the
 * label saying so, instead of a number that silently belongs to somebody else's
 * passport.
 */
export const UNLISTED_NATIONALITY: NationalityFee = {
  label: "Other / not listed",
  visaFee: VISA_FEE_DEFAULT,
  securityBond: SECURITY_BOND_DEFAULT,
  note: "The schedules' own defaults for a country they do not name.",
};

export const NATIONALITY_OPTIONS: NationalityFee[] = [
  UNLISTED_NATIONALITY,
  ...NATIONALITIES,
];

export function nationalityFee(label: string): NationalityFee {
  return (
    NATIONALITY_OPTIONS.find((n) => n.label === label) ?? UNLISTED_NATIONALITY
  );
}
