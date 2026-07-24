import type { Metadata } from "next";
import Link from "next/link";
import { Byline } from "@/components/Byline";
import { TierTable } from "@/components/TierTable";
import { byCategory, programmes } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Compare Malaysia's visa programmes side by side",
  description:
    "Every long-stay programme and work/study pass compared on the figures that decide it — deposit, property, term, fees, minimum stay and work rights.",
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
    <div className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          Compare the programmes
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          Malaysia&apos;s long-stay programmes are deposit-gated: you qualify by
          placing capital. The work and study passes are sponsor-gated: an
          employer or institution backs you and no deposit exists. They are
          compared separately below, because a fixed deposit and a salary floor
          are not the same kind of number.
        </p>
      </header>

      <section className="space-y-5">
        <h2 className="font-serif text-2xl font-semibold">
          Long-stay programmes
        </h2>
        <TierTable tiers={longStay} />
        <p className="text-[0.95rem] text-ink-muted">
          Deposits are shown in the currency the programme is denominated in.
          MM2H is quoted in US dollars; PVIP and S-MM2H in ringgit — so the
          exchange rate you get is itself part of the cost.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="font-serif text-2xl font-semibold">
          Work and study passes
        </h2>
        <TierTable tiers={workStudy} variant="work-study" />
        <p className="text-[0.95rem] text-ink-muted">
          The Employment Pass floor shown is Category III. Category II starts at
          RM10,000 a month and Category I at RM20,000. DE Rantau&apos;s figure
          is the tech threshold; non-tech professions need USD 60,000 a year.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">
          What the table can&apos;t show you
        </h2>
        <div className="space-y-4 text-ink-muted">
          <p>
            <strong className="text-ink">
              A fixed deposit is not a cost.
            </strong>{" "}
            It stays your money. The participation and processing fees are the
            money that actually leaves. On MM2H Silver that difference is
            USD 150,000 committed against RM6,000 genuinely spent — and the
            compulsory RM600,000 property is a third category again.
          </p>
          <p>
            <strong className="text-ink">Agent fees are not published.</strong>{" "}
            No government source states them, so they appear nowhere in this
            table. They are real, they vary widely, and you should get the
            figure in writing before committing to anything.
          </p>
          <p>
            <strong className="text-ink">
              Only PVIP carries a full work right.
            </strong>{" "}
            MM2H and S-MM2H do not. If you intend to earn a living in Malaysia,
            that single row narrows the field faster than any of the money.
          </p>
        </div>
      </section>

      <Byline lastVerified={lastVerified} />

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        <Link href="/tools/eligibility/" className="font-semibold underline">
          Not sure which you qualify for? Run the eligibility checker →
        </Link>
      </p>

      <p className="text-[0.9rem] text-ink-muted">
        Every figure above is drawn from the official source cited on each
        programme&apos;s guide page. Last reviewed {reviewDate(lastVerified)}.
      </p>
    </div>
  );
}
