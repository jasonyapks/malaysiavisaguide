import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { localisedNavRoutes } from "@/lib/site";
import { programmes } from "@/lib/data/programmes";
import { insightPath } from "@/lib/data/insights";
import { publishedInsights } from "@/lib/insights";
import { reviewDate } from "@/lib/format";
import { getUi } from "@/lib/ui";
import { images } from "@/lib/images";
import { Figure } from "@/components/Figure";
import type { HomeCopy } from "./types";

/**
 * The home page layout, shared by all three locales.
 *
 * Everything here is structure — the grid, the cards, the icons, the sticky
 * source list. Every word comes in through `copy`. See ./types.ts for why the
 * copy is JSX rather than a string dictionary.
 */

const ICON: Record<string, IconName> = {
  "/visas/pvip/": "spark",
  "/visas/mm2h/": "home",
  "/visas/sarawak-mm2h/": "target",
  "/visas/de-rantau/": "arrow",
  "/visas/employment-pass/": "square",
  "/visas/student-pass/": "swap",
};

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
 *
 * NOT translated, and that is deliberate: these are the names of government
 * bodies as they appear on the documents themselves, and a reader who follows
 * the link lands on an English or Malay page. Renaming them in Chinese would
 * make the authority harder to verify, which is the opposite of the point.
 */
const officialSources = [
  ...new Map(
    programmes.map((p) => [p.source, { authority: p.authority, url: p.source }]),
  ).values(),
].sort((a, b) => a.authority.localeCompare(b.authority));

export async function HomePage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: HomeCopy;
}) {
  // Read at build time, like /insights/ itself — `output: "export"` prerenders
  // this page, so there is no request-time fetch here.
  //
  // Per locale, not English-only: /insights/ has a translated tree now
  // (scripts/translate-content.mjs), and this reads whichever one the host
  // serves. A locale with nothing translated yet gets an empty array and the
  // section below hides itself, rather than sending a Chinese reader to three
  // English articles.
  const articles = await publishedInsights(locale);

  const href = (path: string) => linkPath(path, locale);

  return (
    <div className="space-y-24">
      {/* Hero — off-white to mist, two compass arcs, one gold word.
          Branding template §7 and §9. */}
      <section className="full-bleed -mt-14 relative overflow-hidden bg-linear-to-br from-sand-50 via-sand-100 to-[#e9edf4]">
        {/* Directional lines, masked to the top-right corner. Unmasked they
            tile the whole hero and the lead paragraph ends up sitting on a
            hatch — §7's "keep them subtle" is a constraint on AREA as much as
            on opacity. */}
        <div
          aria-hidden
          className="directional-lines absolute inset-0 [mask-image:linear-gradient(215deg,#000,transparent_55%)]"
        />
        <div
          aria-hidden
          className="compass-arc [--arc-spin:200deg] -left-40 -top-32 size-[34rem] opacity-80"
        />
        <div
          aria-hidden
          className="compass-arc [--arc-spin:20deg] -right-56 top-10 size-[42rem] opacity-70"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-20 pb-14 md:grid-cols-[1.05fr_0.95fr] md:pt-28 md:pb-16">
          <div className="rise space-y-7">
            <p className="eyebrow flex items-center gap-2">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-gold-500"
              />
              {copy.hero.eyebrow}
            </p>

            <h1 className="text-display leading-[1.05]">
              {copy.hero.heading}
            </h1>

            {copy.hero.subheading && (
              <h2 className="text-h3 font-semibold text-forest-800">
                {copy.hero.subheading}
              </h2>
            )}

            <p className="max-w-xl text-ink-muted">{copy.hero.lead}</p>

            <ul className="flex flex-wrap gap-2.5">
              {copy.hero.chips.map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-sand-200 bg-white/70 px-4 py-1.5 text-eyebrow font-bold text-forest-700"
                >
                  {label}
                </li>
              ))}
            </ul>

            {/* Branding template §9 names the first two: "Explore Visa Options"
                primary, "Talk to an Expert" secondary. The destinations follow
                the labels — /compare/ lays the options side by side, an expert
                is reached at /contact/.

                The eligibility checker is the third destination and the site's
                main lead magnet, and up to v6 it was a third *link* sitting
                under the other two. That was the wrong shape: three controls in
                one visual family, so the reader had to rank them, and the one
                doing the most work read as the least important.

                It is now a tool row instead — a bordered card is a different
                affordance class from a button and a text link, so it reads as
                "a thing that does something" rather than as a third CTA, and
                the two-CTA hierarchy the template specs survives intact while
                the quiz gets *more* presence, not less. It leads with the
                reader's question rather than the tool's name (the person who
                needs it is the one who just bounced off "Explore Visa Options"
                because they don't know what to explore), and it prices the
                click: the quiz page's own promise — six questions, no sign-up —
                is the thing that removes the two objections that stop people
                starting a quiz. Whole row is the target, not 20px of text. */}
            <div className="space-y-5 pt-1">
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  href={href("/compare/")}
                  className="accent-fill rounded-full px-8 py-3.5 font-bold transition-transform hover:-translate-y-px"
                >
                  {copy.hero.ctaPrimary}
                </Link>
                <Link
                  href={href("/contact/")}
                  className="inline-flex items-center gap-1.5 border-b-2 border-forest-600/40 pb-0.5 font-bold text-forest-900 transition-colors hover:border-forest-600"
                >
                  {copy.hero.ctaSecondary} <span aria-hidden>↗</span>
                </Link>
              </div>

              <Link
                href={href("/tools/eligibility/")}
                className="group flex max-w-xl items-center gap-4 rounded-2xl border border-sand-200 bg-white/70 px-5 py-4 transition-[transform,border-color,background-color,box-shadow] hover:-translate-y-px hover:border-gold-500/60 hover:bg-white hover:shadow-[0_10px_28px_-18px_rgb(0_0_0/0.45)]"
              >
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/40 transition-colors group-hover:bg-gold-500/20"
                >
                  <Icon name="target" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-body-sm font-bold leading-snug text-forest-900">
                    {copy.hero.quiz.prompt}
                  </span>
                  <span className="mt-0.5 block text-caption leading-relaxed text-ink-muted">
                    {copy.hero.quiz.meta}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-forest-700 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* The floating promise card — the reference's hero panel. */}
          <div className="card-lux relative p-7 sm:p-9">
            <p className="eyebrow">{copy.hero.cardEyebrow}</p>
            <h2 className="mt-3 text-h3 leading-snug">{copy.hero.cardTitle}</h2>

            <ul className="mt-7 space-y-3">
              {copy.hero.promises.map((p, i) => (
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

        {/* The brand key visual, full content width, closing the hero.

            It sits BELOW the copy, not above it, and that is measured rather
            than taste: the graphic is 16:9, so at the 1104px content width it
            renders 621px tall. Above the headline it filled a 698px viewport
            on its own and pushed the h1, both CTAs and the quiz card off the
            first screen. A banner that hides the entire value proposition is
            not a hero, so the reader gets the promise and the buttons first
            and the brand statement as the full-width close.

            Width is the max-w-6xl content column, NOT an edge-to-edge bleed —
            bleeding a 16:9 image makes it ~1400px tall on a wide monitor.

            No `priority`: it is below the copy and no longer the LCP
            candidate, so preloading it would compete with the text paint the
            visitor is actually waiting on — the same reasoning that kept it
            lazy in the freshness band. */}
        <div className="relative mx-auto max-w-6xl px-6 pb-20 md:pb-24">
          <Figure
            image={images.home}
            aspect="aspect-video"
            rounded="rounded-card"
            sizes="(min-width: 1200px) 1104px, (min-width: 768px) 92vw, 100vw"
            className="shadow-[0_30px_70px_-35px_rgb(0_20_60/0.45)]"
          />
        </div>
      </section>

      {/* Section heading + framing paragraph, split as the reference splits it. */}
      <Wide space="space-y-10">
        <SectionHead {...copy.programmes} />

        <ul className="grid gap-6 sm:grid-cols-3">
          {localisedNavRoutes("programmes", locale).map((r, i) => (
            <ProgrammeCard
              key={r.path}
              href={r.path}
              canonicalPath={r.canonicalPath}
              title={r.title}
              displayWord={copy.displayWords[r.canonicalPath]}
              blurb={copy.blurbs[r.canonicalPath]}
              n={i + 1}
            />
          ))}
        </ul>
      </Wide>

      {/* Work & study — same card, smaller. */}
      <Wide space="space-y-8">
        <SectionHead {...copy.workStudy} />

        <ul className="grid gap-6 sm:grid-cols-3">
          {localisedNavRoutes("work-study", locale).map((r, i) => (
            <ProgrammeCard
              key={r.path}
              href={r.path}
              canonicalPath={r.canonicalPath}
              title={r.title}
              displayWord={copy.displayWords[r.canonicalPath]}
              blurb={copy.blurbs[r.canonicalPath]}
              n={i + 4}
            />
          ))}
        </ul>
      </Wide>

      {/* Freshness band — ice blue, full-bleed. The key visual that used to sit
          on the left has moved up to the hero, so this is a single column now:
          the band is about the review date, and the graphic was never carrying
          that claim. */}
      <section className="full-bleed relative overflow-hidden border-y border-sand-200 bg-linear-to-b from-sand-100 to-[#dfe3e9]">
        <div
          aria-hidden
          className="compass-arc [--arc-spin:300deg] -right-32 -top-24 size-[30rem] opacity-70"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="space-y-4">
            <p className="eyebrow">{copy.freshness.eyebrow}</p>
            <h2 className="text-h2">
              {copy.freshness.heading(reviewDate(lastReviewed))}
            </h2>
            <p className="max-w-xl text-ink-muted">{copy.freshness.body}</p>
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
      <Wide space="space-y-8">
        <SectionHead
          eyebrow={copy.sources.eyebrow}
          title={copy.sources.title}
          body={copy.sources.body}
        />

        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4 text-ink-muted">
            {copy.sources.prose(href)}
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
      </Wide>

      {/* Tools */}
      <Wide space="space-y-8">
        <SectionHead
          eyebrow={copy.tools.eyebrow}
          title={copy.tools.title}
          body={copy.tools.body}
        />
        <ul className="grid gap-4 sm:grid-cols-3">
          {localisedNavRoutes("tools", locale).map((r) => (
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
        {/* /tools/ carries no nav group (see lib/site.ts), so this is its only
            internal link. Without it the page is an orphan and Google has no
            reason to recrawl the path it was 404ing on. */}
        <p className="text-body-sm text-ink-muted">
          <Link
            href={href("/tools/")}
            className="font-semibold text-forest-700 underline"
          >
            {copy.tools.indexLink}
          </Link>{" "}
          {copy.tools.indexTail}
        </p>
      </Wide>

      {/* Insights.

          The three articles are linked here by name rather than behind a single
          "read the insights" link, and that is the point of the section: as of
          2026-08-08 Search Console had /insights/ itself in "Discovered –
          currently not indexed" with Last crawled N/A, so every article under
          it sat behind a page Google had never fetched. A direct link from the
          home page is a crawl path that does not depend on the index.

          Hidden entirely when there are no articles for this locale, rather
          than rendered as an empty grid under a heading. */}
      {articles.length > 0 && (
        <Wide space="space-y-8">
          <SectionHead {...copy.insights} body={copy.insights.body(href)} />
          <ul className="grid gap-6 sm:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <li key={a.slug}>
                <Link
                  href={insightPath(a)}
                  className="card-outline flex h-full flex-col p-6 transition-transform hover:-translate-y-1"
                >
                  <p className="eyebrow">{getUi(locale).insights.categoryLabel[a.category]}</p>
                  <p className="mt-3 font-serif text-body-sm font-bold leading-snug text-forest-900">
                    {a.title}
                  </p>
                  <div className="diamond-rule my-5">
                    <Lozenge />
                  </div>
                  <p className="text-caption leading-relaxed text-ink-muted">
                    {a.dek}
                  </p>
                  <p className="mt-auto pt-5 text-eyebrow font-bold text-forest-700">
                    {getUi(locale).news.card.minRead(a.readingMinutes)}{" "}
                    <span aria-hidden>→</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Wide>
      )}

      {/* Closing CTA */}
      {/* -mb-14 cancels main's bottom padding so the CTA runs straight into the
          footer rather than leaving a white seam between two ice-blue bands. */}
      <section className="full-bleed -mb-14 relative overflow-hidden border-t border-sand-200 bg-linear-to-br from-sand-100 via-sand-50 to-[#e9edf4]">
        <div
          aria-hidden
          className="compass-arc [--arc-spin:120deg] -left-40 -bottom-48 size-[36rem] opacity-70"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{copy.closing.eyebrow}</p>
            <h2 className="text-h2">{copy.closing.heading}</h2>
            <p className="max-w-lg text-ink-muted">{copy.closing.body}</p>
          </div>
          <Link
            href={href("/contact/")}
            className="accent-fill shrink-0 rounded-full px-9 py-4 font-bold transition-transform hover:-translate-y-px"
          >
            {copy.closing.cta}
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
  href,
  canonicalPath,
  title,
  displayWord,
  blurb,
  n,
}: {
  href: string;
  canonicalPath: string;
  title: string;
  displayWord: string;
  blurb: string;
  n: number;
}) {
  return (
    <li>
      <Link
        href={href}
        className="card-outline group flex h-full flex-col p-6 transition-transform hover:-translate-y-1"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <NumberBadge n={n} />
            <span className="font-serif text-body-sm font-bold leading-tight text-forest-900">
              {title}
            </span>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-sand-200 bg-white text-forest-700 shadow-sm transition-colors group-hover:border-forest-300">
            <Icon name={ICON[canonicalPath]} />
          </span>
        </div>

        <p className="font-display accent-text mt-9 text-h1 font-medium">
          {displayWord}
        </p>

        <div className="diamond-rule my-5">
          <Lozenge />
        </div>

        <p className="text-caption leading-relaxed text-ink-muted">{blurb}</p>
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

/**
 * A content section on the home page's wide column.
 *
 * The hero, the freshness band and the closing CTA are all `full-bleed` with an
 * inner `max-w-6xl px-6`. The sections between them were plain `<section>`s, so
 * they inherited <main>'s 3xl reading column instead — 768px against the hero's
 * 1152px, on the same screen, with a left edge 192px further in. The programme
 * cards were the visible symptom: three cards in 768px, with "Coming for a job,
 * a course, or remote work" breaking across three lines beside them.
 *
 * This gives them the same escape and the same inner container, so every band
 * on the page shares one left edge. Padding sits on the inner div rather than
 * the section, exactly as the hero does it — put it on the section and the
 * content lands 24px off the hero's edge.
 *
 * Deliberately local to this file. It is not a general layout primitive: the
 * reading pages genuinely want the 3xl measure, and <main> is still the right
 * default for them. See RootShell.
 */
function Wide({
  space,
  children,
}: {
  /** The vertical rhythm between this section's own children. */
  space: string;
  children: React.ReactNode;
}) {
  return (
    <section className="full-bleed">
      <div className={`mx-auto max-w-6xl px-6 ${space}`}>{children}</div>
    </section>
  );
}

/** The gold 01 / 02 / 03 disc. */
function NumberBadge({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="accent-fill grid size-9 shrink-0 place-items-center rounded-full font-serif text-eyebrow font-bold tracking-wide"
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

/** The small gold diamond that sits at the centre of a hairline rule. */
function Lozenge() {
  return (
    <span
      aria-hidden
      className="size-1.5 rotate-45 bg-gold-500"
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
