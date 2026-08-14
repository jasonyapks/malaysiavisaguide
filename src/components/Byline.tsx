import Link from "next/link";
import { reviewDate } from "@/lib/format";
import { localePath, type Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";

/**
 * Trust furniture — SPEC.md §4.3. For a 45+, wealthy, scam-alert reader this
 * is conversion infrastructure, not garnish. It appears on every guide, and
 * the review date is functional rather than decorative: AI citation decays
 * sharply once a page looks stale.
 */
export function Byline({
  /**
   * Omitted only where no review date exists to state. Guides always have one;
   * a news article written minutes ago briefly may not, and "Last reviewed
   * Invalid Date" would undermine the exact thing this component is for.
   */
  lastVerified,
  locale,
}: {
  lastVerified?: string | null;
  locale: Locale;
}) {
  const g = getUi(locale).guide;
  return (
    <div className="flex items-start gap-4 border-y border-sand-200 py-5">
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-full bg-forest-700 font-serif text-lead text-sand-50"
      >
        JY
      </span>
      <p className="text-body-sm leading-relaxed text-ink-muted">
        {g.bylineBefore}
        <Link
          href={localePath("/about/", locale)}
          className="font-semibold text-forest-700 underline"
        >
          Jason Yap
        </Link>
        {g.bylineMid}
        <a
          href="https://mypvip.com"
          rel="nofollow noopener"
          className="font-semibold text-forest-700 underline"
        >
          MYPVIP
        </a>
        {g.bylineAfter}.
        {lastVerified && (
          <>
            <br />
            {g.bylineLastReviewed(reviewDate(lastVerified))}
          </>
        )}
      </p>
    </div>
  );
}
