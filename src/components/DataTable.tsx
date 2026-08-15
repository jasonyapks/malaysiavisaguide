import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";

/**
 * The one table on this site.
 *
 * There used to be two implementations — `TierTable` for programme comparisons
 * and a private `DataTable` inside `InsightLayout` for article tables — which
 * meant the sticky columns and footnotes built for the comparison page were
 * invisible to every article. This is that behaviour in one place; `TierTable`
 * now maps programmes onto it, and articles use it directly.
 *
 * Three things make a comparison scannable rather than merely correct, and this
 * does all three:
 *
 *  1. **A cell holds a value, never a sentence.** Long conditions go to
 *     `notes` and are referenced by a superscript. One sentence in one cell
 *     used to make its row five times the height of its neighbours.
 *  2. **The row-label column is pinned.** Scrolling sideways is fine; losing
 *     track of which row you are reading is not.
 *  3. **The header row is pinned**, for the same reason in the other axis.
 *
 * A wide table is the one thing here allowed to scroll horizontally, and only
 * inside its own container — the page body never does.
 *
 * It stays a real `<table>` at every width rather than becoming stacked cards on
 * mobile. Cards would mean either rendering every figure twice in the HTML —
 * doubling the text a crawler sees on the site's most cited pages — or setting
 * `display: block`, which drops the table role in every major browser. A pinned
 * label column and short cells solve the same problem without paying either.
 */

export type Cell = {
  value: ReactNode;
  /** 1-based index into `notes`, rendered as a superscript reference. */
  note?: number;
};

export function DataTable({
  caption,
  /** Column headers. The first is the row-label column and is usually blank. */
  head,
  rows,
  /** Footnote text in reference order. Numbering is the array index + 1. */
  notes = [],
  /** Prefix for footnote anchor ids — must be unique per table on a page. */
  idPrefix = "note",
  locale = "en",
}: {
  caption?: string;
  head: string[];
  /** `label` renders in the pinned row-header column. Wrap it in <strong> to
   *  emphasise it — a comparison of programmes wants the name prominent, a
   *  comparison of attributes wants the label quiet. */
  rows: { label: ReactNode; cells: Cell[] }[];
  /**
   * Footnotes in reference order. Numbering is the array index + 1.
   *
   * ReactNode rather than string, because a footnote is where the long
   * conditions go and those conditions are full of live figures — every note
   * under the tables in the two /insights/ articles interpolates something from
   * programmes.ts. Restricting it to strings would force a CMS author to retype
   * the number, which is the one thing this whole design exists to prevent.
   * Every existing caller passes strings and renders identically.
   */
  notes?: ReactNode[];
  idPrefix?: string;
  /** Defaults to English; the comparison page and the calculator are not
   *  translated yet and pass nothing. */
  locale?: Locale;
}) {
  const t = getUi(locale).guide.tiers;
  return (
    <figure className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
        <table className="w-full border-collapse text-body-sm">
          {caption && (
            <caption className="px-4 pt-5 text-left font-serif text-lead font-semibold text-forest-900 sm:px-6">
              {caption}
            </caption>
          )}
          <thead>
            <tr className="border-b border-sand-200">
              {head.map((h, i) => (
                <th
                  key={h || `col-${i}`}
                  scope="col"
                  className={
                    i === 0
                      ? // Pinned in both axes. The opaque background is
                        // load-bearing: a transparent sticky cell lets the
                        // scrolled content show through underneath it.
                        "sticky left-0 top-0 z-20 min-w-[7.5rem] bg-white px-4 py-3 text-left font-medium text-ink-muted sm:px-6"
                      : "sticky top-0 z-10 min-w-[9rem] bg-white px-4 py-3 text-left font-serif text-body-sm font-semibold text-forest-900 sm:px-6 sm:text-lead"
                  }
                >
                  {h || <span className="sr-only">{t.attributeColumn}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-sand-200 last:border-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-normal text-ink-muted sm:px-6 [&_strong]:font-semibold [&_strong]:text-forest-900"
                >
                  {r.label}
                </th>
                {r.cells.map((c, ci) => (
                  <td key={ci} className="px-4 py-3 font-medium sm:px-6">
                    {c.value}
                    {c.note && (
                      <sup className="ml-0.5 font-normal text-forest-700">
                        <a href={`#${idPrefix}-${c.note}`}>
                          <span className="sr-only">{t.seeNote}</span>
                          {c.note}
                        </a>
                      </sup>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notes.length > 0 && (
        <figcaption>
          <ol className="space-y-1 text-caption leading-relaxed text-ink-muted">
            {notes.map((n, i) => (
              <li
                // The note's own text where it is text — `noteCollector` already
                // deduplicates by it, so it is stable across a reorder in a way
                // the index is not. An inline tree has no such handle and falls
                // back to the index, which is fine: those come from a stored
                // document that is replaced wholesale, never spliced.
                key={typeof n === "string" ? n : i}
                id={`${idPrefix}-${i + 1}`}
                className="scroll-mt-24"
              >
                <span className="font-semibold text-forest-700">{i + 1}.</span>{" "}
                {n}
              </li>
            ))}
          </ol>
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Collects footnotes in first-reference order, deduplicating by text.
 *
 * The three MM2H tiers share one minimum-stay condition; printing it three
 * times would defeat the point of moving it out of the cells.
 */
export function noteCollector() {
  const notes: string[] = [];
  return {
    notes,
    /** Returns the 1-based footnote number for `text`, or undefined if null. */
    ref(text: string | null | undefined): number | undefined {
      if (!text) return undefined;
      const at = notes.indexOf(text);
      return at === -1 ? notes.push(text) : at + 1;
    },
  };
}
