/**
 * The cost engine — SPEC.md §4.1, §5. The fourth consumer of the data layer.
 * Every figure it returns comes from a field on the programme in
 * `programmes.ts`; it invents nothing and converts no currencies.
 *
 * The one distinction that matters on this page, and the reason the compare
 * page hammers it too: a fixed deposit or a property purchase is NOT a cost.
 * It stays your money (a deposit) or becomes your asset (a house). The
 * participation and processing fees are the money that actually leaves. The
 * estimate keeps the two in separate buckets so no one reads a refundable
 * deposit as a fee — the single most common way these programmes are
 * misrepresented.
 */

import {
  getProgramme,
  type Currency,
  type Programme,
  type ProgrammeSlug,
} from "@/lib/data/programmes";
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

/** Principal is always one person; dependants are added on top. */
export function estimate(
  slug: ProgrammeSlug,
  dependants: number,
): Estimate | null {
  const p = getProgramme(slug);
  if (!p) return null;

  const deps = Math.max(0, Math.floor(dependants));
  const items: LineItem[] = [];

  addFee(items, p.participationFee, "Participation fee", deps);
  addFee(items, p.processingFee, "Government processing fee", deps);

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
      note: "A property you own, not a fee — but capital you must commit to qualify.",
    });
  }

  const feesByCurrency = sumBy(items, "fee");
  const capitalByCurrency = sumBy(items, "capital");

  return { items, feesByCurrency, capitalByCurrency };
}

function addFee(
  items: LineItem[],
  fee: {
    principal: number;
    dependant: number;
    currency: Currency;
    dependantTerms?: { years: number; amount: number }[];
  } | null,
  label: string,
  deps: number,
) {
  if (!fee) return;
  if (fee.principal > 0) {
    items.push({
      label: `${label} — main applicant`,
      amount: fee.principal,
      currency: fee.currency,
      kind: "fee",
    });
  }
  if (deps > 0 && fee.dependant > 0) {
    // Where a dependant may elect a shorter term, the estimate prices the
    // longest one — `fee.dependant` is defined as that by the data layer. The
    // cheaper option is a real saving on a six-figure line, so it is stated
    // rather than left for the reader to discover on the guide page.
    const cheaper = fee.dependantTerms
      ?.filter((t) => t.amount < fee.dependant)
      .sort((a, b) => a.amount - b.amount)[0];

    items.push({
      label: `${label} — ${deps} dependant${deps > 1 ? "s" : ""}`,
      amount: fee.dependant * deps,
      currency: fee.currency,
      kind: "fee",
      note: cheaper
        ? `Priced at the full term. A dependant taking the ${cheaper.years}-year option instead pays ${money({ amount: cheaper.amount, currency: fee.currency })} each.`
        : undefined,
    });
  }
}

function sumBy(
  items: LineItem[],
  kind: Kind,
): Partial<Record<Currency, number>> {
  const totals: Partial<Record<Currency, number>> = {};
  for (const item of items) {
    if (item.kind !== kind) continue;
    totals[item.currency] = (totals[item.currency] ?? 0) + item.amount;
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
  return (
    (p.participationFee?.dependant ?? 0) > 0 ||
    (p.processingFee?.dependant ?? 0) > 0
  );
}
