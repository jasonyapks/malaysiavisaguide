import type { Metadata } from "next";
import Link from "next/link";
import { Byline } from "@/components/Byline";
import { SupersededNotices } from "@/components/SupersededNotice";
import { TierTable } from "@/components/TierTable";
import { byCategory, programmes } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Compare Malaysia's visa programmes side by side",
  description:
    "Every long-stay programme and work/study pass compared on the figures that decide it — deposit, property, term, fees, minimum stay and work rights.",
  alternates: { canonical: "/compare/" },
};

const longStay = byCategory("long-stay");
const workStudy = byCategory("work-study");

/** The most recent review date across every programme shown. */
const lastVerified = programmes
  .map((p) => p.lastVerified)
  .sort()
  .at(-1)!;

export default function Page() {
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
        <h1 className="text-h1 font-semibold">
          Compare the programmes
        </h1>
        {/* Split deliberately. The first half is the idea a reader needs before
            any table; the second half explains why there are TWO tables, and it
            now sits above the second one, where it is actually load-bearing.
            Keeping it all here cost most of a phone screen ahead of the data. */}
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          Malaysia&apos;s long-stay programmes are deposit-gated: you qualify by
          placing capital. The work and study passes are sponsor-gated: an
          employer or institution backs you, and no deposit exists.
        </p>
      </header>

      {/* Above the tables, not below them: this page's whole job is letting a
          reader compare figures, so a superseded one has to be flagged before
          they read it. Renders nothing when every source is current. */}
      <div className="max-w-3xl">
        <SupersededNotices programmes={programmes} />
      </div>

      {/* Both table sections escape the 3xl reading column entirely — heading,
          intro, table and caveat together, so they share one left edge. Widening
          only the table left its own h2 indented away from it, which read as two
          unrelated blocks. Four programmes plus a label column genuinely need
          the width: at 3xl the last column was clipped mid-value at 1440px, and
          Sarawak MM2H was off-screen altogether. */}
      <section className="space-y-5">
          <h2 className="font-serif text-h3 font-semibold">
            Long-stay programmes
          </h2>
          <TierTable tiers={longStay} />
          <p className="max-w-3xl text-body-sm text-ink-muted">
            Deposits are shown in the currency the programme is denominated in.
            MM2H is quoted in US dollars; PVIP and S-MM2H in ringgit — so the
            exchange rate you get is itself part of the cost.
          </p>
      </section>

      <section className="space-y-5">
          <h2 className="font-serif text-h3 font-semibold">
            Work and study passes
          </h2>
          <p className="max-w-3xl text-ink-muted">
            These are compared separately because a fixed deposit and a salary
            floor are not the same kind of number, and putting them in one table
            would imply they are.
          </p>
          <TierTable tiers={workStudy} variant="work-study" />
          <p className="max-w-3xl text-body-sm text-ink-muted">
            The Employment Pass floor shown is Category III. Category II starts
            at RM10,000 a month and Category I at RM20,000. DE Rantau&apos;s
            figure is the tech threshold; non-tech professions need USD 60,000 a
            year.
          </p>
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className="font-serif text-h3 font-semibold">
          What the table can&apos;t show you
        </h2>
        <div className="space-y-4 text-ink-muted">
          <p>
            <strong className="text-ink">
              A fixed deposit is not a cost.
            </strong>{" "}
            It stays your money. The fees are the money that actually leaves. On
            MM2H Silver that difference is USD 150,000 committed against
            RM46,000 genuinely spent — RM1,000 participation, RM5,000 processing
            and a RM40,000 government-set agency fee — and the compulsory
            RM600,000 property is a third category again.
          </p>
          <p>
            <strong className="text-ink">
              Agent fees are fixed on MM2H and not on PVIP.
            </strong>{" "}
            This is the reverse of how the market is usually described. MM2H
            agency fees are set by the government — RM40,000 Silver, RM55,000
            Gold, RM70,000 Platinum, all inclusive of 8% SST — so a higher quote
            is wrong rather than expensive. PVIP agency fees are commercial,
            published nowhere official, and the one number on this page you have
            to get in writing yourself.
          </p>
          <p>
            <strong className="text-ink">
              The property minimum is not the price you will pay.
            </strong>{" "}
            MM2H&apos;s figures are national minimums. A foreign buyer must also
            clear the state&apos;s own floor — RM2,000,000 in Selangor,
            RM1,000,000 in Kuala Lumpur — and where that is higher, it is the
            one that binds. Silver&apos;s RM600,000 is the number this catches
            hardest.
          </p>
          <p>
            <strong className="text-ink">
              The work right is a tier question, not a programme question.
            </strong>{" "}
            PVIP and MM2H Platinum both carry it — MOTAC&apos;s December 2025
            guide marks business, investment and career activity{" "}
            <em>Permissible</em> on Platinum. MM2H Silver and Gold bar it
            outright, and S-MM2H is restricted. So &ldquo;MM2H doesn&apos;t let
            you work&rdquo; is only true of two tiers out of three, and if you
            intend to earn a living in Malaysia the row above narrows the field
            to PVIP and Platinum rather than to PVIP alone.
          </p>
        </div>
      </section>

      <div className="max-w-3xl space-y-12">
        <Byline lastVerified={lastVerified} />

        <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
          <Link href="/tools/eligibility/" className="font-semibold underline">
            Not sure which you qualify for? Run the eligibility checker →
          </Link>
        </p>

        <p className="text-caption text-ink-muted">
          Every figure above is drawn from the official source cited on each
          programme&apos;s guide page. Last reviewed {reviewDate(lastVerified)}.
        </p>
      </div>
      </div>
    </div>
  );
}
