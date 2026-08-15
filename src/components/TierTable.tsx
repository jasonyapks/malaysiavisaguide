import { DataTable, noteCollector } from "@/components/DataTable";
import type { Programme } from "@/lib/data/programmes";
import { money, moneyPer, years } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";

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
  locale = "en",
  variant = "long-stay",
}: {
  tiers: Programme[];
  caption?: string;
  /** Defaults to English so the comparison page and the calculator, which are
   *  not translated yet, keep working unchanged. */
  locale?: Locale;
  /**
   * Work/study passes have no deposit and no property minimum, so comparing
   * them on those rows would print a column of dashes. They get their own row
   * set instead.
   */
  variant?: "long-stay" | "work-study";
}) {
  const t = getUi(locale).guide.tiers;
  const g = getUi(locale).guide;

  const longStayRows: Row[] = [
    {
      label: t.fixedDeposit,
      cell: (p) => (p.fixedDeposit ? money(p.fixedDeposit) : "—"),
      // The withdrawal rule was carried in the data but rendered nowhere, so a
      // reader saw the deposit as wholly locked. It is half the point of the
      // deposit and belongs next to the figure.
      note: (p) => p.fixedDeposit?.withdrawable ?? null,
    },
    {
      label: t.propertyPurchase,
      cell: (p) =>
        p.propertyPurchaseMin ? g.facts.from(money(p.propertyPurchaseMin)) : t.optional,
      // "From RM600,000" read alone is the most expensive misreading on the
      // site: the state's foreign-buyer floor is usually the higher of the two
      // and is the one that binds. The figure cannot ship without it.
      note: (p) => p.propertyStateFloorNote ?? null,
    },
    {
      label: t.term,
      cell: (p) => `${years(p.tenureYears, locale)}${t.renewableSuffix}`,
    },
    {
      label: t.participationFee,
      cell: (p) =>
        p.participationFee
          ? money({
              amount: p.participationFee.principal,
              currency: p.participationFee.currency,
            })
          : "—",
    },
    // The largest fee on every MM2H tier, and the row that shows the structural
    // difference: on MM2H the agency fee is a published government figure, on
    // PVIP it is commercial and unpublished. Omitting it flattered MM2H by tens
    // of thousands of ringgit.
    {
      label: t.agencyFee,
      cell: (p) => {
        const fee = p.governmentExtras?.agencyFee;
        if (fee) return money({ amount: fee.principal, currency: fee.currency });
        return t.notGovernmentSet;
      },
      note: (p) => {
        const fee = p.governmentExtras?.agencyFee;
        return fee
          ? t.agencyFeeCovers(
              fee.note,
              fee.includes.join("; ").toLowerCase(),
              fee.paymentTerms,
            )
          : t.agencyFeeCommercialNote;
      },
    },
    {
      label: t.processingFee,
      cell: (p) =>
        p.processingFee
          ? t.processingFeePrincipal(money({ amount: p.processingFee.principal, currency: p.processingFee.currency }))
          : "—",
      note: (p) =>
        p.governmentExtras?.agencyFee?.absorbsPrincipalProcessingFee
          ? t.processingFeeAbsorbed
          : null,
    },
    { label: t.minAge, cell: (p) => (p.minAge ? `${p.minAge}` : g.facts.none) },
    {
      label: t.minStay,
      cell: (p) => p.minStayShort ?? g.facts.none,
      note: (p) => (p.minStayShort ? p.minStayPerYear : null),
    },
    // Work rights vary between tiers of the same programme — Platinum carries
    // them, Silver and Gold do not — so the comparison has to show the row or
    // the difference is invisible on the one page where the tiers sit together.
    {
      label: t.workRights,
      cell: (p) =>
        ({ full: t.workYes, restricted: t.workRestricted, none: t.workNo })[
          p.workRights
        ],
      note: (p) =>
        p.workRights === "full"
          ? t.workFullNote
          : p.workRights === "restricted"
            ? t.workRestrictedNote
            : null,
    },
  ];

  const workStudyRows: Row[] = [
    {
      label: t.sponsor,
      cell: (p) => p.sponsorShort ?? p.sponsor ?? "—",
      note: (p) => (p.sponsorShort ? p.sponsor : null),
    },
    {
      label: t.incomeFloor,
      cell: (p) => {
        if (p.salaryFloor) return g.facts.aMonth(money(p.salaryFloor));
        if (p.incomeRequirement)
          return moneyPer(p.incomeRequirement, locale);
        return t.noneStated;
      },
    },
    {
      label: t.maximumTerm,
      cell: (p) =>
        p.renewable
          ? `${years(p.tenureYears, locale)}${t.renewableSuffix}${p.renewalLimit ? ` — ${p.renewalLimit}` : ""}`
          : years(p.tenureYears, locale),
    },
    {
      label: t.governmentFee,
      cell: (p) =>
        p.processingFee
          ? money({
              amount: p.processingFee.principal,
              currency: p.processingFee.currency,
            })
          : "—",
    },
    {
      label: t.dependants,
      cell: (p) => (p.dependants.length ? t.permitted : t.notPermitted),
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
      locale={locale}
    />
  );
}
