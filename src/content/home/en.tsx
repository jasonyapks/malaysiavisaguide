import Link from "next/link";
import type { HomeCopy } from "./types";

/** English home page copy — moved here verbatim from app/page.tsx. */
export const copy: HomeCopy = {
  hero: {
    eyebrow: "Independent · verified against official sources",
    heading: (
      <>
        Malaysia&apos;s
        <br />
        long-stay visas,
        <br />
        <span className="font-display accent-text font-medium italic">
          explained plainly
        </span>
      </>
    ),
    lead: "PVIP, MM2H, Sarawak MM2H and DE Rantau all let you live in Malaysia long term — and they differ enormously in cost, tenure and who they suit. Every figure here is checked against its official government source.",
    chips: ["Six programmes covered", "Costs in full", "Reviewed monthly"],
    ctaPrimary: "Check what you qualify for",
    ctaSecondary: "Compare programmes",
    cardEyebrow: "What this guide is",
    cardTitle: (
      <>
        Not a brochure —{" "}
        <span className="text-forest-700">a reference you can check</span>
      </>
    ),
    promises: [
      {
        title: "Every figure checked against its official source",
        body: "Fees, thresholds and tenures are traced to the government page that sets them, with the date we last looked.",
      },
      {
        title: "PVIP and MM2H compared side by side",
        body: "The same fields, the same units, one table — so the trade-offs are visible instead of buried in prose.",
      },
      {
        title: "Written to inform, not to close a sale",
        body: "Where a programme is the wrong fit, the guide says so. The commercial relationship is disclosed on every page.",
      },
    ],
  },

  blurbs: {
    "/visas/pvip/": "20-year residence, full work rights, the premium tier.",
    "/visas/mm2h/": "Silver, Gold and Platinum — the deposit-based classic.",
    "/visas/sarawak-mm2h/": "The cheapest serious long-stay route, via Sarawak.",
    "/visas/de-rantau/": "The nomad pass for remote, foreign-paid workers.",
    "/visas/employment-pass/": "For a job with a Malaysian employer.",
    "/visas/student-pass/": "For enrolment at a Malaysian institution.",
  },

  displayWords: {
    "/visas/pvip/": "Premium",
    "/visas/mm2h/": "Classic",
    "/visas/sarawak-mm2h/": "Value",
    "/visas/de-rantau/": "Remote",
    "/visas/employment-pass/": "Work",
    "/visas/student-pass/": "Study",
  },

  programmes: {
    eyebrow: "Choose your route",
    title: (
      <>
        Which Malaysian visa
        <br />
        <span className="accent-text">actually fits you</span>
      </>
    ),
    body: (
      <>
        The three long-stay programmes differ by an order of magnitude in cost,
        and the work and study passes solve a different problem entirely. Start
        with the one that matches{" "}
        <strong className="font-bold text-forest-700">why you are coming</strong>
        .
      </>
    ),
  },

  workStudy: {
    eyebrow: "Work & study",
    title: (
      <>
        Coming for a job,
        <br />
        <span className="accent-text">a course, or remote work</span>
      </>
    ),
    body: "These are not residence programmes — they are tied to an employer, an institution, or a foreign paycheque. Different rules, different timelines.",
  },

  freshness: {
    eyebrow: "Trust & authority",
    heading: (date) => (
      <>
        Every fee and threshold
        <br />
        <span className="font-display accent-text font-medium italic">
          last checked {date}
        </span>
      </>
    ),
    body: "Malaysian visa rules change often — and most sites quietly go stale. When a figure here moves, it moves in one place, and the review date tells you exactly how fresh what you are reading is.",
  },

  sources: {
    eyebrow: "Sources",
    title: (
      <>
        Where these figures
        <br />
        <span className="accent-text">actually come from</span>
      </>
    ),
    body: "Every number on this site is traceable to a government document. Below are the ones it is traced to — read them yourself if a figure matters to your decision.",
    prose: (href) => (
      <>
        <p>
          Malaysia&apos;s long-stay visas are governed by several different
          bodies, and that is the root of most of the confusion around them.
          PVIP sits with the Immigration Department of Malaysia; MM2H is
          administered through the Ministry of Tourism, Arts and Culture and its
          One Stop Centre. Confusing the two is the single most common error in
          secondary coverage. Sarawak MM2H is a state programme with its own
          ministry, its own deposit and its own approvals — which is why an
          S-MM2H figure quoted from a federal page is usually wrong. DE Rantau
          sits with MDEC, the Employment Pass with the Expatriate Services
          Division, and the Student Pass with Immigration and EMGS.
        </p>
        <p>
          When a figure is checked here, it means someone opened the document in
          the list beside this paragraph, found the fee, threshold or tenure
          stated in it, and recorded the date. That date is published on the
          programme guide. Where a rule was announced by press release but never
          written into the official document, the guide says exactly that
          instead of quietly picking whichever number reads better.
        </p>
        <p>
          This matters more than it should, because these programmes are revised
          often and the internet does not keep up. MM2H alone has been
          restructured twice in recent years; deposit tiers, minimum stay and
          the agent requirement all moved. Pages that were accurate in 2023
          still rank today, and agents restate old thresholds because the old
          thresholds were easier to sell against. A figure without a date and a
          source is not information you can plan around — it is a claim.
        </p>
        <p>
          So: read the documents. If one of them contradicts something written
          here, that is a bug in this site, and the{" "}
          <Link
            href={href("/contact/")}
            className="font-semibold text-forest-700 underline"
          >
            contact page
          </Link>{" "}
          exists partly so you can say so. The{" "}
          <Link
            href={href("/editorial-policy/")}
            className="font-semibold text-forest-700 underline"
          >
            editorial policy
          </Link>{" "}
          sets out how corrections are handled and what the commercial
          relationship behind this site is.
        </p>
      </>
    ),
  },

  tools: {
    eyebrow: "Tools",
    title: (
      <>
        Work out{" "}
        <span className="font-display accent-text font-medium italic">
          where you stand
        </span>
      </>
    ),
    body: "Three minutes with these beats an hour of reading — they run on the same verified figures as the guides.",
    indexLink: "Which tool answers which question",
    indexTail: "— and why eligibility comes before cost.",
  },

  insights: {
    eyebrow: "Insights",
    title: (
      <>
        Written from{" "}
        <span className="font-display accent-text font-medium italic">
          500+ real cases
        </span>
      </>
    ),
    body: (href) => (
      <>
        The guides say what each programme is. These say which one to pick, and
        what the paperwork is like once you have.{" "}
        <Link
          href={href("/insights/")}
          className="font-semibold text-forest-700 underline"
        >
          All insights
        </Link>
        .
      </>
    ),
  },

  closing: {
    eyebrow: "1:1 consultation",
    heading: (
      <>
        Still not sure
        <br />
        <span className="font-display accent-text font-medium italic">
          which visa fits?
        </span>
      </>
    ),
    body: "Jason has handled 500+ relocations. Ask a question — no obligation, and no obligation to use his agency either.",
    cta: "Ask a question",
  },
};
