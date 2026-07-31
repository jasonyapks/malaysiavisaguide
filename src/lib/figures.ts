import {
  FIGURE_FIELDS,
  figureValue,
  formatFigure,
  type FormatFns,
  type ProgrammeLike,
} from "@shared/figures";
import type { InsightCategoryId, ProgrammeId } from "@shared/blocks";
import type { InsightCategory } from "@/lib/data/insights";
import { getProgramme, type Programme, type ProgrammeSlug } from "@/lib/data/programmes";
import { money, moneyPer, reviewDate, years } from "@/lib/format";

/**
 * Resolving a `fig` node against programmes.ts — the mechanism that stops the
 * CMS from reintroducing hardcoded figures.
 *
 * The July 2026 PVIP staleness was expensive because RM40,000 was written into
 * JSX in four places, and correcting it meant finding all four. A CMS that lets
 * Jason type "RM40,000" recreates that at the rate he can write articles. So a
 * figure in a stored document is a *reference*, and this file is where it turns
 * into characters — at build time, from the one file that holds the numbers.
 *
 * **A figure that will not resolve throws and fails the build.** The tempting
 * alternative is to render nothing and carry on, which produces "you must show
 *  of income a month" on a live page, reads as a CSS bug rather than a data bug,
 * and is exactly the silent staleness the site exists to avoid.
 */

// --- The three assertions that keep shared/ and site data in step -----------
//
// shared/ cannot import site code (the Worker compiles it too), so the
// programme ids, the categories and the shape a figure is read from are all
// declared there independently. These lines are what makes that duplication
// safe: rename a ProgrammeSlug, add a category, or retype a field on Programme,
// and the site's typecheck fails here rather than at runtime in a reader's
// browser.

/** Both directions, so neither list can gain or lose a member unnoticed. */
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;

const _programmeIdsMatch: Exact<ProgrammeId, ProgrammeSlug> = true;
const _categoriesMatch: Exact<InsightCategoryId, InsightCategory> = true;
void _programmeIdsMatch;
void _categoriesMatch;

/** A real Programme must satisfy the structural shape shared/figures.ts reads. */
type _ShapeHolds = Programme extends ProgrammeLike ? true : never;
const _shapeHolds: _ShapeHolds = true;
void _shapeHolds;

// ---------------------------------------------------------------------------

/**
 * The formatting functions, in one object, passed into shared/.
 *
 * shared/figures.ts is import-free by design, so it takes these rather than
 * reaching for them. The point of routing through format.ts at all is that
 * there stays exactly one place that decides an amount is written `RM1,000,000`
 * and not `MYR 1,000,000`.
 */
const FNS: FormatFns = { money, moneyPer, years, reviewDate };

export interface FigureRefLike {
  programme: string;
  field: string;
  fmt: string;
}

/**
 * Resolve one figure, or throw.
 *
 * `where` is the caller's breadcrumb — the article slug and the block index —
 * and it is the whole value of the error. "Unknown figure field" tells you
 * nothing; "in insight "mm2h-vs-pvip" block 12" tells you which paragraph to
 * open.
 */
export function resolveFigure(ref: FigureRefLike, where: string): string {
  const programme = getProgramme(ref.programme as ProgrammeSlug);
  if (!programme) {
    throw new Error(
      fail(
        where,
        `no programme "${ref.programme}" in src/lib/data/programmes.ts`,
      ),
    );
  }

  const known = FIGURE_FIELDS.some((f) => f.id === ref.field);
  if (!known) {
    throw new Error(
      fail(
        where,
        `"${ref.field}" is not an allowed figure field. Allowed: ${FIGURE_FIELDS.map((f) => f.id).join(", ")}`,
      ),
    );
  }

  const value = figureValue(programme, ref.field);
  if (!value) {
    throw new Error(
      fail(
        where,
        `${programme.name} has no value for "${ref.field}" — it is null in programmes.ts. ` +
          `That is a legitimate state of the data (MM2H has no income requirement) and a fatal ` +
          `state of the article: the sentence would render with a hole in it. Rewrite the ` +
          `sentence, or point the figure at a programme that has that field.`,
      ),
    );
  }

  const text = formatFigure(value, ref.fmt, FNS);
  if (text === null) {
    throw new Error(
      fail(
        where,
        `"${ref.field}" cannot be written as "${ref.fmt}" — it is a ${value.kind} value.`,
      ),
    );
  }

  return text;
}

function fail(where: string, detail: string): string {
  return (
    `[insights] unresolvable figure in ${where}: ${detail}\n\n` +
    `The build is stopping on purpose. A figure that cannot be resolved would ` +
    `render as an empty span — a published sentence with a number missing from ` +
    `the middle of it, which reads as a styling glitch and hides a data error. ` +
    `Fix the block in the dashboard and publish again.`
  );
}
