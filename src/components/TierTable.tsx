import type { Programme } from "@/lib/data/programmes";
import { money, years } from "@/lib/format";

/**
 * Side-by-side facts for programmes that come in tiers — MM2H, and the
 * comparison page. Every cell reads from `programmes.ts`.
 *
 * Wide tables are the one thing on this site that may scroll horizontally,
 * and only inside their own container: the page body never does.
 */
export function TierTable({
  tiers,
  caption,
  variant = "long-stay",
}: {
  tiers: Programme[];
  caption?: string;
  /**
   * Work/study passes have no deposit and no property minimum, so comparing
   * them on those rows would print a column of dashes. They get their own row
   * set instead.
   */
  variant?: "long-stay" | "work-study";
}) {
  const longStayRows: { label: string; cell: (p: Programme) => string }[] = [
    {
      label: "Fixed deposit",
      cell: (p) => (p.fixedDeposit ? money(p.fixedDeposit) : "—"),
    },
    {
      label: "Property purchase",
      cell: (p) =>
        p.propertyPurchaseMin ? `From ${money(p.propertyPurchaseMin)}` : "Optional",
    },
    { label: "Term", cell: (p) => `${years(p.tenureYears)}, renewable` },
    {
      label: "Participation fee",
      cell: (p) =>
        p.participationFee
          ? money({
              amount: p.participationFee.principal,
              currency: p.participationFee.currency,
            })
          : "—",
    },
    {
      label: "Processing fee",
      cell: (p) =>
        p.processingFee
          ? `${money({ amount: p.processingFee.principal, currency: p.processingFee.currency })} principal`
          : "—",
    },
    { label: "Minimum age", cell: (p) => (p.minAge ? `${p.minAge}` : "None") },
    {
      label: "Minimum stay",
      cell: (p) => p.minStayPerYear ?? "None",
    },
  ];

  const workStudyRows: { label: string; cell: (p: Programme) => string }[] = [
    { label: "Sponsor", cell: (p) => p.sponsor ?? "—" },
    {
      label: "Income floor",
      cell: (p) => {
        if (p.salaryFloor) return `${money(p.salaryFloor)} a month`;
        if (p.incomeRequirement)
          return `${money(p.incomeRequirement)} a ${p.incomeRequirement.period}`;
        return "None stated";
      },
    },
    {
      label: "Maximum term",
      cell: (p) => (p.renewable ? `${years(p.tenureYears)}, renewable` : years(p.tenureYears)),
    },
    {
      label: "Government fee",
      cell: (p) =>
        p.processingFee
          ? money({
              amount: p.processingFee.principal,
              currency: p.processingFee.currency,
            })
          : "—",
    },
    {
      label: "Dependants",
      cell: (p) => (p.dependants.length ? "Permitted" : "Not permitted"),
    },
  ];

  const rows = variant === "work-study" ? workStudyRows : longStayRows;

  return (
    <figure className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
      <table className="w-full min-w-[34rem] border-collapse text-[1.0625rem]">
        {caption && (
          <caption className="px-6 pt-5 text-left font-serif text-xl font-semibold text-forest-900">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-sand-200">
            <th scope="col" className="px-6 py-3 text-left font-medium text-ink-muted">
              &nbsp;
            </th>
            {tiers.map((t) => (
              <th
                key={t.slug}
                scope="col"
                className="px-6 py-3 text-left font-serif text-lg font-semibold text-forest-900"
              >
                {t.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-sand-200 last:border-0">
              <th
                scope="row"
                className="px-6 py-3 text-left font-normal text-ink-muted"
              >
                {r.label}
              </th>
              {tiers.map((t) => (
                <td key={t.slug} className="px-6 py-3 font-medium">
                  {r.cell(t)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
