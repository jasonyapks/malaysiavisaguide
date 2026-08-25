import type {
  Block,
  Inline,
  ProgrammeId,
  TableCell,
} from "./blocks";
import {
  cellIn,
  cellOut,
  parseInline,
  splitCells,
  writeInline,
} from "./inline";

/**
 * `Block[]` ⇄ markdown. The file format the CMS migration moves onto.
 *
 * Hand-rolled against the closed 11-type union in `shared/blocks.ts`, with no
 * markdown library. The grammar is small and fixed, the site has three runtime
 * dependencies and this adds none, and a general-purpose parser would accept a
 * great deal this format must keep rejecting — an author who can write raw HTML
 * has made the design system optional again, which is the argument the header
 * of `blocks.ts` makes at length.
 *
 * ## The one hard requirement
 *
 * `parseBody(writeBody(blocks))` must deep-equal `blocks`, for every document
 * that exists. That test is the correctness proof for the whole migration:
 * markdown is only a safe home for this content if nothing is lost on the way
 * in. `scripts/migrate-cms-to-files.mjs` refuses to write anything if a single
 * document fails it.
 *
 * Two consequences show up all over the emitter. Optional keys (`ordered`,
 * `caption`, `title`, `aspect`, `variant`, `note`) are written **only when
 * present**, because an emitter that normalises an absent key into `false` or
 * `""` produces a document that no longer deep-equals its source. And inline
 * content is written by `writeInline`, which verifies its own escaping by
 * parsing it back — see `shared/inline.ts`.
 *
 * ## The parser is total
 *
 * A half-typed shortcode stays literal text rather than throwing, matching the
 * promise `parseInline` already makes. Someone is typing into this field; it
 * must not explode mid-word, and a build that fails on a stray `{%` would be a
 * worse failure than a paragraph that reads oddly. What catches genuinely
 * malformed content is `shared/validate.ts`, unchanged, which runs after this
 * and names what is wrong.
 *
 * ## Grammar
 *
 * Blocks are separated by blank lines.
 *
 *     ## Heading            → heading, level 2 (### is level 3)
 *     Ordinary prose.       → paragraph
 *     > One sentence.       → pullquote
 *     - item                → list
 *     1. item               → list, ordered
 *     | a | b |             → table (GFM pipe table)
 *     [^1]: condition       → a footnote for the table above it
 *
 *     {% figure asset="…" caption="…" aspect="16/9" %}
 *     {% keyFacts programme="pvip" %}
 *     {% programmeNotice programme="mm2h" %}
 *     {% tierTable programmes="mm2h-silver,pvip" variant="long-stay" %}
 *     {% table caption="…" %}      ← precedes a pipe table that has a caption
 *
 *     {% callout tone="warning" title="…" %}
 *     Body paragraph.
 *     {% endcallout %}
 *
 *     {% cta %}
 *     The question the reader leaves with.
 *     {% endcta %}
 *
 * `{% … %}` is the shape Sveltia's own editor-component documentation uses, and
 * it does not collide with the `{{programme:field:fmt}}` figure token that
 * `parseInline` owns.
 */

/**
 * Line starts that mean "not a paragraph".
 *
 * Kept as one regex because the emitter and the parser must agree exactly: the
 * emitter prefixes a paragraph with a backslash iff this matches, and the
 * parser strips a leading backslash iff this matches the remainder. Deliberately
 * does NOT include a backslash itself, which is what makes a paragraph whose
 * text really does begin with one round-trip — see the tests in
 * `scripts/check-content.mjs`.
 */
const BLOCK_MARKER = /^(#{2,3}\s|>|[-*+]\s|\d+\.\s|\||\{%|\[\^\d+\]:)/;

/** A whole line that is a shortcode: `{% name attr="v" %}`. */
const SHORTCODE = /^\{%\s*([A-Za-z][A-Za-z0-9]*)\s*(.*?)\s*%\}$/;

/** A GFM header separator: `| --- | --- |`, with or without alignment colons. */
const SEPARATOR = /^\|?[\s:|-]*-[\s:|-]*\|?$/;

/** A footnote definition beneath a table: `[^1]: the long condition`. */
const FOOTNOTE = /^\[\^(\d+)\]:\s*(.*)$/;

/** A trailing footnote reference inside a table cell: `RM1,000,000 [^2]`. */
const CELL_NOTE = /\s*\[\^(\d+)\]$/;

// --- Shortcode attributes ---------------------------------------------------

function attr(name: string, value: string): string {
  return ` ${name}="${value.replace(/([\\"])/g, "\\$1")}"`;
}

function attrs(pairs: [string, string | undefined][]): string {
  return pairs
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => attr(k, v as string))
    .join("");
}

/**
 * Read `name="value"` pairs out of a shortcode's attribute text.
 *
 * Order-independent on purpose: the emitter has a fixed order, but a human
 * editing the file by hand has no reason to preserve it, and a format that
 * silently drops an attribute because it moved would be a trap.
 */
function readAttrs(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([A-Za-z][A-Za-z0-9]*)\s*=\s*"((?:\\.|[^"\\])*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out[m[1]] = m[2].replace(/\\(.)/g, "$1");
  }
  return out;
}

// --- Plain-text table headers ----------------------------------------------

/**
 * `head` is `string[]`, not `Inline[][]` — column headers are labels, not
 * prose, and `blocks.ts` types them that way. So they need their own escaping
 * rather than `cellOut`'s: only the cell separator and the escape character
 * itself can hurt.
 */
function plainOut(s: string): string {
  return s.replace(/([\\|])/g, "\\$1");
}

function plainIn(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i) === "\\" && i + 1 < s.length) {
      out += s.charAt(i + 1);
      i += 1;
    } else {
      out += s.charAt(i);
    }
  }
  return out;
}

// --- Writing ----------------------------------------------------------------

/** One paragraph of inline content, escaped so it cannot open another block. */
function paragraphOut(nodes: Inline[]): string {
  const line = writeInline(nodes);
  return BLOCK_MARKER.test(line) ? "\\" + line : line;
}

function rowOut(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

function tableOut(block: Extract<Block, { t: "table" }>): string {
  const lines: string[] = [];
  if (block.caption !== undefined) {
    lines.push(`{% table${attr("caption", block.caption)} %}`);
  }
  lines.push(rowOut(block.head.map(plainOut)));
  lines.push(rowOut(block.head.map(() => "---")));
  for (const row of block.rows) {
    const cells = [cellOut(row.label)];
    for (const cell of row.cells) {
      const text = cellOut(cell.value);
      cells.push(cell.note !== undefined ? `${text} [^${cell.note}]` : text);
    }
    lines.push(rowOut(cells));
  }
  (block.notes ?? []).forEach((note, i) => {
    lines.push(`[^${i + 1}]: ${writeInline(note)}`);
  });
  return lines.join("\n");
}

/** `Block[]` → markdown. Blocks separated by a blank line. */
export function writeBody(blocks: Block[]): string {
  const chunks: string[] = [];

  for (const b of blocks) {
    switch (b.t) {
      case "heading":
        chunks.push(`${"#".repeat(b.level)} ${writeInline(b.c)}`);
        break;
      case "paragraph":
        chunks.push(paragraphOut(b.c));
        break;
      case "pullquote":
        chunks.push(`> ${writeInline(b.c)}`);
        break;
      case "list":
        chunks.push(
          b.items
            .map(
              (item, i) =>
                `${b.ordered ? `${i + 1}.` : "-"} ${writeInline(item)}`,
            )
            .join("\n"),
        );
        break;
      case "table":
        chunks.push(tableOut(b));
        break;
      case "figure":
        chunks.push(
          `{% figure${attrs([
            ["asset", b.assetId],
            ["caption", b.caption],
            ["aspect", b.aspect],
          ])} %}`,
        );
        break;
      case "callout":
        chunks.push(
          [
            `{% callout${attrs([
              ["tone", b.tone],
              ["title", b.title],
            ])} %}`,
            b.body.map(paragraphOut).join("\n\n"),
            `{% endcallout %}`,
          ].join("\n"),
        );
        break;
      case "programmeNotice":
        chunks.push(`{% programmeNotice${attr("programme", b.programme)} %}`);
        break;
      case "keyFacts":
        chunks.push(`{% keyFacts${attr("programme", b.programme)} %}`);
        break;
      case "tierTable":
        chunks.push(
          `{% tierTable${attrs([
            ["programmes", b.programmes.join(",")],
            ["caption", b.caption],
            ["variant", b.variant],
          ])} %}`,
        );
        break;
      case "cta":
        chunks.push(
          [`{% cta %}`, paragraphOut(b.c), `{% endcta %}`].join("\n"),
        );
        break;
    }
  }

  return chunks.join("\n\n");
}

// --- Reading ----------------------------------------------------------------

/** Strip the outer pipes a row is written with, then split on unescaped ones. */
function rowCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  return splitCells(s);
}

function paragraphIn(line: string): Inline[] {
  const body =
    line.startsWith("\\") && BLOCK_MARKER.test(line.slice(1))
      ? line.slice(1)
      : line;
  return parseInline(body);
}

/** Markdown → `Block[]`. Never throws; anything unrecognised stays prose. */
export function parseBody(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: Block[] = [];
  let i = 0;

  /** Consume a pipe table starting at `i`, with `caption` already read. */
  const takeTable = (caption?: string): void => {
    const head = rowCells(lines[i]).map(plainIn);
    i += 1;
    if (i < lines.length && SEPARATOR.test(lines[i].trim())) i += 1;

    const rows: { label: Inline[]; cells: TableCell[] }[] = [];
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      const parts = rowCells(lines[i]);
      const label = cellIn(parts[0] ?? "");
      const cells: TableCell[] = parts.slice(1).map((raw) => {
        const m = raw.match(CELL_NOTE);
        const text = m ? raw.slice(0, raw.length - m[0].length) : raw;
        const cell: TableCell = { value: cellIn(text) };
        if (m) cell.note = Number(m[1]);
        return cell;
      });
      rows.push({ label, cells });
      i += 1;
    }

    const notes: Inline[][] = [];
    while (i < lines.length) {
      const m = lines[i].trim().match(FOOTNOTE);
      if (!m) break;
      notes[Number(m[1]) - 1] = parseInline(m[2]);
      i += 1;
    }

    const block: Extract<Block, { t: "table" }> = { t: "table", head, rows };
    if (caption !== undefined) block.caption = caption;
    if (notes.length > 0) block.notes = notes;
    out.push(block);
  };

  /** Collect lines up to `{% end<name> %}`, or to EOF if it never comes. */
  const takeUntilEnd = (name: string): string[] => {
    const body: string[] = [];
    while (i < lines.length) {
      const m = lines[i].trim().match(SHORTCODE);
      if (m && m[1] === `end${name}`) {
        i += 1;
        return body;
      }
      body.push(lines[i]);
      i += 1;
    }
    return body;
  };

  /** Blank-line-separated paragraphs, for a callout body. */
  const paragraphsOf = (body: string[]): Inline[][] =>
    body
      .join("\n")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p !== "")
      .map(paragraphIn);

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") {
      i += 1;
      continue;
    }

    const sc = line.match(SHORTCODE);
    if (sc) {
      const name = sc[1];
      const a = readAttrs(sc[2]);
      const start = i;
      i += 1;

      if (name === "table") {
        // A caption opener is only a caption opener if a table follows it.
        if (i < lines.length && lines[i].trim().startsWith("|")) {
          takeTable(a.caption ?? "");
          continue;
        }
        i = start;
      } else if (name === "figure") {
        const block: Extract<Block, { t: "figure" }> = {
          t: "figure",
          assetId: a.asset ?? "",
        };
        if (a.caption !== undefined) block.caption = a.caption;
        if (a.aspect !== undefined) block.aspect = a.aspect;
        out.push(block);
        continue;
      } else if (name === "keyFacts") {
        out.push({ t: "keyFacts", programme: a.programme as ProgrammeId });
        continue;
      } else if (name === "programmeNotice") {
        out.push({
          t: "programmeNotice",
          programme: a.programme as ProgrammeId,
        });
        continue;
      } else if (name === "tierTable") {
        const block: Extract<Block, { t: "tierTable" }> = {
          t: "tierTable",
          programmes: (a.programmes ?? "")
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean) as ProgrammeId[],
        };
        if (a.caption !== undefined) block.caption = a.caption;
        if (a.variant !== undefined)
          block.variant = a.variant as "long-stay" | "work-study";
        out.push(block);
        continue;
      } else if (name === "callout") {
        const block: Extract<Block, { t: "callout" }> = {
          t: "callout",
          tone: (a.tone === "warning" ? "warning" : "info") as
            | "info"
            | "warning",
          body: paragraphsOf(takeUntilEnd("callout")),
        };
        if (a.title !== undefined) block.title = a.title;
        out.push(block);
        continue;
      } else if (name === "cta") {
        const body = paragraphsOf(takeUntilEnd("cta"));
        out.push({ t: "cta", c: body[0] ?? [] });
        continue;
      } else {
        // Unknown shortcode. Total parser: it stays prose.
        i = start;
      }
    }

    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      out.push({
        t: "heading",
        level: heading[1].length as 2 | 3,
        c: parseInline(heading[2]),
      });
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      out.push({ t: "pullquote", c: parseInline(line.replace(/^>\s?/, "")) });
      i += 1;
      continue;
    }

    if (/^[-*+]\s/.test(line) || /^\d+\.\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const items: Inline[][] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const m = ordered
          ? l.match(/^\d+\.\s+(.*)$/)
          : l.match(/^[-*+]\s+(.*)$/);
        if (!m) break;
        items.push(parseInline(m[1]));
        i += 1;
      }
      const block: Extract<Block, { t: "list" }> = { t: "list", items };
      if (ordered) block.ordered = true;
      out.push(block);
      continue;
    }

    if (line.startsWith("|")) {
      takeTable();
      continue;
    }

    out.push({ t: "paragraph", c: paragraphIn(line) });
    i += 1;
  }

  return out;
}
