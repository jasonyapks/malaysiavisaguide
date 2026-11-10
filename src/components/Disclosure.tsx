import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { linkPath } from "@/lib/translated";
import { getUi } from "@/lib/ui";

/**
 * The one-line disclosure that sits directly under the H1 (audit task B3-2).
 *
 * The footer block says the same thing at length, but a reader who lands on a
 * guide from search and leaves after the second screen never reaches the
 * footer. This puts who publishes the page, and what he sells, above the
 * figures rather than below them.
 */
export function Disclosure({ locale }: { locale: Locale }) {
  const g = getUi(locale).guide;
  return (
    <p className="max-w-3xl text-caption leading-relaxed text-ink-muted">
      {g.disclosureLineBefore}
      <Link
        href={linkPath(site.author.path, locale)}
        className="font-semibold text-forest-700 underline"
      >
        {site.author.name}
      </Link>
      {g.disclosureLineAfter}
    </p>
  );
}
