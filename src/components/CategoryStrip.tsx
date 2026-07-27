import Link from "next/link";
import { CATEGORY_LABEL, categoryPath, type NewsCategory } from "@/lib/news";

/**
 * Browse-by-category navigation, shown above the feed on /news and on every
 * category page.
 *
 * The count is deliberate. A bare row of programme names asks the reader to
 * guess whether a category holds twelve stories or one; showing the number
 * turns the strip into a description of the archive rather than a set of
 * gambles. Categories with nothing in them are not listed at all — they have no
 * page to link to.
 */
export function CategoryStrip({
  categories,
  /** The category being viewed, if any — rendered as current, not as a link. */
  current,
}: {
  categories: { category: NewsCategory; articles: unknown[] }[];
  current?: NewsCategory;
}) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Browse news by category" className="flex flex-wrap gap-2">
      <Item href="/news/" label="All stories" current={current === undefined} />
      {categories.map(({ category, articles }) => (
        <Item
          key={category}
          href={categoryPath(category)}
          label={CATEGORY_LABEL[category]}
          count={articles.length}
          current={category === current}
        />
      ))}
    </nav>
  );
}

function Item({
  href,
  label,
  count,
  current,
}: {
  href: string;
  label: string;
  count?: number;
  current: boolean;
}) {
  const body = (
    <>
      {label}
      {count !== undefined && (
        // Margin, not a JSX space — a leading {" "} inside the span collapses
        // against the label and the count renders as "MM2H3".
        <span
          aria-hidden
          className={`ml-2 tabular-nums ${
            current ? "text-sand-50/70" : "text-ink-muted"
          }`}
        >
          {count}
        </span>
      )}
    </>
  );

  // The bare number is ambiguous read aloud — "MM2H 3" could be part of the
  // programme's name. The digit is hidden from assistive tech and the count
  // spelled out here instead.
  const described =
    count === undefined
      ? label
      : `${label} — ${count} ${count === 1 ? "story" : "stories"}`;

  // 44px minimum height so the pill is a real thumb target, a 3px focus ring on
  // focus-visible, and a border-weight change on hover so the state does not
  // rest on colour alone.
  const shape =
    "inline-flex min-h-11 items-center rounded-full px-4 text-caption font-semibold transition-colors duration-150";
  const focus =
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700";

  // The current category is not a link to itself. Rendering it as one would
  // give a keyboard or screen-reader user a tab stop that goes nowhere, and
  // aria-current alone does not stop it being announced as a link.
  return current ? (
    <span
      aria-current="page"
      aria-label={described}
      className={`${shape} bg-forest-900 text-sand-50`}
    >
      {body}
    </span>
  ) : (
    <Link
      href={href}
      aria-label={described}
      className={`${shape} ${focus} border border-sand-200 bg-sand-50 text-forest-800 hover:border-forest-700 hover:bg-forest-50 hover:underline active:scale-[0.98]`}
    >
      {body}
    </Link>
  );
}
