import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { LeadEvent } from "./LeadEvent";
import type { ThankYouCopy } from "./types";

/**
 * The thank-you page layout, shared by all three locales.
 *
 * Everything here is structure. Every word comes in through `copy`.
 */

// Same treatment as the about page's prose sections, named once so a translated
// page cannot drift from the English one visually.
const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";

export function ThankYouPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: ThankYouCopy;
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

      <section className={PROSE}>{copy.body(href)}</section>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {copy.cta.text}{" "}
        <Link href={href("/tools/eligibility/")} className="font-semibold underline">
          {copy.cta.label}
        </Link>{" "}
        {copy.cta.tail}
      </p>

      {/* The GA4 key event — see ./LeadEvent.tsx for why it is an effect. */}
      <LeadEvent />
    </article>
  );
}
