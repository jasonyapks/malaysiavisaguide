import type { Metadata } from "next";
import Link from "next/link";
import { navRoutes } from "@/lib/site";
import { programmes } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";
import { images } from "@/lib/images";
import { Figure } from "@/components/Figure";

// Title and description come from the layout default (the home page is the one
// page that should carry the full sitewide title). Canonical is set explicitly
// so the apex has a self-reference like every other route.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** One-line descriptor per route, shown on the home cards. */
const BLURB: Record<string, string> = {
  "/visas/pvip/": "20-year residence, full work rights, the premium tier.",
  "/visas/mm2h/": "Silver, Gold and Platinum — the deposit-based classic.",
  "/visas/sarawak-mm2h/": "The cheapest serious long-stay route, via Sarawak.",
  "/visas/de-rantau/": "The nomad pass for remote, foreign-paid workers.",
  "/visas/employment-pass/": "For a job with a Malaysian employer.",
  "/visas/student-pass/": "For enrolment at a Malaysian institution.",
};

/**
 * The single serif word set in cobalt on each card — the reference's
 * "Settlement / Family / Lifestyle" device. One word, no punctuation: it is a
 * mood label for the route, not its name.
 */
const DISPLAY_WORD: Record<string, string> = {
  "/visas/pvip/": "Premium",
  "/visas/mm2h/": "Classic",
  "/visas/sarawak-mm2h/": "Value",
  "/visas/de-rantau/": "Remote",
  "/visas/employment-pass/": "Work",
  "/visas/student-pass/": "Study",
};

const ICON: Record<string, IconName> = {
  "/visas/pvip/": "spark",
  "/visas/mm2h/": "home",
  "/visas/sarawak-mm2h/": "target",
  "/visas/de-rantau/": "arrow",
  "/visas/employment-pass/": "square",
  "/visas/student-pass/": "swap",
};

/** The hero card's numbered rows — what this site does, in three lines. */
const PROMISES = [
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
];

const lastReviewed = programmes
  .map((p) => p.lastVerified)
  .sort()
  .at(-1)!;

/**
 * The official pages behind the figures, one row per issuing authority.
 *
 * Derived from the programme data rather than written out again here, so a
 * source that is corrected in one place cannot leave a stale duplicate on the
 * home page. Deduped by URL because several programmes share one document.
 */
const officialSources = [
  ...new Map(
    programmes.map((p) => [p.source, { authority: p.authority, url: p.source }]),
  ).values(),
].sort((a, b) => a.authority.localeCompare(b.authority));

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero — white to ice blue, drifting rings, one cobalt word. */}
      <section className="full-bleed -mt-14 relative overflow-hidden bg-linear-to-br from-sand-50 via-sand-100 to-[#dce8f6]">
        <div
          aria-hidden
          className="ring-decor -left-40 -top-32 size-[34rem] opacity-80"
        />
        <div
          aria-hidden
          className="ring-decor -right-56 top-10 size-[42rem] opacity-70"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
          <div className="rise space-y-7">
            <p className="eyebrow flex items-center gap-2">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-forest-600"
              />
              Independent · verified against official sources
            </p>

            <h1 className="text-display leading-[1.05]">
              Malaysia&apos;s
              <br />
              long-stay visas,
              <br />
              <span className="font-display accent-text font-medium italic">
                explained plainly
              </span>
            </h1>

            <p className="max-w-xl text-ink-muted">
              PVIP, MM2H, Sarawak MM2H and DE Rantau all let you live in Malaysia
              long term — and they differ enormously in cost, tenure and who they
              suit. Every figure here is checked against its official government
              source.
            </p>

            <ul className="flex flex-wrap gap-2.5">
              {[
                "Six programmes covered",
                "Costs in full",
                "Reviewed monthly",
              ].map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-sand-200 bg-white/70 px-4 py-1.5 text-eyebrow font-bold text-forest-700"
                >
                  {label}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-5 pt-1">
              <Link
                href="/tools/eligibility/"
                className="accent-fill rounded-full px-8 py-3.5 font-bold transition-transform hover:-translate-y-px"
              >
                Check what you qualify for
              </Link>
              <Link
                href="/compare/"
                className="inline-flex items-center gap-1.5 border-b-2 border-forest-600/40 pb-0.5 font-bold text-forest-900 transition-colors hover:border-forest-600"
              >
                Compare programmes <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>

          {/* The floating promise card — the reference's hero panel. */}
          <div className="card-lux relative p-7 sm:p-9">
            <p className="eyebrow">What this guide is</p>
            <h2 className="mt-3 text-h3 leading-snug">
              Not a brochure —{" "}
              <span className="text-forest-700">a reference you can check</span>
            </h2>

            <ul className="mt-7 space-y-3">
              {PROMISES.map((p, i) => (
                <li
                  key={p.title}
                  className="flex gap-4 rounded-2xl border border-sand-200/70 bg-sand-50/80 px-4 py-4"
                >
                  <NumberBadge n={i + 1} />
                  <div className="space-y-1">
                    <p className="font-serif text-body-sm font-bold leading-snug text-forest-900">
                      {p.title}
                    </p>
                    <p className="text-caption leading-relaxed text-ink-muted">
                      {p.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section heading + framing paragraph, split as the reference splits it. */}
      <section className="space-y-10">
        <SectionHead
          eyebrow="Choose your route"
          title={
            <>
              Which Malaysian visa
              <br />
              <span className="accent-text">actually fits you</span>
            </>
          }
          body={
            <>
              The three long-stay programmes differ by an order of magnitude in
              cost, and the work and study passes solve a different problem
              entirely. Start with the one that matches{" "}
              <strong className="font-bold text-forest-700">
                why you are coming
              </strong>
              .
            </>
          }
        />

        <ul className="grid gap-6 sm:grid-cols-3">
          {navRoutes("programmes").map((r, i) => (
            <ProgrammeCard key={r.path} path={r.path} title={r.title} n={i + 1} />
          ))}
        </ul>
      </section>

      {/* Work & study — same card, smaller. */}
      <section className="space-y-8">
        <SectionHead
          eyebrow="Work & study"
          title={
            <>
              Coming for a job,
              <br />
              <span className="accent-text">a course, or remote work</span>
            </>
          }
          body="These are not residence programmes — they are tied to an employer, an institution, or a foreign paycheque. Different rules, different timelines."
        />

        <ul className="grid gap-6 sm:grid-cols-3">
          {navRoutes("work-study").map((r, i) => (
            <ProgrammeCard key={r.path} path={r.path} title={r.title} n={i + 4} />
          ))}
        </ul>
      </section>

      {/* Freshness band — ice blue, full-bleed, with the review photo. */}
      <section className="full-bleed relative overflow-hidden border-y border-sand-200 bg-linear-to-b from-sand-100 to-[#e0eaf7]">
        <div
          aria-hidden
          className="ring-decor -right-32 -top-24 size-[30rem] opacity-70"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr]">
          <Figure
            image={images.home}
            aspect="aspect-[4/3]"
            rounded="rounded-card"
            priority
            sizes="(min-width: 768px) 460px, 100vw"
            className="shadow-[0_24px_60px_-30px_rgb(0_20_60/0.5)]"
          />
          <div className="space-y-4">
            <p className="eyebrow">Trust &amp; authority</p>
            <h2 className="text-h2">
              Every fee and threshold
              <br />
              <span className="font-display accent-text font-medium italic">
                last checked {reviewDate(lastReviewed)}
              </span>
            </h2>
            <p className="max-w-xl text-ink-muted">
              Malaysian visa rules change often — and most sites quietly go stale.
              When a figure here moves, it moves in one place, and the review date
              tells you exactly how fresh what you are reading is.
            </p>
            <div className="diamond-rule max-w-md pt-2">
              <Lozenge />
            </div>
          </div>
        </div>
      </section>

      {/* Where the figures come from. This section is the page's substance as
          well as its outbound linking: the claim "verified against official
          sources" is made in the hero, and this is where it is actually
          evidenced, with the documents named and linked. */}
      <section className="space-y-8">
        <SectionHead
          eyebrow="Sources"
          title={
            <>
              Where these figures
              <br />
              <span className="accent-text">actually come from</span>
            </>
          }
          body="Every number on this site is traceable to a government document. Below are the ones it is traced to — read them yourself if a figure matters to your decision."
        />

        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4 text-ink-muted">
            <p>
              Malaysia&apos;s long-stay visas are governed by several different
              bodies, and that is the root of most of the confusion around them.
              PVIP and MM2H are administered through the Ministry of Tourism,
              Arts and Culture and its One Stop Centre. Sarawak MM2H is a state
              programme with its own ministry, its own deposit and its own
              approvals — which is why an S-MM2H figure quoted from a federal
              page is usually wrong. DE Rantau sits with MDEC, the Employment
              Pass with the Expatriate Services Division, and the Student Pass
              with Immigration and EMGS.
            </p>
            <p>
              When a figure is checked here, it means someone opened the
              document in the list beside this paragraph, found the fee,
              threshold or tenure stated in it, and recorded the date. That date
              is published on the programme guide. Where a rule was announced by
              press release but never written into the official document, the
              guide says exactly that instead of quietly picking whichever
              number reads better.
            </p>
            <p>
              This matters more than it should, because these programmes are
              revised often and the internet does not keep up. MM2H alone has
              been restructured twice in recent years; deposit tiers, minimum
              stay and the agent requirement all moved. Pages that were accurate
              in 2023 still rank today, and agents restate old thresholds
              because the old thresholds were easier to sell against. A figure
              without a date and a source is not information you can plan around
              — it is a claim.
            </p>
            <p>
              So: read the documents. If one of them contradicts something
              written here, that is a bug in this site, and the{" "}
              <Link href="/contact/" className="font-semibold text-forest-700 underline">
                contact page
              </Link>{" "}
              exists partly so you can say so. The{" "}
              <Link
                href="/editorial-policy/"
                className="font-semibold text-forest-700 underline"
              >
                editorial policy
              </Link>{" "}
              sets out how corrections are handled and what the commercial
              relationship behind this site is.
            </p>
          </div>

          {/* Sticky so the documents stay beside the prose that describes them
              — the list is much shorter than the text, and pinned to the top it
              would leave a tall empty column next to the closing paragraphs. */}
          <ul className="space-y-3 self-start md:sticky md:top-24">
            {officialSources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-outline flex items-start justify-between gap-4 px-5 py-4 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700"
                >
                  <span>
                    <span className="block font-serif text-body-sm font-bold leading-snug text-forest-900">
                      {s.authority}
                    </span>
                    <span className="mt-1 block break-all text-eyebrow leading-relaxed text-ink-muted">
                      {sourceHost(s.url)}
                    </span>
                  </span>
                  <span aria-hidden className="mt-0.5 shrink-0 text-forest-600">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-8">
        <SectionHead
          eyebrow="Tools"
          title={
            <>
              Work out{" "}
              <span className="font-display accent-text font-medium italic">
                where you stand
              </span>
            </>
          }
          body="Three minutes with these beats an hour of reading — they run on the same verified figures as the guides."
        />
        <ul className="grid gap-4 sm:grid-cols-3">
          {navRoutes("tools").map((r) => (
            <li key={r.path}>
              <Link
                href={r.path}
                className="card-outline flex h-full items-center justify-between gap-3 px-5 py-5 font-serif font-bold text-forest-900 transition-transform hover:-translate-y-0.5"
              >
                {r.title}
                <span aria-hidden className="text-forest-600">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      {/* -mb-14 cancels main's bottom padding so the CTA runs straight into the
          footer rather than leaving a white seam between two ice-blue bands. */}
      <section className="full-bleed -mb-14 relative overflow-hidden border-t border-sand-200 bg-linear-to-br from-sand-100 via-sand-50 to-[#dce8f6]">
        <div
          aria-hidden
          className="ring-decor -left-40 -bottom-48 size-[36rem] opacity-70"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">1:1 consultation</p>
            <h2 className="text-h2">
              Still not sure
              <br />
              <span className="font-display accent-text font-medium italic">
                which visa fits?
              </span>
            </h2>
            <p className="max-w-lg text-ink-muted">
              Jason has handled 500+ relocations. Ask a question — no
              obligation, and no obligation to use his agency either.
            </p>
          </div>
          <Link
            href="/contact/"
            className="accent-fill shrink-0 rounded-full px-9 py-4 font-bold transition-transform hover:-translate-y-px"
          >
            Ask a question
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Eyebrow + two-line display heading + framing paragraph, split left/right. */
function SectionHead({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-start md:gap-10">
      <div className="space-y-3">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="text-h2 leading-[1.1]">{title}</h2>
      </div>
      <p className="border-l-2 border-forest-600/40 pl-5 text-ink-muted md:mt-9">
        {body}
      </p>
    </div>
  );
}

function ProgrammeCard({
  path,
  title,
  n,
}: {
  path: string;
  title: string;
  n: number;
}) {
  return (
    <li>
      <Link
        href={path}
        className="card-outline group flex h-full flex-col p-6 transition-transform hover:-translate-y-1"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <NumberBadge n={n} />
            <span className="font-serif text-body-sm font-extrabold leading-tight text-forest-900">
              {title}
            </span>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-sand-200 bg-white text-forest-700 shadow-sm transition-colors group-hover:border-forest-300">
            <Icon name={ICON[path]} />
          </span>
        </div>

        <p className="font-display accent-text mt-9 text-h1 font-medium">
          {DISPLAY_WORD[path]}
        </p>

        <div className="diamond-rule my-5">
          <Lozenge />
        </div>

        <p className="text-caption leading-relaxed text-ink-muted">
          {BLURB[path]}
        </p>
      </Link>
    </li>
  );
}

/**
 * Host plus a hint of the path, for the source links.
 *
 * The full URLs are long PDF paths that would wrap to four lines and tell the
 * reader nothing; the host is the part that carries the authority — seeing
 * `imi.gov.my` is the whole point of showing the URL at all.
 */
function sourceHost(url: string): string {
  try {
    const u = new URL(url);
    const file = u.pathname.split("/").filter(Boolean).at(-1) ?? "";
    const label = file.length > 0 && file.length <= 44 ? ` / ${file}` : "";
    return u.hostname.replace(/^www\./, "") + label;
  } catch {
    return url;
  }
}

/** The cobalt 01 / 02 / 03 disc. */
function NumberBadge({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="accent-fill grid size-9 shrink-0 place-items-center rounded-full font-serif text-eyebrow font-extrabold tracking-wide"
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

/** The small sky-blue diamond that sits at the centre of a hairline rule. */
function Lozenge() {
  return (
    <span
      aria-hidden
      className="size-1.5 rotate-45 bg-forest-600/70"
      style={{ borderRadius: "1px" }}
    />
  );
}

type IconName = "spark" | "home" | "target" | "arrow" | "square" | "swap";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  spark: <path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" />,
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  arrow: <path d="M6 18 18 6M9 6h9v9" />,
  square: <rect x="6" y="6" width="12" height="12" rx="1" />,
  swap: <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />,
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
