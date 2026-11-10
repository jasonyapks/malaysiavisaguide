import Image from "next/image";
import Link from "next/link";
import { reviewDate } from "@/lib/format";
import { type Locale } from "@/lib/i18n";
import { images } from "@/lib/images";
import { site } from "@/lib/site";
import { linkPath } from "@/lib/translated";
import { getUi } from "@/lib/ui";

/**
 * The author box — SPEC.md §4.3. For a 45+, wealthy, scam-alert reader this is
 * conversion infrastructure, not garnish. It appears on every guide, insight
 * and news story, and it is the same box everywhere: portrait, name linked to
 * the author page, the two roles that explain why he is worth reading, and the
 * dates. The review date is functional rather than decorative: AI citation
 * decays sharply once a page looks stale.
 *
 * The link to mypvip.com is an identity link, so it carries no nofollow — see
 * `outboundRel` in src/lib/site.ts.
 */
export function Byline({
  /**
   * Omitted only where no review date exists to state. Guides always have one;
   * a news article written minutes ago briefly may not, and "Last reviewed
   * Invalid Date" would undermine the exact thing this component is for.
   */
  lastVerified,
  /** First publication, shown beside the review date where the page has one. */
  published,
  locale,
}: {
  lastVerified?: string | null;
  published?: string | null;
  locale: Locale;
}) {
  const g = getUi(locale).guide;
  const dates = [
    published && g.bylinePublished(reviewDate(published, locale)),
    lastVerified && g.bylineLastReviewed(reviewDate(lastVerified, locale)),
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-4 border-y border-sand-200 py-5">
      {/* Decorative here: the name is in the text beside it. */}
      <Image
        src={images.about.src}
        alt=""
        width={88}
        height={88}
        className="size-11 shrink-0 rounded-full object-cover object-top"
      />
      <div className="text-body-sm leading-relaxed text-ink-muted">
        <p>
          {g.bylineBefore}
          <Link
            href={linkPath(site.author.path, locale)}
            className="font-semibold text-forest-700 underline"
          >
            {site.author.name}
          </Link>
        </p>
        <p>
          {g.bylineMid}
          <a
            href="https://mypvip.com"
            rel="noopener"
            className="font-semibold text-forest-700 underline"
          >
            MYPVIP
          </a>
          {g.bylineAfter}
        </p>
        {dates.length > 0 && <p>{dates.join(" · ")}</p>}
      </div>
    </div>
  );
}
