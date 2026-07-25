import type { Programme } from "@/lib/data/programmes";
import { money, moneyPer, years } from "@/lib/format";

/**
 * The screenshot-shareable data card — SPEC.md §3, item 2.
 *
 * Every value is read from `programmes.ts`. Nothing is passed in as a string
 * by the page, which is what keeps four pages from quietly disagreeing about
 * the same fee.
 *
 * A row is omitted when the underlying field is null. That is deliberate: a
 * blank row invites the reader to assume zero, and "no minimum stay" is a
 * genuinely different claim from "we didn't check".
 */
export function KeyFacts({ programme: p }: { programme: Programme }) {
  const rows: [string, string][] = [];

  rows.push(["Authority", p.authority]);
  rows.push([
    "Tenure",
    p.renewable ? `${years(p.tenureYears)}, renewable` : years(p.tenureYears),
  ]);
  if (p.minAge !== null) rows.push(["Minimum age", `${p.minAge}`]);
  if (p.fixedDeposit)
    rows.push(["Fixed deposit", money(p.fixedDeposit)]);
  if (p.incomeRequirement)
    rows.push(["Income requirement", moneyPer(p.incomeRequirement)]);
  if (p.salaryFloor)
    rows.push(["Minimum salary", `${money(p.salaryFloor)} a month`]);
  if (p.sponsor) rows.push(["Sponsor required", p.sponsor]);
  if (p.propertyPurchaseMin)
    rows.push(["Property purchase", `From ${money(p.propertyPurchaseMin)}`]);
  if (p.participationFee)
    rows.push([
      "Participation fee",
      p.participationFee.dependant > 0
        ? `${money({ amount: p.participationFee.principal, currency: p.participationFee.currency })} principal, ${money({ amount: p.participationFee.dependant, currency: p.participationFee.currency })} per dependant`
        : money({
            amount: p.participationFee.principal,
            currency: p.participationFee.currency,
          }),
    ]);
  if (p.processingFee)
    rows.push([
      "Processing fee",
      p.processingFee.dependant > 0
        ? `${money({ amount: p.processingFee.principal, currency: p.processingFee.currency })} principal, ${money({ amount: p.processingFee.dependant, currency: p.processingFee.currency })} per dependant`
        : money({
            amount: p.processingFee.principal,
            currency: p.processingFee.currency,
          }),
    ]);
  rows.push([
    "Minimum stay",
    p.minStayPerYear ?? "None",
  ]);
  rows.push([
    "Work rights",
    {
      full: "Full — may work and run a business",
      restricted: "Restricted — conditions apply",
      none: "None",
    }[p.workRights],
  ]);

  return (
    <aside
      aria-label={`Key facts: ${p.name}`}
      className="card-lux mx-auto max-w-3xl p-7 sm:p-9"
    >
      <p className="eyebrow">At a glance</p>
      <h2 className="mt-2 font-serif text-2xl font-extrabold">Key facts</h2>
      <dl className="mt-5 divide-y divide-sand-200 text-[1.0625rem]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
            <dt className="text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {label}
            </dt>
            <dd className="font-semibold text-forest-900">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-sand-200 pt-4 text-[0.9rem] text-ink-muted">
        Source:{" "}
        <a
          href={p.source}
          className="underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          {p.authority}
        </a>
      </p>
    </aside>
  );
}
