export type FaqItem = { q: string; a: string };

/**
 * Renders the visible FAQ and emits FAQPage JSON-LD from the same array —
 * SPEC.md §4.4. One source, so the structured data can't drift from what the
 * reader actually sees, which is the failure mode Google penalises.
 */
export function Faq({ items }: { items: FaqItem[] }) {
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
    <section className="space-y-6">
      <h2 className="font-serif text-2xl font-semibold">Common questions</h2>
      <dl className="space-y-6">
        {items.map((i) => (
          <div key={i.q} className="space-y-2">
            <dt className="font-semibold text-forest-900">{i.q}</dt>
            <dd className="text-ink-muted">{i.a}</dd>
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
