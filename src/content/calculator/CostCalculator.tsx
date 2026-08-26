"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getProgramme,
  type Currency,
  type ProgrammeSlug,
} from "@/lib/data/programmes";
import {
  NATIONALITY_FEE_ATTRIBUTION,
  NATIONALITY_OPTIONS,
  UNLISTED_NATIONALITY,
  nationalityFee,
} from "@/lib/data/nationality-fees";
import {
  CALCULATOR_ORDER,
  dependantTermOptions,
  estimate,
  pricesByNationality,
  pricesDependants,
  type LineItem,
} from "@/lib/cost";
import { money, reviewDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { localiseProgramme } from "@/lib/programme-locale";
import { linkPath } from "@/lib/translated";
import {
  countryName,
  countryNote,
  feeAttributionName,
} from "@/lib/countries";
import { getCalculatorCopy } from "./copy";
import type { CalculatorCopy } from "./types";

const GUIDE_HREF: Record<ProgrammeSlug, string> = {
  pvip: "/visas/pvip/",
  "mm2h-silver": "/visas/mm2h/",
  "mm2h-gold": "/visas/mm2h/",
  "mm2h-platinum": "/visas/mm2h/",
  smm2h: "/visas/sarawak-mm2h/",
  "de-rantau": "/visas/de-rantau/",
  "employment-pass": "/visas/employment-pass/",
  "student-pass": "/visas/student-pass/",
};

const MAX_DEPENDANTS = 8;

function currencyRows(totals: Partial<Record<Currency, number>>) {
  return (Object.entries(totals) as [Currency, number][]).filter(
    ([, amount]) => amount > 0,
  );
}

export function CostCalculator({ locale }: { locale: Locale }) {
  // Resolved here, not passed in: the copy holds functions. See ./copy.ts.
  const copy = getCalculatorCopy(locale);
  const href = (path: string) => linkPath(path, locale);
  const [slug, setSlug] = useState<ProgrammeSlug>("pvip");
  const [dependants, setDependants] = useState(0);
  const [nationalityLabel, setNationalityLabel] = useState(
    UNLISTED_NATIONALITY.label,
  );
  // How many dependants take the LONGER of the two terms. The rest take the
  // shorter one, so one stepper describes the whole split — a second stepper
  // that could disagree with the family total would just be a way to enter an
  // impossible family. Starts at the maximum so the default puts everyone on
  // the longer, dearer term — the calculator should never quote low by default.
  const [onLongTerm, setOnLongTerm] = useState(MAX_DEPENDANTS);

  // Localised for display. `estimate()` localises its own copy of the record
  // for the line items, so both sides of the page name the programme the same
  // way and neither reads a figure from anywhere but programmes.ts.
  const programme = localiseProgramme(getProgramme(slug)!, locale);
  const extras = programme.governmentExtras;

  const depTerms = dependantTermOptions(programme);
  const byNationality = pricesByNationality(programme);
  const scalesWithFamily = pricesDependants(programme);

  // Clamped rather than stored clamped, so lowering the family count and
  // raising it again doesn't silently move people onto the cheaper term.
  const longCount = depTerms ? Math.min(onLongTerm, dependants) : 0;
  const shortCount = depTerms ? dependants - longCount : 0;
  const dependantTermCounts = depTerms
    ? { [depTerms[0].years]: longCount, [depTerms[1].years]: shortCount }
    : undefined;

  const nationality = nationalityFee(nationalityLabel);

  // No useMemo: the estimate is a few dozen arithmetic operations over a fixed
  // array, and hand-memoizing it defeated the React Compiler, which does the
  // job better here than an explicit dependency list built from derived values.
  const result = estimate(
    slug,
    { dependants, nationality, dependantTermCounts },
    locale,
  );

  const fees = result ? currencyRows(result.feesByCurrency) : [];
  const capital = result ? currencyRows(result.capitalByCurrency) : [];
  const feeItems = result?.items.filter((i) => i.kind === "fee") ?? [];
  const capitalItems = result?.items.filter((i) => i.kind === "capital") ?? [];

  // Step numbers are assigned to the controls that are actually on screen, in
  // render order. Two of the three are conditional, so hardcoding "3." would
  // leave gaps on the programmes that don't show it.
  let n = 2;
  const stepDependants = n++;
  const stepDepTerm = depTerms && dependants > 0 ? n++ : 0;
  const stepNationality = byNationality ? n++ : 0;

  return (
    <div className="space-y-8">
      {/* Programme picker */}
      <fieldset className="space-y-3">
        <legend className="font-serif text-lead font-semibold text-forest-900">
          1. {copy.steps.programme}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {CALCULATOR_ORDER.map((s) => {
            // Localised, like the heading below it. Left raw, the picker read
            // "MM2H Silver" while the result it selected read "MM2H 白银级".
            const p = localiseProgramme(getProgramme(s)!, locale);
            const active = s === slug;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => setSlug(s)}
                className={`rounded-lg border px-4 py-3 text-left text-body-sm transition-colors ${
                  active
                    ? "border-forest-600 bg-forest-50 font-semibold text-forest-900"
                    : "border-sand-200 bg-white text-ink hover:border-forest-300"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Family size */}
      <fieldset className="space-y-3">
        <legend className="font-serif text-lead font-semibold text-forest-900">
          {stepDependants}. {copy.steps.dependants}
        </legend>
        <div className="flex items-center gap-4">
          <Stepper
            value={dependants}
            onChange={setDependants}
            max={MAX_DEPENDANTS}
            label={copy.stepper.dependants}
            copy={copy}
          />
          <span className="text-ink-muted">{copy.plusMainApplicant}</span>
        </div>
        {!scalesWithFamily && dependants > 0 && (
          <p className="text-caption text-ink-muted">
            {copy.feesDoNotScale(programme.name)}
          </p>
        )}
      </fieldset>

      {/* Dependant terms — PVIP only, and only once there is a dependant to
          price. Each dependant elects their own, so a family can straddle both:
          spouse on twenty years, children on ten. At RM50,000 a head that is
          worth its own control rather than a footnote under the total. */}
      {depTerms && dependants > 0 && (
        <fieldset className="space-y-3">
          <legend className="font-serif text-lead font-semibold text-forest-900">
            {stepDepTerm}. {copy.steps.dependantTerm(depTerms[0].years)}
          </legend>
          <div className="flex flex-wrap items-center gap-4">
            <Stepper
              value={longCount}
              onChange={setOnLongTerm}
              max={dependants}
              label={copy.stepper.dependantsOnLongerTerm}
              copy={copy}
            />
            <span className="text-ink-muted">
              {copy.ofTotal(dependants)}
              {shortCount > 0 &&
                copy.othersTakeTerm(shortCount, depTerms[1].years)}
            </span>
          </div>
          <p className="text-caption text-ink-muted">
            {copy.termsMix(
              depTerms
                .map((t) =>
                  copy.termOption(
                    money({
                      amount: t.amount,
                      currency: programme.participationFee!.currency,
                    }),
                    t.years,
                  ),
                )
                .join(copy.termOptionSeparator),
              programme.tenureYears,
            )}
          </p>
        </fieldset>
      )}

      {/* Nationality */}
      {byNationality && (
        <fieldset className="space-y-3">
          <legend className="font-serif text-lead font-semibold text-forest-900">
            {stepNationality}. {copy.steps.nationality}
          </legend>
          <select
            aria-label={copy.nationalityAriaLabel}
            value={nationalityLabel}
            onChange={(e) => setNationalityLabel(e.target.value)}
            className="w-full max-w-md rounded-lg border border-sand-200 bg-white px-4 py-3 text-body-sm text-ink"
          >
            {NATIONALITY_OPTIONS.map((n) => (
              <option key={n.label} value={n.label}>
                {countryName(n.label, locale)}
              </option>
            ))}
          </select>
          <p className="text-caption text-ink-muted">
            {copy.nationalityNote}
            {nationality.note
              ? ` ${countryNote(nationality.label, nationality.note, locale)}`
              : ""}
          </p>
        </fieldset>
      )}

      {/* Results */}
      <section className="space-y-6 rounded-2xl border border-sand-200 bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-h3 font-semibold text-forest-900">
            {programme.name}
          </h2>
          <Link
            href={GUIDE_HREF[slug]}
            className="text-caption font-semibold text-forest-700 hover:text-forest-900"
          >
            {copy.results.fullGuide} <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Fees */}
        <div className="space-y-3">
          <h3 className="font-serif text-lead font-semibold text-forest-900">
            {copy.results.feesHeading}
          </h3>
          {feeItems.length > 0 ? (
            <>
              <ItemList items={feeItems} />
              <TotalRows label={copy.results.totalFees} rows={fees} strong />
            </>
          ) : (
            <p className="text-ink-muted">{copy.results.noFeesPublished}</p>
          )}
        </div>

        {/* Capital */}
        {capitalItems.length > 0 && (
          <div className="space-y-3 border-t border-sand-200 pt-5">
            <h3 className="font-serif text-lead font-semibold text-forest-900">
              {copy.results.capitalHeading}
            </h3>
            <p className="text-body-sm text-ink-muted">
              {copy.results.capitalLead}
            </p>
            <ItemList items={capitalItems} />
            <TotalRows label={copy.results.totalCapital} rows={capital} />
          </div>
        )}

        {/* Grand total per currency */}
        <div className="space-y-2 border-t border-sand-200 pt-5">
          <h3 className="font-serif text-lead font-semibold text-forest-900">
            {copy.results.readyHeading}
          </h3>
          <TotalRows
            label={copy.results.feesPlusCapital}
            rows={combine(fees, capital)}
            strong
          />
          <p className="text-caption text-ink-muted">
            {copy.results.currenciesNote}
          </p>
        </div>
      </section>

      {/* Honesty footer */}
      <div className="space-y-2 text-caption text-ink-muted">
        <p>
          <strong className="text-ink">{copy.footer.leavesOutLabel}</strong>{" "}
          {extras?.agencyFee
            ? copy.footer.leavesOutWithAgency(extras.agencyFee.paymentTerms)
            : copy.footer.leavesOutWithoutAgency}{" "}
          {copy.footer.everyFigureBefore}{" "}
          <Link href={href(GUIDE_HREF[slug])} className="underline">
            {copy.footer.guideLinkLabel(programme.name)}
          </Link>
          {copy.footer.everyFigureAfter}
        </p>
        {extras && (
          <p>
            <strong className="text-ink">
              {copy.footer.pricedOverTerm(extras.defaultTermYears)}
            </strong>{" "}
            {copy.footer.pricedOverTermBody}{" "}
            {extras.agencyFee
              ? copy.footer.agencyFeeWrittenAgainst(extras.defaultTermYears)
              : copy.footer.passportCapped}
          </p>
        )}
        {byNationality && (
          <p>
            {copy.footer.nationalityAttribution(
              feeAttributionName(NATIONALITY_FEE_ATTRIBUTION.by, locale),
              reviewDate(NATIONALITY_FEE_ATTRIBUTION.asAt, locale),
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  max,
  label,
  copy,
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  /** Names what is being counted, so the two steppers don't share a label. */
  label: string;
  copy: CalculatorCopy;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-sand-200 bg-white">
      <button
        type="button"
        aria-label={copy.stepper.fewer(label)}
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="px-4 py-2 text-lead text-forest-700 disabled:text-sand-400"
      >
        −
      </button>
      <span
        aria-live="polite"
        className="w-10 text-center text-lead font-semibold tabular-nums text-ink"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={copy.stepper.more(label)}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-4 py-2 text-lead text-forest-700 disabled:text-sand-400"
      >
        +
      </button>
    </div>
  );
}

function ItemList({ items }: { items: LineItem[] }) {
  return (
    <ul className="divide-y divide-sand-100">
      {items.map((item) => (
        <li key={item.label} className="py-2">
          <div className="flex justify-between gap-4">
            <span className="text-ink-muted">{item.label}</span>
            <span className="shrink-0 font-medium tabular-nums text-ink">
              {money({ amount: item.amount, currency: item.currency })}
            </span>
          </div>
          {item.note && (
            <p className="mt-1 max-w-prose text-caption text-ink-muted">
              {item.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function TotalRows({
  label,
  rows,
  strong = false,
}: {
  label: string;
  rows: [Currency, number][];
  strong?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${
        strong ? "text-lead" : ""
      }`}
    >
      <span
        className={strong ? "font-serif font-semibold text-forest-900" : "text-ink"}
      >
        {label}
      </span>
      <span className="flex flex-wrap gap-x-4 tabular-nums">
        {rows.map(([currency, amount]) => (
          <span
            key={currency}
            className={strong ? "font-semibold text-forest-900" : "text-ink"}
          >
            {money({ amount, currency })}
          </span>
        ))}
      </span>
    </div>
  );
}

/** Merge two per-currency lists into one, summing shared currencies. */
function combine(
  a: [Currency, number][],
  b: [Currency, number][],
): [Currency, number][] {
  const totals: Partial<Record<Currency, number>> = {};
  for (const [currency, amount] of [...a, ...b]) {
    totals[currency] = (totals[currency] ?? 0) + amount;
  }
  return (Object.entries(totals) as [Currency, number][]).filter(
    ([, amount]) => amount > 0,
  );
}
