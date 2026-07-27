import { DataTable, noteCollector } from "@/components/DataTable";
import type { Programme } from "@/lib/data/programmes";
import { money, years } from "@/lib/format";

type Row = {
  label: string;
  cell: (p: Programme) => string;
  /**
   * The long form, when the cell is a shortened version of it. Collected under
   * the table as a numbered footnote and referenced from the cell, so the full
   * condition is still published without a sentence sitting inside a column.
   */
  note?: (p: Programme) => string | null;
};

/**
 * Which programme facts to compare, and how to word each cell. All presentation
 * — sticky columns, footnote rendering, the scroll container — lives in
 * <DataTable>; this file is only the row definitions and where they read from.
 *
 * Every cell reads from `programmes.ts`. Nothing here invents a figure.
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
  const longStayRows: Row[] = [
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
      cell: (p) => p.minStayShort ?? "None",
      note: (p) => (p.minStayShort ? p.minStayPerYear : null),
    },
  ];

  const workStudyRows: Row[] = [
    {
      label: "Sponsor",
      cell: (p) => p.sponsorShort ?? p.sponsor ?? "—",
      note: (p) => (p.sponsorShort ? p.sponsor : null),
    },
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

  const { notes, ref } = noteCollector();
  const body = rows.map((r) => ({
    label: r.label,
    cells: tiers.map((t) => ({ value: r.cell(t), note: ref(r.note?.(t)) })),
  }));

  return (
    <DataTable
      caption={caption}
      head={["", ...tiers.map((t) => t.name)]}
      rows={body}
      notes={notes}
      idPrefix={`tt-${variant}`}
    />
  );
}
