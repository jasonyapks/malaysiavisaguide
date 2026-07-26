import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial policy",
  description:
    "How content here is researched, sourced, reviewed and dated — and what happens when a rule changes.",
  alternates: { canonical: "/editorial-policy/" },
};

export default function Page() {
  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          Editorial policy
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          Every figure on this site is traced to an official source, reviewed by
          a named person, and stamped with the date it was last checked. This
          page explains how that works, and what happens when the rules change —
          which, for Malaysian visas, they do often.
        </p>
      </header>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          One source of truth for every number
        </h2>
        <p>
          Fees, deposits, income thresholds, tenures and property minimums are
          the whole point of this site, and a wrong one is worse than a missing
          page. So every number lives in a single verified data file, and the
          guides, the <Link href="/compare/">comparison table</Link>, the{" "}
          <Link href="/tools/eligibility/">eligibility checker</Link> and the{" "}
          <Link href="/tools/cost-calculator/">cost calculator</Link> all read
          from that one file. Change a rule in one place and it updates
          everywhere at once — the four pages can never quietly disagree with
          each other.
        </p>
        <p>
          The rule behind that file is simple:{" "}
          <strong>
            nothing renders a number that didn&apos;t come with an official
            source
          </strong>
          . If a figure can&apos;t be confirmed against a government page, it is
          flagged for review rather than published.
        </p>
      </section>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Where the figures come from
        </h2>
        <p>Each number is checked against the authority that owns it:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>PVIP</strong> — the Ministry of Tourism, Arts and Culture
            and the Immigration Department of Malaysia.
          </li>
          <li>
            <strong>MM2H</strong> — the MM2H centre at MOTAC (
            <span className="font-mono text-[0.95em]">mm2h.motac.gov.my</span>).
          </li>
          <li>
            <strong>Sarawak MM2H</strong> — Sarawak Immigration and the state
            programme office, which runs separately from the federal scheme.
          </li>
          <li>
            <strong>DE Rantau</strong> — MDEC, which administers the nomad pass.
          </li>
          <li>
            <strong>Student Pass</strong> — EMGS (
            <span className="font-mono text-[0.95em]">
              educationmalaysia.gov.my
            </span>
            ), which processes student applications.
          </li>
          <li>
            <strong>Employment Pass</strong> — the Expatriate Services Division
            of the Immigration Department.
          </li>
        </ul>
        <p>
          Where a source publishes a figure in US dollars, it is shown in US
          dollars; where it publishes in ringgit, it is shown in ringgit. The
          site does not convert between the two, because the exchange rate moves
          and the official threshold does not.
        </p>
      </section>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Review and dating
        </h2>
        <p>
          Every guide carries a{" "}
          <strong>&ldquo;last reviewed&rdquo; date and a named reviewer</strong>{" "}
          — Jason Yap, Managing Director of MYPVIP — at the foot of
          the page. That date is functional, not decorative: a visa figure from
          two years ago may simply be wrong, and both readers and AI assistants
          are right to trust a recently-checked page more than an undated one. If
          a page hasn&apos;t been reviewed recently, its date says so plainly
          rather than hiding it.
        </p>
      </section>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          When a rule changes
        </h2>
        <p>
          Malaysian visa rules change with little warning — fees are revised,
          tiers are added, qualification routes open and close. When that happens
          the fix goes into the one data file, which updates every page that
          cites the figure, and the review date on the affected guides is reset
          to the day the change was verified. Older superseded figures are
          replaced, not left standing alongside the new ones, so there is never a
          stale number lingering on a secondary page.
        </p>
      </section>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Independence and corrections
        </h2>
        <p>
          The site is run by someone with a commercial interest in some of these
          programmes, and that relationship is disclosed in full on the{" "}
          <Link href="/about/">about page</Link>. The editorial commitment that
          goes with it is that the cheaper and do-it-yourself routes are covered
          as honestly as the ones an agency is paid to file, and that each
          guide&apos;s &ldquo;who it doesn&apos;t suit&rdquo; section is written
          straight.
        </p>
        <p>
          Spotted a figure that looks wrong, or a rule that has moved on?{" "}
          <Link href="/contact/">Tell us</Link> — corrections to the numbers are
          the most useful message this site can receive, and they are checked
          against the official source and fixed at the point they&apos;re
          confirmed.
        </p>
      </section>
    </article>
  );
}
