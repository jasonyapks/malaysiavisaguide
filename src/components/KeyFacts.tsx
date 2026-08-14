import type { Programme } from "@/lib/data/programmes";
import { money, moneyPer, years } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";

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
export function KeyFacts({
  programme: p,
  locale,
}: {
  programme: Programme;
  locale: Locale;
}) {
  const f = getUi(locale).guide.facts;
  const rows: [string, string][] = [];

  rows.push([f.authority, p.authority]);
  rows.push([
    f.tenure,
    p.renewable
      ? `${years(p.tenureYears)}, ${f.renewable}${p.renewalLimit ? ` — ${p.renewalLimit}` : ""}`
      : years(p.tenureYears),
  ]);
  if (p.minAge !== null) rows.push([f.minAge, `${p.minAge}`]);
  if (p.fixedDeposit)
    rows.push([f.fixedDeposit, money(p.fixedDeposit)]);
  if (p.incomeRequirement)
    rows.push([f.incomeRequirement, moneyPer(p.incomeRequirement)]);
  if (p.salaryFloor)
    rows.push([f.minSalary, f.aMonth(money(p.salaryFloor))]);
  if (p.sponsor) rows.push([f.sponsorRequired, p.sponsor]);
  if (p.propertyPurchaseMin)
    rows.push([f.propertyPurchase, f.from(money(p.propertyPurchaseMin))]);
  if (p.participationFee) {
    const pf = p.participationFee;
    const fee = (amount: number) => money({ amount, currency: pf.currency });
    rows.push([
      f.participationFee,
      // Where a dependant's term is a choice, both prices are stated. Quoting
      // one of them would understate or overstate a six-figure decision, and
      // which way it errs would depend on which we happened to pick.
      pf.dependantTerms
        ? f.perDependantTerms(
            fee(pf.principal),
            pf.dependantTerms
              .map((t) => f.forYears(fee(t.amount), years(t.years)))
              .join(f.or),
          )
        : pf.dependant > 0
          ? f.principalAndDependant(fee(pf.principal), fee(pf.dependant))
          : fee(pf.principal),
    ]);
  }
  if (p.processingFee)
    rows.push([
      f.processingFee,
      p.processingFee.dependant > 0
        ? f.principalAndDependant(
            money({ amount: p.processingFee.principal, currency: p.processingFee.currency }),
            money({ amount: p.processingFee.dependant, currency: p.processingFee.currency }),
          )
        : money({
            amount: p.processingFee.principal,
            currency: p.processingFee.currency,
          }),
    ]);
  rows.push([
    f.minStay,
    p.minStayPerYear ?? f.none,
  ]);
  rows.push([
    f.workRights,
    {
      full: f.workRightsFull,
      restricted: f.workRightsRestricted,
      none: f.workRightsNone,
    }[p.workRights],
  ]);

  return (
    <aside
      aria-label={getUi(locale).guide.keyFactsLabel(p.name)}
      className="card-lux mx-auto max-w-3xl p-7 sm:p-9"
    >
      <p className="eyebrow">{getUi(locale).guide.atAGlance}</p>
      <h2 className="mt-2 font-serif text-h3 font-extrabold">
        {getUi(locale).guide.keyFactsHeading}
      </h2>
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
