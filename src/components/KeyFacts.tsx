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
  const g = getUi(locale).guide;
  const f = g.facts;
  const rows: [string, string][] = [];

  rows.push([f.authority, p.authority]);
  rows.push([
    f.tenure,
    p.renewable
      ? `${years(p.tenureYears, locale)}${g.listSeparator}${f.renewable}${p.renewalLimit ? ` — ${p.renewalLimit}` : ""}`
      : years(p.tenureYears, locale),
  ]);
  if (p.minAge !== null) rows.push([f.minAge, `${p.minAge}`]);
  if (p.fixedDeposit)
    rows.push([f.fixedDeposit, money(p.fixedDeposit)]);
  if (p.incomeRequirement)
    rows.push([f.incomeRequirement, moneyPer(p.incomeRequirement, locale)]);
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
              .map((t) => f.forYears(fee(t.amount), years(t.years, locale)))
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
      <h2 className="mt-2 font-serif text-h3 font-bold">
        {getUi(locale).guide.keyFactsHeading}
      </h2>
      {/* A real table, not a <dl> in a grid (audit task B5-2): label/value pairs
          are tabular data, and a table is what search engines and AI crawlers
          lift cleanly. Cells stack on a phone and sit side by side from `sm`. */}
      <table className="mt-5 w-full border-collapse text-left text-body-sm">
        <tbody className="divide-y divide-sand-200">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th
                scope="row"
                className="block pt-3.5 text-body-sm font-semibold uppercase tracking-[0.08em] text-ink-muted sm:table-cell sm:w-48 sm:py-3.5 sm:pr-4 sm:align-top"
              >
                {label}
              </th>
              <td className="block pb-3.5 pt-1 font-semibold text-forest-900 sm:table-cell sm:py-3.5 sm:align-top">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 border-t border-sand-200 pt-4 text-caption text-ink-muted">
        {getUi(locale).guide.sourceLabel}{" "}
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
