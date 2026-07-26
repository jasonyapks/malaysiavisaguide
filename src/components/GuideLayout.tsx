import Image from "next/image";
import Link from "next/link";
import type { Programme } from "@/lib/data/programmes";
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
 * PRESENTATION (v3, 2026-07-25) follows connectinasia.com/mm2h: a cinematic
 * full-bleed photo hero with the title over it, centred section headings, and
 * content in cards that stagger left/right down the page. The information
 * ORDER above is unchanged — only its dressing is.
 *
 * The whole article is `full-bleed`, which escapes the 3xl column that <main>
 * imposes, and re-centres its own 5xl container. That extra width is what makes
 * the stagger legible; the cards keep the prose measure itself sane.
 */
export function GuideLayout({
  programme,
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

  return (
    <article className="full-bleed -mt-14 -mb-14">
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

      <div className="relative overflow-hidden bg-linear-to-b from-sand-50 via-sand-50 to-sand-100">
        <div
          aria-hidden
          className="ring-decor -right-64 top-40 size-[44rem] opacity-60"
        />

        <div className="relative mx-auto max-w-5xl space-y-20 px-6 py-20">
          {/* 1 — answer first, and visually the first thing under the hero. */}
          <p className="card-lux mx-auto max-w-3xl border-l-4 border-l-forest-600 px-7 py-6 text-[1.2rem] leading-relaxed text-forest-900">
            {answer}
          </p>

          {/* Between the answer and the figures on purpose: a reader who is
              going to act on a superseded fee has to pass the warning to reach
              it. Renders nothing unless the programme's source has fallen
              behind — see components/SupersededNotice.tsx. */}
          <div className="mx-auto max-w-3xl">
            <SupersededNotice programme={programme} />
          </div>

          {/* 2 */}
          {facts ?? <KeyFacts programme={programme} />}

          {/* 3–5 — the page's own sections, staggered down the page. Even
              children sit right, odd sit left; the offset only appears once
              there is width to spend on it. */}
          <div className="space-y-10 lg:[&>section:nth-child(even)]:ml-auto lg:[&>section]:w-[88%]">
            {children}
          </div>

          {/* 6 — the honest section. This is what makes a page worth citing. */}
          <section className="space-y-8">
            <GuideHead
              eyebrow="Honest fit"
              title={
                <>
                  Who it suits — and{" "}
                  <span className="font-display accent-text font-medium italic">
                    who it doesn&apos;t
                  </span>
                </>
              }
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <SuitList heading="A good fit if" tone="good" items={suits.yes} />
              <SuitList heading="Look elsewhere if" tone="bad" items={suits.no} />
            </div>
          </section>

          {/* 7 */}
          <Faq items={faq} />

          {/* 8 */}
          <Byline lastVerified={programme.lastVerified} />
        </div>
      </div>

      {/* 9 — one CTA, in the closing ice-blue band the whole site ends on. */}
      <section className="relative overflow-hidden border-t border-sand-200 bg-linear-to-br from-sand-100 via-sand-50 to-[#dce8f6]">
        <div
          aria-hidden
          className="ring-decor -left-40 -bottom-48 size-[34rem] opacity-70"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[1.15rem] font-semibold text-forest-900">
            {cta.text.replace(/\s*→\s*$/, "")}
          </p>
          <Link
            href={cta.href}
            className="accent-fill shrink-0 rounded-full px-8 py-3.5 font-bold transition-transform hover:-translate-y-px"
          >
            {cta.label ?? "Continue"}
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
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl !text-white sm:text-[3.25rem]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[1.1rem] text-white/85 sm:text-[1.25rem]">
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
      className={`card-lux p-6 ${tone === "good" ? "border-forest-300" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`grid size-8 shrink-0 place-items-center rounded-full text-[0.9rem] font-bold ${
            tone === "good"
              ? "accent-fill"
              : "bg-sand-100 text-ink-muted ring-1 ring-sand-200"
          }`}
        >
          {tone === "good" ? "✓" : "✕"}
        </span>
        <h3 className="font-serif text-lg font-extrabold">{heading}</h3>
      </div>
      <ul className="mt-4 space-y-3 text-[1.0625rem]">
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
 * A content section inside a guide — sections 3–5 of the template.
 *
 * Rendered as a staggered card. The numbered cobalt disc is positional (it
 * counts sections on the page), not a claim that the steps happen in that
 * order — guides describe requirements, not a process.
 */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-lux p-7 sm:p-9">
      <h2 className="font-serif text-2xl font-extrabold sm:text-[1.75rem]">
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
