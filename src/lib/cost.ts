/**
 * The cost engine — SPEC.md §4.1, §5. The fourth consumer of the data layer.
 * Every figure it returns comes from a field on the programme in
 * `programmes.ts` or a row in `nationality-fees.ts`; it invents nothing and
 * converts no currencies.
 *
 * The one distinction that matters on this page, and the reason the compare
 * page hammers it too: a fixed deposit or a property purchase is NOT a cost.
 * It stays your money (a deposit) or becomes your asset (a house). The fees are
 * the money that actually leaves. The estimate keeps the two in separate
 * buckets so no one reads a refundable deposit as a fee — the single most
 * common way these programmes are misrepresented.
 *
 * Two inputs beyond family size, added 2026-07-28, because without them the fee
 * column was wrong rather than merely incomplete:
 *
 *   - **Nationality.** The multiple-entry visa fee and the principal's security
 *     bond are set by passport, not by programme — RM200 to RM2,000 on the bond.
 *   - **Dependant terms.** PVIP alone lets each dependant elect 10 years at half
 *     the 20-year fee, so a family can split across both. That is a RM50,000
 *     decision per head and has to be priced per person, not per family.
 *
 * The length of the approval is NOT an input. It is five years on both
 * programmes and is read from the data — see `defaultTermYears`.
 */

import {
  getProgramme,
  type Currency,
  type Programme,
  type ProgrammeSlug,
} from "@/lib/data/programmes";
import {
  UNLISTED_NATIONALITY,
  type NationalityFee,
} from "@/lib/data/nationality-fees";
import { money } from "@/lib/format";

export type Kind = "fee" | "capital";

export type LineItem = {
  label: string;
  amount: number;
  currency: Currency;
  kind: Kind;
  /** Optional caveat pulled from the data (e.g. a deposit's withdrawal terms). */
  note?: string;
};

export type Estimate = {
  items: LineItem[];
  /** Non-refundable fees, summed per currency. */
  feesByCurrency: Partial<Record<Currency, number>>;
  /** Refundable deposits and property, summed per currency. */
  capitalByCurrency: Partial<Record<Currency, number>>;
};

export type EstimateInput = {
  dependants: number;
  /** Passport the applicant holds, for the visa fee and the principal's bond. */
  nationality: NationalityFee;
  /**
   * PVIP only: how many dependants take each available term, keyed by years —
   * `{ 20: 1, 10: 2 }` for a spouse on twenty years and two children on ten.
   * Ignored where the programme offers no choice. Omit it and every dependant
   * is priced at the longest (dearest) term, which is the safe default.
   */
  dependantTermCounts?: Record<number, number>;
};

/** Sen, not fractions of a sen — the visa fee schedule prices to two places. */
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Principal is always one person; dependants are added on top. */
export function estimate(
  slug: ProgrammeSlug,
  input: EstimateInput,
): Estimate | null {
  const p = getProgramme(slug);
  if (!p) return null;

  const deps = Math.max(0, Math.floor(input.dependants));
  const nationality = input.nationality ?? UNLISTED_NATIONALITY;
  const extras = p.governmentExtras;
  const years = Math.max(1, extras?.defaultTermYears ?? 1);
  const items: LineItem[] = [];

  // Agency fee first where the government fixes it. It leads because on MM2H
  // it is the largest fee on the page, and because it absorbs the principal's
  // processing fee — which has to be visible before that fee goes missing from
  // the list below.
  const agency = extras?.agencyFee;
  if (agency) {
    items.push({
      label: "Agency fee — main applicant",
      amount: agency.principal,
      currency: agency.currency,
      kind: "fee",
      note: `${agency.note} Covers: ${agency.includes.join("; ").toLowerCase()}.`,
    });
    const chargeable = Math.max(0, deps - agency.dependantsIncluded);
    if (chargeable > 0 && agency.perDependant > 0) {
      items.push({
        label: `Additional agency fee — ${chargeable} dependant${chargeable > 1 ? "s" : ""}`,
        amount: agency.perDependant * chargeable,
        currency: agency.currency,
        kind: "fee",
        note: `Charged from the ${ordinal(agency.dependantsIncluded + 1)} dependant onwards, so the first ${agency.dependantsIncluded === 1 ? "one is" : `${agency.dependantsIncluded} are`} already inside the fee above.`,
      });
    }
  }

  addPersonFee(items, p.participationFee, "Participation fee", deps, {
    dependantTermCounts: input.dependantTermCounts,
  });

  // Skipped for the principal where the agency fee already contains it —
  // otherwise the same RM5,000 appears twice on an MM2H estimate.
  addPersonFee(items, p.processingFee, "Government processing fee", deps, {
    skipPrincipal: agency?.absorbsPrincipalProcessingFee === true,
  });

  const pass = extras?.passFeePerYear;
  if (pass) {
    pushPerYear(items, {
      label: "Immigration pass fee",
      principal: pass.principal,
      dependant: pass.dependant,
      currency: pass.currency,
      years,
      deps,
      note: pass.note,
    });
  }

  const visa = extras?.visaFee;
  if (visa) {
    const per = visa.perYear ? nationality.visaFee * years : nationality.visaFee;
    pushPerYear(items, {
      label: "Multiple-entry visa fee",
      principal: visa.appliesTo.includes("principal") ? per : undefined,
      dependant: visa.appliesTo.includes("dependant") ? per : undefined,
      currency: "MYR",
      years: 1,
      deps,
      note: `${visa.note} ${nationality.label}: ${money({ amount: nationality.visaFee, currency: "MYR" })}${visa.perYear ? " a year" : ""}.`,
    });
  }

  const bond = extras?.securityBond;
  if (bond) {
    if (bond.principalByNationality) {
      items.push({
        label: "Security bond — main applicant",
        amount: nationality.securityBond,
        currency: bond.currency,
        kind: "fee",
        note: `${bond.note} Set by nationality — ${nationality.label}: ${money({ amount: nationality.securityBond, currency: bond.currency })}.`,
      });
    }
    if (deps > 0 && bond.dependant) {
      items.push({
        label: `Security bond — ${deps} dependant${deps > 1 ? "s" : ""}`,
        amount: bond.dependant * deps,
        currency: bond.currency,
        kind: "fee",
        note: bond.principalByNationality ? undefined : bond.note,
      });
    }
  }

  if (p.fixedDeposit) {
    items.push({
      label: "Fixed deposit",
      amount: p.fixedDeposit.amount,
      currency: p.fixedDeposit.currency,
      kind: "capital",
      note: p.fixedDeposit.withdrawable,
    });
  }

  if (p.propertyPurchaseMin) {
    items.push({
      label: "Property purchase (minimum)",
      amount: p.propertyPurchaseMin.amount,
      currency: p.propertyPurchaseMin.currency,
      kind: "capital",
      note: p.propertyStateFloorNote
        ? `A property you own, not a fee — but capital you must commit to qualify. ${p.propertyStateFloorNote}`
        : "A property you own, not a fee — but capital you must commit to qualify.",
    });
  }

  const feesByCurrency = sumBy(items, "fee");
  const capitalByCurrency = sumBy(items, "capital");

  return { items, feesByCurrency, capitalByCurrency };
}

/** "1st", "2nd", "3rd" — used for the dependant the agency fee starts at. */
function ordinal(n: number): string {
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th");
  return `${n}${suffix}`;
}

function pushPerYear(
  items: LineItem[],
  o: {
    label: string;
    principal?: number;
    dependant?: number;
    currency: Currency;
    years: number;
    deps: number;
    note: string;
  },
) {
  const term = o.years > 1 ? ` (${o.years} years)` : "";
  if (o.principal) {
    items.push({
      label: `${o.label} — main applicant${term}`,
      amount: round2(o.principal * o.years),
      currency: o.currency,
      kind: "fee",
      note: o.note,
    });
  }
  if (o.deps > 0 && o.dependant) {
    items.push({
      label: `${o.label} — ${o.deps} dependant${o.deps > 1 ? "s" : ""}${term}`,
      amount: round2(o.dependant * o.years * o.deps),
      currency: o.currency,
      kind: "fee",
      // Repeating the note on both rows is noise; the principal's row carries
      // it, and where there is no principal row this is the only place for it.
      note: o.principal ? undefined : o.note,
    });
  }
}

function addPersonFee(
  items: LineItem[],
  fee: {
    principal: number;
    dependant: number;
    currency: Currency;
    dependantTerms?: { years: number; amount: number }[];
  } | null,
  label: string,
  deps: number,
  opts: {
    skipPrincipal?: boolean;
    dependantTermCounts?: Record<number, number>;
  } = {},
) {
  if (!fee) return;
  if (fee.principal > 0 && !opts.skipPrincipal) {
    items.push({
      label: `${label} — main applicant`,
      amount: fee.principal,
      currency: fee.currency,
      kind: "fee",
    });
  }
  if (deps <= 0) return;

  // Where each dependant elects their own term, a family can straddle both —
  // spouse on twenty years, children on ten. So this emits one line per term
  // rather than one line for the family, which is the only way the split is
  // legible and the only way the arithmetic is right.
  const terms = fee.dependantTerms;
  if (terms && opts.dependantTermCounts) {
    for (const t of [...terms].sort((a, b) => b.years - a.years)) {
      const count = Math.max(
        0,
        Math.floor(opts.dependantTermCounts[t.years] ?? 0),
      );
      if (count <= 0 || t.amount <= 0) continue;
      items.push({
        label: `${label} — ${count} dependant${count > 1 ? "s" : ""} on the ${t.years}-year term`,
        amount: t.amount * count,
        currency: fee.currency,
        kind: "fee",
        note: `${money({ amount: t.amount, currency: fee.currency })} each.`,
      });
    }
    return;
  }

  // No split supplied: price every dependant at the longest term.
  // `fee.dependant` is defined as that by the data layer, so a consumer that
  // ignores the choice quotes the higher figure rather than the cheaper one.
  if (fee.dependant <= 0) return;
  const alternatives = (terms ?? []).filter((t) => t.amount !== fee.dependant);

  items.push({
    label: `${label} — ${deps} dependant${deps > 1 ? "s" : ""}`,
    amount: fee.dependant * deps,
    currency: fee.currency,
    kind: "fee",
    note:
      alternatives.length > 0
        ? `Priced at the full term. The other term available is ${alternatives
            .map(
              (t) =>
                `${t.years} years at ${money({ amount: t.amount, currency: fee.currency })} each`,
            )
            .join(", or ")}.`
        : undefined,
  });
}

function sumBy(
  items: LineItem[],
  kind: Kind,
): Partial<Record<Currency, number>> {
  const totals: Partial<Record<Currency, number>> = {};
  for (const item of items) {
    if (item.kind !== kind) continue;
    totals[item.currency] = round2((totals[item.currency] ?? 0) + item.amount);
  }
  return totals;
}

/**
 * Programmes offered on the calculator, in the order they should appear —
 * long-stay first (where most of the cost complexity lives), then the
 * sponsor-gated passes.
 */
export const CALCULATOR_ORDER: ProgrammeSlug[] = [
  "pvip",
  "mm2h-silver",
  "mm2h-gold",
  "mm2h-platinum",
  "smm2h",
  "de-rantau",
  "employment-pass",
  "student-pass",
];

/** How many dependants each programme's fee schedule can actually price. */
export function pricesDependants(p: Programme): boolean {
  const extras = p.governmentExtras;
  return (
    (p.participationFee?.dependant ?? 0) > 0 ||
    (p.processingFee?.dependant ?? 0) > 0 ||
    (extras?.passFeePerYear?.dependant ?? 0) > 0 ||
    (extras?.securityBond?.dependant ?? 0) > 0 ||
    (extras?.agencyFee?.perDependant ?? 0) > 0 ||
    (extras?.visaFee?.appliesTo.includes("dependant") ?? false)
  );
}

/** True where the estimate changes with the passport the applicant holds. */
export function pricesByNationality(p: Programme): boolean {
  const extras = p.governmentExtras;
  return Boolean(
    extras?.visaFee || extras?.securityBond?.principalByNationality,
  );
}

/**
 * The terms a dependant may elect, longest first, or null where the programme
 * offers no choice. PVIP is the only case.
 */
export function dependantTermOptions(
  p: Programme,
): { years: number; amount: number }[] | null {
  const terms = p.participationFee?.dependantTerms;
  if (!terms || terms.length < 2) return null;
  return [...terms].sort((a, b) => b.years - a.years);
}
