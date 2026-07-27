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
  if (p.participationFee) {
    const f = p.participationFee;
    const fee = (amount: number) => money({ amount, currency: f.currency });
    rows.push([
      "Participation fee",
      // Where a dependant's term is a choice, both prices are stated. Quoting
      // one of them would understate or overstate a six-figure decision, and
      // which way it errs would depend on which we happened to pick.
      f.dependantTerms
        ? `${fee(f.principal)} principal. Per dependant: ${f.dependantTerms
            .map((t) => `${fee(t.amount)} for ${years(t.years)}`)
            .join(", or ")}`
        : f.dependant > 0
          ? `${fee(f.principal)} principal, ${fee(f.dependant)} per dependant`
          : fee(f.principal),
    ]);
  }
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
      <h2 className="mt-2 font-serif text-h3 font-extrabold">Key facts</h2>
      <dl className="mt-5 divide-y divide-sand-200 text-body-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
            <dt className="text-body-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">
              {label}
            </dt>
            <dd className="font-semibold text-forest-900">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-sand-200 pt-4 text-caption text-ink-muted">
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
