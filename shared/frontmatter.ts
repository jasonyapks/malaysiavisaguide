/**
 * The YAML frontmatter half of a content file.
 *
 * A deliberately small subset of YAML, hand-rolled, matching the pattern the
 * rest of shared/ follows: no runtime dependency, and a grammar narrow enough
 * that what it accepts is the same as what it can write back unchanged.
 *
 * ## Why fields and not blocks
 *
 * Everything here is structured data rather than prose — `faq` emits FAQPage
 * JSON-LD from the same array it renders, and `sources` backs the sentence
 * `InsightLayout` prints about every figure tracing to an official document.
 * `shared/insight.ts` makes that argument in full. Frontmatter is simply where
 * those fields live once the document is a file.
 *
 * ## The subset
 *
 *     title: "a string"          quoted, with \\ \" \n \t escapes
 *     readingMinutes: 9          a bare number
 *     draft: false               a bare boolean
 *     sources: []                an empty list
 *     sources:                   a list of flat mappings, block style
 *       - label: "…"
 *         url: "…"
 *
 * Flow style (`- { label: "…", url: "…" }`) is accepted on the way in but never
 * written. Block style is what Sveltia emits, and a format that reads one thing
 * and writes another produces a spurious diff on the first save of every file.
 *
 * Nesting stops at one level: a list of flat mappings. Nothing in `InsightDoc`
 * or the news envelope goes deeper, and a parser that accepted more would be
 * accepting documents the renderer cannot draw.
 *
 * `slug` and `category` are deliberately absent from every file this writes —
 * the slug is the filename and the category is the folder, so an address cannot
 * disagree with itself.
 */

export type Scalar = string | number | boolean;
export type Mapping = Record<string, Scalar>;
export type Frontmatter = Record<string, Scalar | Scalar[] | Mapping[]>;

// --- Writing ----------------------------------------------------------------

function quote(s: string): string {
  return `"${s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")}"`;
}

function scalarOut(v: Scalar): string {
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "0";
  if (typeof v === "boolean") return v ? "true" : "false";
  return quote(v);
}

/**
 * Render frontmatter. Key order is the caller's, and it is preserved — the
 * order is the reading order of the file and there is no reason to sort it.
 */
export function writeFrontmatter(data: Frontmatter): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }
      lines.push(`${key}:`);
      for (const item of value) {
        // A list of scalars (news `keyPoints`) or of flat mappings (`sources`).
        if (item === null || typeof item !== "object") {
          lines.push(`  - ${scalarOut(item as Scalar)}`);
          continue;
        }
        const entries = Object.entries(item).filter(([, v]) => v !== undefined);
        if (entries.length === 0) {
          lines.push(`  - {}`);
          continue;
        }
        entries.forEach(([k, v], i) => {
          lines.push(`${i === 0 ? "  - " : "    "}${k}: ${scalarOut(v)}`);
        });
      }
      continue;
    }

    lines.push(`${key}: ${scalarOut(value)}`);
  }

  return lines.join("\n");
}

/** A whole content file: frontmatter, then the markdown body. */
export function writeContentFile(data: Frontmatter, body: string): string {
  return `---\n${writeFrontmatter(data)}\n---\n\n${body.trim()}\n`;
}

// --- Reading ----------------------------------------------------------------

/**
 * Read one scalar.
 *
 * A bare `true`/`false` and a bare number are coerced, because that is what
 * every YAML reader does and a file edited by hand will contain them. Anything
 * else bare stays a string — including a bare ISO date, which real YAML would
 * hand back as a Date object. Dates are written quoted here for exactly that
 * reason; the coercion rule is what makes reading an unquoted one safe anyway.
 */
function scalarIn(raw: string): Scalar {
  const s = raw.trim();
  if (s.startsWith('"')) return unquote(s);
  if (s.startsWith("'")) return s.slice(1, s.endsWith("'") ? -1 : undefined);
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function unquote(s: string): string {
  let out = "";
  for (let i = 1; i < s.length; i++) {
    const c = s.charAt(i);
    if (c === "\\" && i + 1 < s.length) {
      const n = s.charAt(i + 1);
      out += n === "n" ? "\n" : n === "t" ? "\t" : n;
      i += 1;
      continue;
    }
    if (c === '"') break;
    out += c;
  }
  return out;
}

/** Split `key: value`, respecting a colon inside a quoted value. */
function pair(line: string): [string, string] | null {
  const m = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*([\s\S]*)$/);
  return m ? [m[1], m[2]] : null;
}

/**
 * Parse a flow mapping — `{ a: 1, b: "x, y" }`.
 *
 * Split by hand rather than on `,` because a comma inside a quoted value is
 * ordinary text, and the sources list is full of titles that contain one.
 */
function flowMapping(src: string): Record<string, Scalar> {
  const inner = src.trim().replace(/^\{/, "").replace(/\}$/, "");
  const parts: string[] = [];
  let cur = "";
  let quoted: string | null = null;

  for (let i = 0; i < inner.length; i++) {
    const c = inner.charAt(i);
    if (quoted) {
      cur += c;
      if (c === "\\") {
        cur += inner.charAt(i + 1) ?? "";
        i += 1;
      } else if (c === quoted) {
        quoted = null;
      }
      continue;
    }
    if (c === '"' || c === "'") {
      quoted = c;
      cur += c;
      continue;
    }
    if (c === ",") {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  parts.push(cur);

  const out: Record<string, Scalar> = {};
  for (const part of parts) {
    const p = pair(part.trim());
    if (p) out[p[0]] = scalarIn(p[1]);
  }
  return out;
}

const indentOf = (line: string): number => line.length - line.trimStart().length;

/**
 * Split a content file into its frontmatter and its body.
 *
 * A file with no `---` fence is not an error: it is a body with no fields, and
 * `shared/validate.ts` is what reports the missing title by name. Throwing here
 * would replace a precise message with a vague one.
 */
export function splitContentFile(text: string): {
  data: Frontmatter;
  body: string;
} {
  const src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: src.trim() };

  return {
    data: parseFrontmatter(m[1]),
    body: src.slice(m[0].length).trim(),
  };
}

/** Parse the text between the fences. */
export function parseFrontmatter(src: string): Frontmatter {
  const lines = src.split("\n");
  const data: Frontmatter = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "" || line.trimStart().startsWith("#")) {
      i += 1;
      continue;
    }
    if (indentOf(line) > 0) {
      // An orphaned continuation line — the key it belonged to was malformed.
      i += 1;
      continue;
    }

    const p = pair(line);
    if (!p) {
      i += 1;
      continue;
    }
    const [key, rest] = p;
    i += 1;

    if (rest.trim() === "[]") {
      data[key] = [];
      continue;
    }
    if (rest.trim() !== "") {
      data[key] = scalarIn(rest);
      continue;
    }

    /**
     * A block sequence. Each `-` opens an item; deeper-indented lines continue
     * it.
     *
     * An item is a scalar (news `keyPoints`) or a flat mapping (`sources`), and
     * the two are told apart by shape rather than by the key: a quoted or
     * braced item is unambiguous, and anything else is a mapping only if it
     * actually parses as `key: value`. That last clause is what keeps a bare
     * key point reading as prose instead of splitting on the first colon it
     * happens to contain — which most of them do.
     */
    const items: (Scalar | Mapping)[] = [];
    while (i < lines.length && /^\s+-\s*/.test(lines[i])) {
      const dashIndent = indentOf(lines[i]);
      const first = lines[i].replace(/^\s*-\s*/, "").trim();
      i += 1;

      if (first.startsWith("{")) {
        items.push(flowMapping(first));
        continue;
      }

      const p0 = first === "" ? null : pair(first);
      if (!p0) {
        items.push(scalarIn(first));
        continue;
      }

      const item: Mapping = { [p0[0]]: scalarIn(p0[1]) };
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        indentOf(lines[i]) > dashIndent &&
        !/^\s*-\s/.test(lines[i])
      ) {
        const pn = pair(lines[i].trim());
        if (pn) item[pn[0]] = scalarIn(pn[1]);
        i += 1;
      }
      items.push(item);
    }
    data[key] = items as Scalar[] | Mapping[];
  }

  return data;
}
