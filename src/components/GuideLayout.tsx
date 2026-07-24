import Link from "next/link";
import type { Programme } from "@/lib/data/programmes";
import type { SiteImage } from "@/lib/images";
import { site } from "@/lib/site";
import { Byline } from "@/components/Byline";
import { Faq, type FaqItem } from "@/components/Faq";
import { Figure } from "@/components/Figure";
import { KeyFacts } from "@/components/KeyFacts";

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
  /** The single contextual CTA. Never a popup, never more than one. */
  cta: { text: string; href: string };
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
      jobTitle: "Chairman, PVIP Agent Association",
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

  return (
    <article className="space-y-12">
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

      <header className="space-y-6">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">{title}</h1>
        {/* 1 — answer first. */}
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          {answer}
        </p>
      </header>

      {/* Hero photo — after the answer so the text stays first in the DOM. */}
      {hero && <Figure image={hero} aspect="aspect-[16/7]" priority />}

      {/* 2 */}
      {facts ?? <KeyFacts programme={programme} />}

      {/* 3–5 */}
      {children}

      {/* 6 — the honest section. This is what makes a page worth citing. */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold">
          Who it suits — and who it doesn&apos;t
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <SuitList
            heading="A good fit if"
            tone="good"
            items={suits.yes}
          />
          <SuitList
            heading="Look elsewhere if"
            tone="bad"
            items={suits.no}
          />
        </div>
      </section>

      {/* 7 */}
      <Faq items={faq} />

      {/* 8 */}
      <Byline lastVerified={programme.lastVerified} />

      {/* 9 */}
      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        <Link href={cta.href} className="font-semibold underline">
          {cta.text}
        </Link>
      </p>
    </article>
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
      className={`rounded-xl border p-5 ${
        tone === "good"
          ? "border-forest-300 bg-forest-50"
          : "border-sand-400 bg-sand-100"
      }`}
    >
      <h3 className="font-serif text-lg font-semibold">{heading}</h3>
      <ul className="mt-3 space-y-2 text-[1.0625rem]">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-ink-muted">
              {tone === "good" ? "✓" : "✗"}
            </span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A content section inside a guide — sections 3–5 of the template. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      <div className="space-y-4 text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
