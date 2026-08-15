import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { images } from "@/lib/images";
import { Figure } from "@/components/Figure";
import type { AboutCopy } from "./types";

/**
 * The about page layout, shared by all three locales.
 *
 * Everything here is structure. Every word comes in through `copy`.
 */

// The prose sections all take the same treatment: muted body text, forest
// underlined links, ink `<strong>`. Named once so a translated section cannot
// drift from the English one visually.
const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";

export function AboutPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: AboutCopy;
}) {
  const href = (path: string) => linkPath(path, locale);

  // Person + Organization relationship, made explicit for search and AI
  // crawlers. SPEC.md §1 — the editorial authority (E-E-A-T) is Jason, and the
  // commercial relationship is disclosed rather than hidden.
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jason Yap",
    jobTitle: "Managing Director, MYPVIP",
    worksFor: [
      { "@type": "Organization", name: "MYPVIP (MY PR Program Sdn Bhd)" },
      { "@type": "Organization", name: "MY Premium MM2H (My Premium (MM2H) Sdn Bhd)" },
    ],
    description: copy.schemaDescription,
  };

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">
          {copy.title}
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.standfirst}
        </p>
      </header>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.who.heading}
        </h2>
        <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-start">
          {/* The alt is overridden per locale rather than added to `Figure`'s
              props: the asset record is shared and the sentence is not. */}
          <Figure
            image={{ ...images.about, alt: copy.portraitAlt }}
            aspect="aspect-[4/5]"
            rounded="rounded-xl"
            sizes="200px"
            className="max-w-[200px]"
          />
          {copy.who.beside}
        </div>
        {copy.who.body}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.disclosure.heading}
        </h2>
        {copy.disclosure.body(href)}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.government.heading}
        </h2>
        {copy.government.body}
      </section>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {copy.cta.text}{" "}
        <Link href={href("/tools/eligibility/")} className="font-semibold underline">
          {copy.cta.label}
        </Link>{" "}
        {copy.cta.tail}
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </article>
  );
}
