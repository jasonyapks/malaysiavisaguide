/**
 * The stored shape of an insight article's body — the contract between the
 * Worker that saves it and the site build that renders it.
 *
 * Pure TypeScript on purpose. No React, no `@cloudflare/workers-types`, no
 * imports from either side. Both projects compile this directory, so anything
 * that only one of them can resolve would break the other's typecheck.
 *
 * ## Why inline formatting is an AST and never a string of HTML
 *
 * The obvious design is `paragraph: { html: string }` and it is wrong twice
 * over. It puts the dashboard one paste away from injecting a `<script>` into
 * every reader's page — the Worker cannot sanitise its way out of that
 * reliably, and `dangerouslySetInnerHTML` would be the only way to render it.
 * And it lets the author choose the markup, so the design system becomes a
 * suggestion: the first `<span style="color:red">` is the end of it.
 *
 * A typed union removes both. The renderer maps node kind → element and
 * supplies every class itself, so an author can express emphasis and cannot
 * express a colour, and there is no code path where stored text reaches the DOM
 * as markup. XSS stops being a thing to remember and becomes structurally
 * impossible.
 *
 * The cost is that new formatting needs a new node kind here plus a case in the
 * renderer. That is the intended friction.
 */

/**
 * Programme identifiers a `fig` node may point at.
 *
 * Duplicated from `ProgrammeSlug` in src/lib/data/programmes.ts rather than
 * imported, because that file is site code and shared/ must not depend on it.
 * The duplication is checked at compile time — see the `satisfies` assertion at
 * the top of src/lib/figures.ts, which fails the build if the two ever diverge.
 */
export const PROGRAMME_IDS = [
  "pvip",
  "mm2h-silver",
  "mm2h-gold",
  "mm2h-platinum",
  "smm2h",
  "de-rantau",
  "student-pass",
  "employment-pass",
] as const;

export type ProgrammeId = (typeof PROGRAMME_IDS)[number];

/** Article categories. Mirrors `InsightCategory`; checked the same way. */
export const INSIGHT_CATEGORIES = [
  "comparisons",
  "by-nationality",
  "expat-living",
  "perspective",
] as const;

export type InsightCategoryId = (typeof INSIGHT_CATEGORIES)[number];

/**
 * A live figure reference.
 *
 * The whole reason the CMS exists in this shape. An author who can type
 * "RM40,000" recreates the July 2026 PVIP staleness at scale — that cost was
 * expensive precisely because one number was hardcoded in four places. So a
 * figure is never stored as text: it is stored as *which* number, and resolved
 * from programmes.ts at every build.
 *
 * `field` and `fmt` are closed allowlists (shared/figures.ts). An unknown value
 * for either is a validation failure at save time and a build failure after
 * that — never an empty span on a live page.
 */
export interface FigureRef {
  programme: ProgrammeId;
  field: string;
  fmt: string;
}

/**
 * Inline content. A tree, because emphasis nests inside a link and vice versa.
 *
 * - `text`   the leaf; the only node that carries characters
 * - `strong` semantic emphasis, rendered `<strong>`
 * - `em`     rendered `<em>`
 * - `link`   internal or external; the renderer decides `<Link>` vs `<a>` and
 *            attaches rel/target itself, so an author cannot ship an unmarked
 *            outbound link
 * - `fig`    a live figure, resolved at build (see FigureRef)
 * - `note`   an inline aside — the attribution or caveat that has to travel
 *            next to a figure ("MYPVIP practice, as at 28 July 2026"). Typed
 *            rather than left to `em` so it can be styled as a caveat site-wide
 *            and, later, found by a linter that checks every attributed figure
 *            carries one.
 */
export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "link"; href: string; c: Inline[] }
  | { t: "fig"; programme: ProgrammeId; field: string; fmt: string }
  | { t: "note"; c: Inline[] };

/** A table cell: inline content plus an optional 1-based footnote reference. */
export interface TableCell {
  value: Inline[];
  /** 1-based index into the table's `notes`. */
  note?: number;
}

/**
 * The block union.
 *
 * Chosen against what the two hand-written articles actually contain, not
 * against what a block editor usually offers. Two deliberate absences:
 *
 * **No `html` or `embed` block.** The moment one exists the design system is
 * optional, and every argument for adding it is an argument for a page that
 * looks like it was made somewhere else.
 *
 * **No `faq` block.** The FAQ is a top-level field on the document, not a
 * movable block — see shared/insight.ts.
 */
export type Block =
  /** Body headings. h1 is the article title and is not authorable. */
  | { t: "heading"; level: 2 | 3; c: Inline[] }
  | { t: "paragraph"; c: Inline[] }
  /** The one sentence the reader is meant to nod at. At most one per article. */
  | { t: "pullquote"; c: Inline[] }
  | { t: "list"; ordered?: boolean; items: Inline[][] }
  /**
   * A comparison table. `notes` carries the long conditions that must not sit
   * inside a cell — the rule DataTable exists to enforce.
   */
  | {
      t: "table";
      caption?: string;
      /** Column headers. The first is the row-label column, usually blank. */
      head: string[];
      rows: { label: Inline[]; cells: TableCell[] }[];
      /**
       * Inline trees, not strings. A footnote carries the long condition that
       * must not sit inside a cell, and those conditions are where the live
       * figures are — "up to 50% of RM1,000,000 may be withdrawn after six
       * months". Plain strings would make the author retype the number.
       */
      notes?: Inline[][];
    }
  /** An image from the asset library (D1 `assets`, bytes in R2). */
  | { t: "figure"; assetId: string; caption?: string; aspect?: string }
  | { t: "callout"; tone: "info" | "warning"; title?: string; body: Inline[][] }
  /** Renders <SupersededNotice> for a programme. Nothing if its source is current. */
  | { t: "programmeNotice"; programme: ProgrammeId }
  /** Renders <KeyFacts> for a programme — every row read from programmes.ts. */
  | { t: "keyFacts"; programme: ProgrammeId }
  /** Renders <TierTable> across several programmes. */
  | {
      t: "tierTable";
      programmes: ProgrammeId[];
      caption?: string;
      variant?: "long-stay" | "work-study";
    }
  /** The navy box. Never a full stop — it asks the next question. */
  | { t: "cta"; c: Inline[] };

export type BlockType = Block["t"];

/** Every block kind, for the editor's palette and for validation messages. */
export const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "pullquote",
  "list",
  "table",
  "figure",
  "callout",
  "programmeNotice",
  "keyFacts",
  "tierTable",
  "cta",
] as const satisfies readonly BlockType[];
