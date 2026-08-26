import Link from "next/link";
import { Byline } from "@/components/Byline";
import { SupersededNotices } from "@/components/SupersededNotice";
import { TierTable } from "@/components/TierTable";
import {
  byCategory,
  DE_RANTAU_NON_TECH_INCOME,
  EMPLOYMENT_PASS_SALARY_FLOORS,
  getProgramme,
  programmes,
  STATE_PROPERTY_FLOORS,
} from "@/lib/data/programmes";
import { money, moneyPer, reviewDate } from "@/lib/format";
import { linkPath } from "@/lib/translated";
import { getUi } from "@/lib/ui";
import type { Locale } from "@/lib/i18n";
import type { CompareCopy, CompareFigures } from "./types";

const longStay = byCategory("long-stay");
const workStudy = byCategory("work-study");

/** The most recent review date across every programme shown. */
const lastVerified = programmes
  .map((p) => p.lastVerified)
  .sort()
  .at(-1)!;

/**
 * Resolve the prose's figures from the programme data, for one locale.
 *
 * Everything here is read or computed — nothing is typed in. `mm2hSilverSpend`
 * in particular is the sum of the three fees rather than the RM46,000 the
 * English page used to state, so a change to any one of them moves the total
 * instead of leaving it stale next to its own components.
 */
function figuresFor(locale: Locale): CompareFigures {
  const silver = getProgramme("mm2h-silver")!;
  const gold = getProgramme("mm2h-gold")!;
  const platinum = getProgramme("mm2h-platinum")!;
  const ui = getUi(locale);

  const participation = silver.participationFee!.principal;
  const processing = silver.processingFee!.principal;
  const agency = silver.governmentExtras!.agencyFee!.principal;

  return {
    mm2hSilverDeposit: money(silver.fixedDeposit!),
    mm2hSilverSpend: money({
      amount: participation + processing + agency,
      currency: "MYR",
    }),
    mm2hSilverParticipation: money({ amount: participation, currency: "MYR" }),
    mm2hSilverProcessing: money({ amount: processing, currency: "MYR" }),
    mm2hSilverAgency: money({ amount: agency, currency: "MYR" }),
    mm2hGoldAgency: money({
      amount: gold.governmentExtras!.agencyFee!.principal,
      currency: "MYR",
    }),
    mm2hPlatinumAgency: money({
      amount: platinum.governmentExtras!.agencyFee!.principal,
      currency: "MYR",
    }),
    mm2hSilverProperty: money(silver.propertyPurchaseMin!),
    stateFloors: STATE_PROPERTY_FLOORS.map((s) => ({
      name: ui.states[s.slug],
      amount: money(s.floor),
    })),
    epCategoryI: money(EMPLOYMENT_PASS_SALARY_FLOORS.i),
    epCategoryII: money(EMPLOYMENT_PASS_SALARY_FLOORS.ii),
    deRantauNonTech: moneyPer(DE_RANTAU_NON_TECH_INCOME, locale),
  };
}

export function ComparePage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: CompareCopy;
}) {
  const f = figuresFor(locale);
  const href = (path: string) => linkPath(path, locale);

  return (
    /* The whole page escapes the 3xl reading column, not just the tables.
       Widening the tables alone gave the page two competing left edges — the
       h1 in one place, the section headings and their tables in another. This
       is a data page rather than a reading page, so everything shares the wide
       column and the prose blocks are held to a sane measure with max-w-3xl
       INSIDE it, keeping one left edge all the way down. */
    <div className="full-bleed px-6">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="max-w-3xl space-y-6">
          <h1 className="text-h1 font-semibold">{copy.heading}</h1>
          {/* Split deliberately. The first half is the idea a reader needs
              before any table; the second half explains why there are TWO
              tables, and it sits above the second one, where it is actually
              load-bearing. Keeping it all here cost most of a phone screen
              ahead of the data. */}
          <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
            {copy.intro}
          </p>
        </header>

        {/* Above the tables, not below them: this page's whole job is letting a
            reader compare figures, so a superseded one has to be flagged before
            they read it. Renders nothing when every source is current. */}
        <div className="max-w-3xl">
          <SupersededNotices programmes={programmes} locale={locale} />
        </div>

        {/* Both table sections escape the 3xl reading column entirely —
            heading, intro, table and caveat together, so they share one left
            edge. Four programmes plus a label column genuinely need the width:
            at 3xl the last column was clipped mid-value at 1440px. */}
        <section className="space-y-5">
          <h2 className="font-serif text-h3 font-semibold">
            {copy.longStay.heading}
          </h2>
          <TierTable tiers={longStay} locale={locale} />
          <p className="max-w-3xl text-body-sm text-ink-muted">
            {copy.longStay.note}
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="font-serif text-h3 font-semibold">
            {copy.workStudy.heading}
          </h2>
          <p className="max-w-3xl text-ink-muted">{copy.workStudy.intro}</p>
          <TierTable tiers={workStudy} variant="work-study" locale={locale} />
          <p className="max-w-3xl text-body-sm text-ink-muted">
            {copy.workStudy.note(f)}
          </p>
        </section>

        <section className="max-w-3xl space-y-4">
          <h2 className="font-serif text-h3 font-semibold">
            {copy.essay.heading}
          </h2>
          <div className="space-y-4 text-ink-muted">
            {copy.essay.items.map((item) => (
              <p key={item.title}>
                <strong className="text-ink">{item.title}</strong>{" "}
                {item.body(f)}
              </p>
            ))}
          </div>
        </section>

        <div className="max-w-3xl space-y-12">
          <Byline lastVerified={lastVerified} locale={locale} />

          <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
            <Link
              href={href("/tools/eligibility/")}
              className="font-semibold underline"
            >
              {copy.quizCta}
            </Link>
          </p>

          <p className="text-caption text-ink-muted">
            {copy.sourcesNote(reviewDate(lastVerified, locale))}
          </p>
        </div>
      </div>
    </div>
  );
}
