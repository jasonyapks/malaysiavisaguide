import {
  BLOCK_TYPES,
  INSIGHT_CATEGORIES,
  PROGRAMME_IDS,
  type Block,
  type Inline,
} from "./blocks";
import {
  FIGURE_FIELD_IDS,
  FORMATS_FOR_KIND,
  figureFieldKind,
} from "./figures";
import type { InsightDoc } from "./insight";

/**
 * One validator, run twice: by the Worker before a document is stored, and by
 * the site build before a document is rendered.
 *
 * Running it on save is the point. A malformed document has to fail where
 * somebody can fix it — in the editor, against the thing they just typed — and
 * never on a live publish, where the only symptom is a red build ten minutes
 * later and a dashboard that says "failure" with no idea which article did it.
 *
 * Running it again at build is the belt to that braces. Rows can be written by
 * a migration, by a script, or by a Worker deployed before this file changed;
 * the build is the last moment anything can be checked, and it is the moment
 * before a reader sees it.
 *
 * It returns a list of messages rather than throwing, because the editor wants
 * to show all of them at once and the build wants to name the article first.
 * Empty list means valid.
 *
 * This generalises `isArticleBody()` in worker/src/index.ts, which does the same
 * job for the news pipeline's much simpler body shape.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Slugs and categories both appear in a URL path segment. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Errors = string[];

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): v is string {
  return typeof v === "string";
}

/**
 * Validate one inline tree.
 *
 * `where` is a breadcrumb like `blocks[3].c` so a message points at a place in
 * the document rather than at "an inline node".
 */
function checkInline(node: unknown, where: string, errs: Errors): void {
  if (!isObj(node)) {
    errs.push(`${where}: expected an inline node, got ${typeof node}`);
    return;
  }
  const t = node.t;
  switch (t) {
    case "text":
      if (!str(node.v)) errs.push(`${where}: text node needs a string \`v\``);
      return;
    case "strong":
    case "em":
    case "note":
      checkInlineArray(node.c, `${where}.c`, errs);
      return;
    case "link": {
      if (!str(node.href) || node.href.length === 0) {
        errs.push(`${where}: link needs a non-empty \`href\``);
      } else if (!/^(https?:\/\/|\/|#|mailto:)/.test(node.href)) {
        // A relative href without a leading slash resolves against whatever
        // directory the article happens to sit in, so it breaks the day the
        // article is recategorised — and nothing about the page looks wrong
        // until someone clicks it.
        errs.push(
          `${where}: link href must be absolute (https://…), site-root (/…), an anchor (#…) or mailto:, got "${node.href}"`,
        );
      }
      checkInlineArray(node.c, `${where}.c`, errs);
      return;
    }
    case "fig": {
      if (!PROGRAMME_IDS.includes(node.programme as never)) {
        errs.push(
          `${where}: unknown programme "${String(node.programme)}" — expected one of ${PROGRAMME_IDS.join(", ")}`,
        );
      }
      if (!str(node.field) || !FIGURE_FIELD_IDS.includes(node.field)) {
        errs.push(
          `${where}: unknown figure field "${String(node.field)}" — see FIGURE_FIELDS in shared/figures.ts`,
        );
        return;
      }
      const kind = figureFieldKind(node.field);
      if (kind && !FORMATS_FOR_KIND[kind].includes(node.fmt as never)) {
        errs.push(
          `${where}: field "${node.field}" cannot be formatted as "${String(node.fmt)}" — allowed: ${FORMATS_FOR_KIND[kind].join(", ")}`,
        );
      }
      return;
    }
    default:
      errs.push(`${where}: unknown inline node type "${String(t)}"`);
  }
}

function checkInlineArray(v: unknown, where: string, errs: Errors): void {
  if (!Array.isArray(v)) {
    errs.push(`${where}: expected an array of inline nodes`);
    return;
  }
  v.forEach((n, i) => checkInline(n, `${where}[${i}]`, errs));
}

function checkProgramme(v: unknown, where: string, errs: Errors): void {
  if (!PROGRAMME_IDS.includes(v as never)) {
    errs.push(`${where}: unknown programme "${String(v)}"`);
  }
}

function checkBlock(block: unknown, where: string, errs: Errors): void {
  if (!isObj(block)) {
    errs.push(`${where}: expected a block object`);
    return;
  }
  const t = block.t;
  if (!str(t) || !BLOCK_TYPES.includes(t as never)) {
    errs.push(
      `${where}: unknown block type "${String(t)}" — allowed: ${BLOCK_TYPES.join(", ")}`,
    );
    return;
  }

  switch (t as Block["t"]) {
    case "heading":
      if (block.level !== 2 && block.level !== 3) {
        errs.push(`${where}: heading level must be 2 or 3 (h1 is the title)`);
      }
      checkInlineArray(block.c, `${where}.c`, errs);
      return;
    case "paragraph":
    case "pullquote":
    case "cta":
      checkInlineArray(block.c, `${where}.c`, errs);
      return;
    case "list": {
      if (block.ordered !== undefined && typeof block.ordered !== "boolean") {
        errs.push(`${where}.ordered: expected a boolean`);
      }
      if (!Array.isArray(block.items) || block.items.length === 0) {
        errs.push(`${where}.items: a list needs at least one item`);
        return;
      }
      block.items.forEach((item, i) =>
        checkInlineArray(item, `${where}.items[${i}]`, errs),
      );
      return;
    }
    case "table": {
      if (block.caption !== undefined && !str(block.caption)) {
        errs.push(`${where}.caption: expected a string`);
      }
      const head = block.head;
      if (!Array.isArray(head) || head.length < 2 || !head.every(str)) {
        errs.push(
          `${where}.head: expected at least two column headers as strings (the first is the row-label column and is usually "")`,
        );
        return;
      }
      const notes = block.notes;
      if (notes !== undefined && (!Array.isArray(notes) || !notes.every(str))) {
        errs.push(`${where}.notes: expected an array of strings`);
      }
      const noteCount = Array.isArray(notes) ? notes.length : 0;
      if (!Array.isArray(block.rows) || block.rows.length === 0) {
        errs.push(`${where}.rows: a table needs at least one row`);
        return;
      }
      block.rows.forEach((row, ri) => {
        const rw = `${where}.rows[${ri}]`;
        if (!isObj(row)) {
          errs.push(`${rw}: expected a row object`);
          return;
        }
        checkInlineArray(row.label, `${rw}.label`, errs);
        if (!Array.isArray(row.cells)) {
          errs.push(`${rw}.cells: expected an array`);
          return;
        }
        // One cell per column after the row-label column. A short row would
        // render a ragged table and a long one would silently drop a value.
        if (row.cells.length !== head.length - 1) {
          errs.push(
            `${rw}.cells: ${row.cells.length} cells for ${head.length - 1} columns`,
          );
        }
        row.cells.forEach((cell, ci) => {
          const cw = `${rw}.cells[${ci}]`;
          if (!isObj(cell)) {
            errs.push(`${cw}: expected a cell object`);
            return;
          }
          checkInlineArray(cell.value, `${cw}.value`, errs);
          if (cell.note !== undefined) {
            if (
              typeof cell.note !== "number" ||
              !Number.isInteger(cell.note) ||
              cell.note < 1 ||
              cell.note > noteCount
            ) {
              // A footnote marker pointing past the end of the notes renders a
              // superscript linking to an anchor that is not on the page.
              errs.push(
                `${cw}.note: ${String(cell.note)} is not a 1-based index into the table's ${noteCount} note(s)`,
              );
            }
          }
        });
      });
      return;
    }
    case "figure":
      if (!str(block.assetId) || block.assetId.length === 0) {
        errs.push(`${where}.assetId: a figure must reference an asset`);
      }
      if (block.caption !== undefined && !str(block.caption)) {
        errs.push(`${where}.caption: expected a string`);
      }
      return;
    case "callout": {
      if (block.tone !== "info" && block.tone !== "warning") {
        errs.push(`${where}.tone: expected "info" or "warning"`);
      }
      if (block.title !== undefined && !str(block.title)) {
        errs.push(`${where}.title: expected a string`);
      }
      if (!Array.isArray(block.body) || block.body.length === 0) {
        errs.push(`${where}.body: a callout needs at least one paragraph`);
        return;
      }
      block.body.forEach((p, i) =>
        checkInlineArray(p, `${where}.body[${i}]`, errs),
      );
      return;
    }
    case "programmeNotice":
    case "keyFacts":
      checkProgramme(block.programme, `${where}.programme`, errs);
      return;
    case "tierTable": {
      if (!Array.isArray(block.programmes) || block.programmes.length === 0) {
        errs.push(`${where}.programmes: needs at least one programme`);
        return;
      }
      block.programmes.forEach((p, i) =>
        checkProgramme(p, `${where}.programmes[${i}]`, errs),
      );
      if (
        block.variant !== undefined &&
        block.variant !== "long-stay" &&
        block.variant !== "work-study"
      ) {
        errs.push(`${where}.variant: expected "long-stay" or "work-study"`);
      }
      return;
    }
  }
}

/**
 * Validate a whole document.
 *
 * Returns every problem found, each prefixed with where it is. An empty array
 * means the document is renderable — not that it is *good*, which is an
 * editorial judgement no validator makes.
 */
export function validateInsightDoc(doc: unknown): string[] {
  const errs: Errors = [];

  if (!isObj(doc)) return ["expected a document object"];

  if (!str(doc.slug) || !SLUG.test(doc.slug)) {
    errs.push(
      `slug: "${String(doc.slug)}" is not a URL slug (lowercase letters, digits and single hyphens)`,
    );
  }
  if (!INSIGHT_CATEGORIES.includes(doc.category as never)) {
    errs.push(
      `category: "${String(doc.category)}" is not one of ${INSIGHT_CATEGORIES.join(", ")}`,
    );
  }
  if (!str(doc.title) || doc.title.trim() === "") {
    errs.push("title: required");
  }
  if (!str(doc.dek) || doc.dek.trim() === "") {
    // The dek is the meta description as well as the standfirst. An article
    // without one ships a SERP entry Google writes for us.
    errs.push("dek: required — it is also the meta description");
  }
  for (const field of ["published", "reviewed"] as const) {
    if (!str(doc[field]) || !ISO_DATE.test(doc[field] as string)) {
      errs.push(`${field}: expected an ISO date (YYYY-MM-DD)`);
    }
  }
  if (
    typeof doc.readingMinutes !== "number" ||
    !Number.isInteger(doc.readingMinutes) ||
    doc.readingMinutes < 1
  ) {
    errs.push("readingMinutes: expected a positive whole number");
  }
  if (doc.draft !== undefined && typeof doc.draft !== "boolean") {
    errs.push("draft: expected a boolean");
  }

  if (!Array.isArray(doc.relatedGuides) || doc.relatedGuides.length === 0) {
    // The handoff is the article's internal linking. Without it the page is a
    // crawl dead end and the reader is left at a full stop.
    errs.push("relatedGuides: at least one guide to hand the reader on to");
  } else {
    doc.relatedGuides.forEach((g, i) => {
      if (!isObj(g) || !str(g.path) || !str(g.title)) {
        errs.push(`relatedGuides[${i}]: expected { path, title }`);
      } else if (!g.path.startsWith("/") || !g.path.endsWith("/")) {
        errs.push(
          `relatedGuides[${i}].path: "${g.path}" — site routes are written with a leading and trailing slash`,
        );
      }
    });
  }

  if (!Array.isArray(doc.blocks) || doc.blocks.length === 0) {
    errs.push("blocks: an article needs a body");
  } else {
    doc.blocks.forEach((b, i) => checkBlock(b, `blocks[${i}]`, errs));
  }

  if (!Array.isArray(doc.faq)) {
    errs.push("faq: expected an array (empty is allowed)");
  } else {
    doc.faq.forEach((item, i) => {
      if (!isObj(item) || !str(item.q) || !str(item.a)) {
        errs.push(`faq[${i}]: expected { q, a }`);
      }
    });
  }

  if (!Array.isArray(doc.sources) || doc.sources.length === 0) {
    // §4.1: nothing renders a figure without a source. The sources block is
    // the page's whole claim to being citable, and InsightLayout renders it
    // unconditionally — an empty one would print a heading over nothing.
    errs.push("sources: at least one source — every figure must trace to one");
  } else {
    doc.sources.forEach((s, i) => {
      if (!isObj(s) || !str(s.label) || !str(s.url) || !str(s.verified)) {
        errs.push(`sources[${i}]: expected { label, url, verified }`);
        return;
      }
      if (!/^https?:\/\//.test(s.url)) {
        errs.push(`sources[${i}].url: expected an absolute http(s) URL`);
      }
      if (!ISO_DATE.test(s.verified)) {
        errs.push(`sources[${i}].verified: expected an ISO date (YYYY-MM-DD)`);
      }
    });
  }

  return errs;
}

/** Narrowing wrapper for callers that only want a yes/no. */
export function isInsightDoc(doc: unknown): doc is InsightDoc {
  return validateInsightDoc(doc).length === 0;
}

/** Everything an inline tree references, for a figure pre-flight. */
export function collectFigureRefs(
  nodes: Inline[],
): { programme: string; field: string; fmt: string }[] {
  const out: { programme: string; field: string; fmt: string }[] = [];
  const walk = (ns: Inline[]) => {
    for (const n of ns) {
      if (n.t === "fig") {
        out.push({ programme: n.programme, field: n.field, fmt: n.fmt });
      } else if (n.t !== "text") {
        walk(n.c);
      }
    }
  };
  walk(nodes);
  return out;
}
