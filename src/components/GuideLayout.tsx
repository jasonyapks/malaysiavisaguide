import { Children, isValidElement, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Programme } from "@/lib/data/programmes";
import type { Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";
import type { SiteImage } from "@/lib/images";
import { site } from "@/lib/site";
import { Byline } from "@/components/Byline";
import { Faq, type FaqItem } from "@/components/Faq";
import { GuideHead, Lozenge } from "@/components/GuideHead";
import { KeyFacts } from "@/components/KeyFacts";
import { SupersededNotice } from "@/components/SupersededNotice";

/**
 * The guide template — SPEC.md §3. The order is deliberate and every guide
 * follows it:
 *
 *   1 answer-first summary · 2 key-facts card · 3–5 the page's own sections
 *   · 6 who it suits / who it doesn't · 7 FAQ · 8 last reviewed · 9 one CTA
 *
 * Sections 3–5 are `children` because they differ per programme. Everything
 * else is fixed, so no guide can quietly ship without a review date, a
 * source, or the honest suitability section.
 *
 * PRESENTATION: a cinematic full-bleed photo hero with the title over it, a
 * sticky "On this page" rail from `lg`, then the content in a single column.
 * The information ORDER above has never changed — only its dressing.
 *
 * The whole article is `full-bleed`, escaping the 3xl column that <main>
 * imposes, and re-centres its own 6xl container. That width now pays for the
 * contents rail beside the content rather than for a stagger.
 *
 * The v3 stagger (even sections pushed right, odd left) was removed on
 * 2026-07-27. It was intended as visual rhythm and behaved as a drifting left
 * edge — the one thing a reference page being scanned cannot afford. Do not
 * bring it back.
 */
export function GuideLayout({
  programme,
  locale,
  title,
  /** 40–60 words. AI Overviews and a skimming reader both get the answer without scrolling. */
  answer,
  /** Optional hero photo, from the image registry (src/lib/images.ts). */
  hero,
  suits,
  faq,
  cta,
  facts,
  children,
}: {
  programme: Programme;
  locale: Locale;
  title: string;
  answer: string;
  hero?: SiteImage;
  /**
   * Replaces the single key-facts card. MM2H is one programme with three
   * tiers, so it needs a tier table where the others need a card; the
   * byline, source and review date still come from `programme`.
   */
  facts?: React.ReactNode;
  suits: { yes: string[]; no: string[] };
  faq: FaqItem[];
  /**
   * The single contextual CTA. Never a popup, never more than one.
   * `text` is the prompt, `label` the words on the pill — split because the
   * band sets them as a sentence beside a button, not one long link.
   */
  cta: { text: string; href: string; label?: string };
  children: React.ReactNode;
}) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: answer,
    dateModified: programme.lastVerified,
    author: {
      "@type": "Person",
      name: "Jason Yap",
      jobTitle: "Managing Director, MYPVIP",
    },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    citation: programme.source,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: title },
    ],
  };

  // The hero's one-line standfirst. Taken as the first sentence of `answer`
  // rather than authored separately, so there is no second place for a claim
  // about the programme to live — and drift.
  const lead = answer.split(/(?<=\.)\s+/)[0];

  const g = getUi(locale).guide;

  // The contents rail, read off the sections the page actually passed rather
  // than from a second list each guide would have to keep in step. Every guide
  // ends with the same two fixed blocks, so those are appended here.
  const contents = [
    ...Children.toArray(children)
      .filter(
        (c): c is ReactElement<{ title: string }> =>
          isValidElement(c) && c.type === Section,
      )
      .map((c) => ({ id: sectionId(c.props.title), label: c.props.title })),
    { id: "who-it-suits", label: g.contentsSuits },
    { id: "questions", label: g.contentsQuestions },
  ];

  return (
    /* The negative margins cancel <main>'s padding so the hero reaches the
       header. They must track it exactly — main is py-8 on phones and py-14
       from `sm`, so these are too. */
    <article className="full-bleed -mt-8 -mb-8 sm:-mt-14 sm:-mb-14">
      {/* SPEC.md §4.4 — Article + BreadcrumbList per guide. FAQPage is emitted
          by <Faq>; Organization is sitewide in the root layout. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <GuideHero
        title={title}
        lead={lead}
        authority={programme.authority}
        image={hero}
      />

      {/* `overflow-clip`, NOT `overflow-hidden`. Both clip the decorative ring
          below, but `hidden` makes this element a scroll container, and a scroll
          container is what a `position: sticky` descendant sticks to — so the
          contents rail scrolled away with the page instead of holding at the
          top. `clip` does not create one, so the rail sticks to the viewport. */}
      <div className="relative overflow-clip bg-linear-to-b from-sand-50 via-sand-50 to-sand-100">
        <div
          aria-hidden
          className="ring-decor -right-64 top-40 size-[44rem] opacity-60"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-20">
         <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          {/* On this page. A guide runs to five long sections and previously
              offered no way to reach the one you came for except scrolling.
              A sticky rail from `lg`, a plain card below it — no JS either way,
              and it is derived from the sections themselves so it cannot drift
              out of step with them. */}
          <Contents
            items={contents}
            cta={{ href: cta.href, label: cta.label ?? g.ctaDefault }}
            onThisPageLabel={g.onThisPage}
          />

          <div className="min-w-0 space-y-14 sm:space-y-20">
          {/* 1 — answer first, and visually the first thing under the hero. */}
          <p className="card-flat max-w-3xl border-l-4 border-l-forest-600 px-7 py-6 text-lead leading-relaxed text-forest-900">
            {answer}
          </p>

          {/* Between the answer and the figures on purpose: a reader who is
              going to act on a superseded fee has to pass the warning to reach
              it. Renders nothing unless the programme's source has fallen
              behind — see components/SupersededNotice.tsx. */}
          <div className="max-w-3xl">
            <SupersededNotice programme={programme} />
          </div>

          {/* 2 */}
          {facts ?? <KeyFacts programme={programme} locale={locale} />}

          {/* 3–5 — the page's own sections.
              The v3 stagger (even sections pushed right, odd left) is gone. It
              read as visual rhythm and behaved as a drifting left edge, which
              is the one thing a reference page being scanned cannot afford. */}
          <div className="space-y-10">
            {children}
          </div>

          {/* 6 — the honest section. This is what makes a page worth citing. */}
          <section id="who-it-suits" className="scroll-mt-24 space-y-8">
            <GuideHead
              eyebrow={g.honestFitEyebrow}
              title={
                <>
                  {g.honestFitTitleLead}{" "}
                  <span className="font-display accent-text font-medium italic">
                    {g.honestFitTitleAccent}
                  </span>
                </>
              }
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <SuitList heading={g.goodFitIf} tone="good" items={suits.yes} />
              <SuitList heading={g.lookElsewhereIf} tone="bad" items={suits.no} />
            </div>
          </section>

          {/* 7 */}
          <div id="questions" className="scroll-mt-24">
            <Faq items={faq} locale={locale} />
          </div>

          {/* 8 */}
          <Byline lastVerified={programme.lastVerified} locale={locale} />
          </div>
         </div>
        </div>
      </div>

      {/* 9 — one CTA, in the closing ice-blue band the whole site ends on. */}
      <section className="relative overflow-hidden border-t border-sand-200 bg-linear-to-br from-sand-100 via-sand-50 to-[#dce8f6]">
        <div
          aria-hidden
          className="ring-decor -left-40 -bottom-48 size-[34rem] opacity-70"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-lead font-semibold text-forest-900">
            {cta.text.replace(/\s*→\s*$/, "")}
          </p>
          <Link
            href={cta.href}
            className="accent-fill shrink-0 rounded-full px-8 py-3.5 font-bold transition-transform hover:-translate-y-px"
          >
            {cta.label ?? g.ctaDefault}
          </Link>
        </div>
      </section>
    </article>
  );
}

/**
 * The cinematic hero. This is the one place on the site where text sits over a
 * photo — <Figure> deliberately refuses to do that for readability, and the
 * scrim below is what earns the exception: a near-opaque navy wash at the
 * bottom, so the title never depends on the photo's own tones for contrast.
 */
function GuideHero({
  title,
  lead,
  authority,
  image,
}: {
  title: string;
  lead: string;
  authority: string;
  image?: SiteImage;
}) {
  return (
    <header className="relative isolate flex min-h-[26rem] items-end overflow-hidden bg-forest-900 sm:min-h-[32rem]">
      {image?.ready && (
        // Descriptive alt, not alt="". These are content photographs with
        // written alt in the registry — a Kuching riverfront, a family on a
        // path — and they stay eligible for image search. The alt describes
        // the photo; it does not repeat the <h1> sitting on top of it.
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* Two washes: a vertical one to seat the text, a warm one to pull the
          photo into the site's palette rather than leaving it cold.

          The gradient is weighted to the BOTTOM, where the title sits — a wash
          heavy enough to cover the whole frame reads as a flat brown block on
          any photo whose subject isn't in the top third, which is most of
          them. Keep the upper stops light. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-[#000a2e]/92 via-[#000a2e]/45 to-[#000a2e]/15"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[#16305c] mix-blend-multiply opacity-15"
      />

      {/* The shadow is what lets the scrim stay light: it guarantees the type
          separates from whatever happens to be behind it — bright foliage on
          the DE Rantau shot, sky on Sarawak's — without darkening the photo. */}
      <div className="relative mx-auto w-full max-w-5xl px-6 pb-14 pt-24 text-center [text-shadow:0_2px_16px_rgb(0_6_26/0.6)] sm:pb-20">
        <p className="eyebrow !text-[#a8d4ec]">{authority}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-display !text-white">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lead text-white/85">
          {lead}
        </p>
      </div>
    </header>
  );
}

function SuitList({
  heading,
  tone,
  items,
}: {
  heading: string;
  tone: "good" | "bad";
  items: string[];
}) {
  return (
    <div
      className={`card-outline p-6 ${tone === "good" ? "border-forest-300" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`grid size-8 shrink-0 place-items-center rounded-full text-caption font-bold ${
            tone === "good"
              ? "accent-fill"
              : "bg-sand-100 text-ink-muted ring-1 ring-sand-200"
          }`}
        >
          {tone === "good" ? "✓" : "✕"}
        </span>
        <h3 className="font-serif text-lead font-extrabold">{heading}</h3>
      </div>
      <ul className="mt-4 space-y-3 text-body-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden
              className="mt-2.5 size-1.5 shrink-0 rotate-45 rounded-[1px] bg-forest-600/60"
            />
            <span className={tone === "good" ? "" : "text-ink-muted"}>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Turn a section title into a stable anchor. Shared by <Section> and the
 * contents rail so the two can never disagree about a link target.
 */
export function sectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * The "On this page" navigation.
 *
 * A sticky rail from `lg`, a plain card below it. `top-24` clears the sticky
 * site header with room to spare, and `max-h`/`overflow-y` mean a guide with
 * more sections than fit never traps a link off-screen.
 *
 * Deliberately server-rendered from the section list rather than scraped from
 * the DOM by a client component: the links are then real anchors in the static
 * HTML, which a crawler follows and a reader gets before hydration.
 */
function Contents({
  items,
  cta,
  onThisPageLabel,
}: {
  items: { id: string; label: string }[];
  cta: { href: string; label: string };
  onThisPageLabel: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
      <nav aria-label={onThisPageLabel}>
        <p className="eyebrow mb-3">On this page</p>
        <ul className="space-y-1 border-l border-sand-200">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-body-sm text-forest-700 transition-colors hover:border-forest-600 hover:text-forest-900 focus-visible:border-forest-600 focus-visible:text-forest-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* The page's one CTA, riding the sticky rail. It still closes the page
          in the full-width band at the foot; this is the same action reachable
          at any scroll position, which on a guide this long it previously was
          not. Rail only — below `lg` the foot band is the only instance, so a
          phone never gets two. */}
      <Link
        href={cta.href}
        className="mt-6 hidden rounded-full border border-forest-700 px-4 py-2.5 text-center text-body-sm font-semibold text-forest-700 transition-colors hover:bg-forest-700 hover:text-sand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 lg:block"
      >
        {cta.label}
      </Link>
    </div>
  );
}

/**
 * A content section inside a guide — sections 3–5 of the template.
 *
 * Carries an id derived from its own title so the contents rail can link to it
 * without either side holding a second copy of the label.
 */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={sectionId(title)} className="card-outline scroll-mt-24 p-7 sm:p-9">
      <h2 className="font-serif text-h3 font-extrabold">
        {title}
      </h2>
      <div className="diamond-rule my-5 max-w-sm">
        <Lozenge />
      </div>
      <div className="space-y-4 text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-bold [&_strong]:text-forest-900">
        {children}
      </div>
    </section>
  );
}
