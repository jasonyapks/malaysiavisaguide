import Link from "next/link";
import type { EditorialPolicyCopy } from "./types";

export const copy: EditorialPolicyCopy = {
  meta: {
    title: "Editorial policy",
    description:
      "How content here is researched, sourced, reviewed and dated — and what happens when a rule changes.",
  },

  title: "Editorial policy",

  standfirst: (
    <>
      Every figure on this site is traced to an official source, reviewed by a
      named person, and stamped with the date it was last checked. This page
      explains how that works, and what happens when the rules change — which,
      for Malaysian visas, they do often.
    </>
  ),

  oneSourceOfTruth: {
    heading: "One source of truth for every number",
    body: (href) => (
      <>
        <p>
          Fees, deposits, income thresholds, tenures and property minimums are
          the whole point of this site, and a wrong one is worse than a missing
          page. So every number lives in a single verified data file, and the
          guides, the <Link href={href("/compare/")}>comparison table</Link>,
          the{" "}
          <Link href={href("/tools/eligibility/")}>eligibility checker</Link>{" "}
          and the{" "}
          <Link href={href("/tools/cost-calculator/")}>cost calculator</Link>{" "}
          all read from that one file. Change a rule in one place and it updates
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
      </>
    ),
  },

  sources: {
    heading: "Where the figures come from",
    body: (
      <>
        <p>Each number is checked against the authority that owns it:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>PVIP</strong> — the Immigration Department of Malaysia,
            which owns the programme outright. MOTAC has no part in it; that is
            MM2H.
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
      </>
    ),
  },

  review: {
    heading: "Review and dating",
    body: (
      <p>
        Every guide carries a{" "}
        <strong>&ldquo;last reviewed&rdquo; date and a named reviewer</strong>{" "}
        — Jason Yap, Managing Director of{" "}
        <a href="https://mypvip.com" rel="nofollow noopener">
          MYPVIP
        </a>{" "}
        — at the foot of the page. That date is functional, not decorative: a
        visa figure from two years ago may simply be wrong, and both readers and
        AI assistants are right to trust a recently-checked page more than an
        undated one. If a page hasn&apos;t been reviewed recently, its date says
        so plainly rather than hiding it.
      </p>
    ),
  },

  changes: {
    heading: "When a rule changes",
    body: (
      <p>
        Malaysian visa rules change with little warning — fees are revised,
        tiers are added, qualification routes open and close. When that happens
        the fix goes into the one data file, which updates every page that cites
        the figure, and the review date on the affected guides is reset to the
        day the change was verified. Older superseded figures are replaced, not
        left standing alongside the new ones, so there is never a stale number
        lingering on a secondary page.
      </p>
    ),
  },

  independence: {
    heading: "Independence and corrections",
    body: (href) => (
      <>
        <p>
          The site is run by someone with a commercial interest in some of these
          programmes, and that relationship is disclosed in full on the{" "}
          <Link href={href("/about/")}>about page</Link>. The editorial
          commitment that goes with it is that the cheaper and do-it-yourself
          routes are covered as honestly as the ones an agency is paid to file,
          and that each guide&apos;s &ldquo;who it doesn&apos;t suit&rdquo;
          section is written straight.
        </p>
        <p>
          Spotted a figure that looks wrong, or a rule that has moved on?{" "}
          <Link href={href("/contact/")}>Tell us</Link> — corrections to the
          numbers are the most useful message this site can receive, and they
          are checked against the official source and fixed at the point
          they&apos;re confirmed.
        </p>
      </>
    ),
  },
};
