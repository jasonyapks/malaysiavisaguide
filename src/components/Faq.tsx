import type { Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";
import { GuideHead } from "@/components/GuideHead";

export type FaqItem = { q: string; a: string };

/**
 * Renders the visible FAQ and emits FAQPage JSON-LD from the same array —
 * SPEC.md §4.4. One source, so the structured data can't drift from what the
 * reader actually sees, which is the failure mode Google penalises.
 */
export function Faq({ items, locale }: { items: FaqItem[]; locale: Locale }) {
  const g = getUi(locale).guide;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <section className="space-y-8">
      <GuideHead
        eyebrow={g.faqEyebrow}
        title={
          <>
            {g.faqTitleLead}{" "}
            <span className="font-display accent-text font-medium italic">
              {g.faqTitleAccent}
            </span>
          </>
        }
      />
      <dl className="mx-auto max-w-3xl space-y-4">
        {/* A <dl> may only hold <dt>/<dd>, or a <div> wrapping them directly.
            Nesting them any deeper — e.g. inside a flex column beside the
            number badge — is invalid and makes screen readers announce the
            questions and answers as unrelated. The badge therefore lives
            INSIDE the <dt>, and the <dd> is indented to match by padding. */}
        {items.map((i, n) => (
          <div key={i.q} className="card-flat p-6">
            <dt className="flex items-center gap-5 font-serif font-extrabold text-forest-900">
              <span
                aria-hidden
                className="accent-fill grid size-9 shrink-0 place-items-center rounded-full text-eyebrow"
              >
                {String(n + 1).padStart(2, "0")}
              </span>
              {i.q}
            </dt>
            <dd className="mt-2 pl-[3.5rem] text-ink-muted">{i.a}</dd>
          </div>
        ))}
      </dl>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
