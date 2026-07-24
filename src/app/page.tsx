import Link from "next/link";
import { navRoutes } from "@/lib/site";
import { programmes } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";

/** One-line descriptor per route, shown on the home cards. */
const BLURB: Record<string, string> = {
  "/visas/pvip/": "20-year residence, full work rights, the premium tier.",
  "/visas/mm2h/": "Silver, Gold and Platinum — the deposit-based classic.",
  "/visas/sarawak-mm2h/": "The cheapest serious long-stay route, via Sarawak.",
  "/visas/de-rantau/": "The nomad pass for remote, foreign-paid workers.",
  "/visas/employment-pass/": "For a job with a Malaysian employer.",
  "/visas/student-pass/": "For enrolment at a Malaysian institution.",
};

const lastReviewed = programmes
  .map((p) => p.lastVerified)
  .sort()
  .at(-1)!;

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero — full-bleed navy, echoing the official portal. */}
      <section className="full-bleed -mt-14 overflow-hidden bg-forest-900 text-sand-50">
        <Skyline />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-sand-100/10 px-3 py-1 text-[0.8rem] font-semibold tracking-wide text-sand-100 ring-1 ring-sand-100/20">
              Independent · verified against official sources
            </span>
            <h1 className="text-4xl font-bold leading-tight text-sand-50 sm:text-5xl">
              Malaysia&apos;s long-stay visas, explained without the sales pitch
            </h1>
            <p className="max-w-xl text-lg text-sand-100/90">
              PVIP, MM2H, Sarawak MM2H and DE Rantau let you live in Malaysia long
              term — and they differ enormously in cost, tenure and who they suit.
              Every figure here is checked against its official government source.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/tools/eligibility/"
                className="rounded-md bg-sand-50 px-6 py-3 font-semibold text-forest-900 transition-colors hover:bg-white"
              >
                Check what you qualify for
              </Link>
              <Link
                href="/compare/"
                className="inline-flex items-center gap-1.5 px-2 py-3 font-semibold text-sand-50 hover:text-white"
              >
                Compare programmes <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>

          {/* Hero image. Placeholder gradient — SPEC.md §4.3 wants original
              photography, so drop a real image into /public and swap this. */}
          <div
            aria-hidden
            className="hidden aspect-[4/3] rounded-2xl bg-gradient-to-br from-forest-600 via-forest-700 to-forest-900 shadow-2xl ring-1 ring-sand-100/10 md:block"
          >
            <div className="grid h-full place-items-center text-sand-100/40">
              <span className="text-sm font-medium">Original photography</span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest-updates band — cyan, echoing the portal's announcement strip. */}
      <section className="full-bleed bg-sand-100">
        <div className="mx-auto max-w-3xl space-y-2 px-6 py-10 text-center">
          <p className="text-[0.8rem] font-bold uppercase tracking-[0.2em] text-forest-700">
            Latest review
          </p>
          <h2 className="text-2xl font-bold text-forest-900">
            Every fee and threshold last checked {reviewDate(lastReviewed)}
          </h2>
          <p className="text-ink-muted">
            Malaysian visa rules change often. When a figure on this site moves,
            it moves in one place — and the review date tells you how fresh it is.
          </p>
        </div>
      </section>

      {/* Programme router */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Which route is yours?</h2>
          <p className="text-ink-muted">
            Start with the long-stay programmes, or jump to the work and study
            passes.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {navRoutes("programmes").map((r) => (
            <ProgrammeCard key={r.path} path={r.path} title={r.title} primary />
          ))}
        </ul>
        <ul className="grid gap-4 sm:grid-cols-3">
          {navRoutes("work-study").map((r) => (
            <ProgrammeCard key={r.path} path={r.path} title={r.title} />
          ))}
        </ul>
      </section>

      {/* Tools */}
      <section className="space-y-5 rounded-2xl border border-sand-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Work out where you stand</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {navRoutes("tools").map((r) => (
            <li key={r.path}>
              <Link
                href={r.path}
                className="flex h-full items-center rounded-lg bg-sand-50 px-4 py-3 font-semibold text-forest-700 ring-1 ring-sand-200 transition-colors hover:text-forest-900 hover:ring-forest-300"
              >
                {r.title} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="full-bleed bg-forest-900 text-sand-50">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-sand-50">
              Still not sure which visa fits?
            </h2>
            <p className="text-sand-100/85">
              Jason has handled 1,000+ relocations. Ask a question — no
              obligation.
            </p>
          </div>
          <Link
            href="/contact/"
            className="shrink-0 rounded-md bg-hibiscus-500 px-6 py-3 font-semibold text-sand-50 hover:bg-hibiscus-600"
          >
            Ask a question
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProgrammeCard({
  path,
  title,
  primary = false,
}: {
  path: string;
  title: string;
  primary?: boolean;
}) {
  return (
    <li>
      <Link
        href={path}
        className={`flex h-full flex-col gap-1 rounded-xl border px-5 py-4 transition-colors ${
          primary
            ? "border-sand-200 bg-white hover:border-forest-600"
            : "border-transparent bg-sand-100 hover:bg-sand-200"
        }`}
      >
        <span className="font-serif text-lg font-bold text-forest-900">
          {title}
        </span>
        <span className="text-[0.9rem] text-ink-muted">{BLURB[path]}</span>
      </Link>
    </li>
  );
}

/** A low-key KL skyline silhouette watermark for the hero. */
function Skyline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-sand-50 opacity-[0.06]"
      fill="currentColor"
    >
      <rect x="80" y="180" width="60" height="140" />
      <rect x="150" y="120" width="40" height="200" />
      <rect x="360" y="200" width="70" height="120" />
      <rect x="620" y="90" width="34" height="230" />
      <rect x="660" y="60" width="20" height="260" />
      <path d="M700 150 l24 -90 l24 90 z" />
      <rect x="716" y="150" width="16" height="170" />
      <rect x="820" y="170" width="90" height="150" />
      <rect x="1040" y="130" width="46" height="190" />
      <rect x="1200" y="200" width="80" height="120" />
      <rect x="1300" y="160" width="40" height="160" />
    </svg>
  );
}
