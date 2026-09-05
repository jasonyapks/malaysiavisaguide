import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import type { EditorialPolicyCopy } from "./types";

/**
 * The editorial policy layout, shared by all three locales.
 *
 * Everything here is structure. Every word comes in through `copy`.
 */

// Same treatment on every prose section: muted body text, forest underlined
// links, ink `<strong>`. Named once so a translated section cannot drift from
// the English one visually.
const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";

export function EditorialPolicyPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: EditorialPolicyCopy;
}) {
  const href = (path: string) => linkPath(path, locale);

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{copy.title}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.standfirst}
        </p>
      </header>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.oneSourceOfTruth.heading}
        </h2>
        {copy.oneSourceOfTruth.body(href)}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.sources.heading}
        </h2>
        {copy.sources.body}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.review.heading}
        </h2>
        {copy.review.body}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.changes.heading}
        </h2>
        {copy.changes.body}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.independence.heading}
        </h2>
        {copy.independence.body(href)}
      </section>
    </article>
  );
}
