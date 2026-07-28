import Link from "next/link";
import { reviewDate } from "@/lib/format";

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
}: {
  lastVerified?: string | null;
}) {
  return (
    <div className="flex items-start gap-4 border-y border-sand-200 py-5">
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-full bg-forest-700 font-serif text-lead text-sand-50"
      >
        JY
      </span>
      <p className="text-body-sm leading-relaxed text-ink-muted">
        Written and reviewed by{" "}
        <Link href="/about/" className="font-semibold text-forest-700 underline">
          Jason Yap
        </Link>
        , Managing Director of{" "}
        <a
          href="https://mypvip.com"
          rel="nofollow noopener"
          className="font-semibold text-forest-700 underline"
        >
          MYPVIP
        </a>
        .
        {lastVerified && (
          <>
            <br />
            Last reviewed {reviewDate(lastVerified)}.
          </>
        )}
      </p>
    </div>
  );
}
