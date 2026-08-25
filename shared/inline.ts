import type { Inline, ProgrammeId } from "./blocks";

/**
 * Inline prose ⇄ `Inline[]`, as a real module.
 *
 * Lifted verbatim out of the `String.raw` template literal in
 * `worker/src/editor.ts`, where this logic was born and where it could not be
 * imported, typechecked or tested. The algorithm is unchanged — the migration's
 * whole correctness argument rests on it staying that way, because every
 * document in D1 was written by the version in that template.
 *
 * Getting it out of `String.raw` is worth something on its own: a template
 * literal eats backslashes, so `\{` in the source becomes `{` in the emitted
 * JavaScript, and every regex below would silently lose its escapes. That
 * hazard is the reason `String.raw` was there, and it goes away here.
 *
 * ## The syntax
 *
 *   **bold**   _italic_   [label](/visas/pvip/)   ((caveat))
 *   {{pvip:participationFee:money}}   <- a live figure, resolved at build
 *
 * Emphasis is `_underscore_` and not `*asterisk*`, which is the unusual choice
 * and the one worth explaining. With both markers built from the same
 * character, an italic closing at the end of a bold run emits `***` — and `***`
 * cannot be parsed back unambiguously. The self-check in `writeInline()` cannot
 * rescue it either, because the ambiguity is in the structural markers rather
 * than in the escaped text. Underscore removes the collision at the source, and
 * has the side benefit that a lone asterisk in prose needs no escaping.
 *
 * ## Two invariants
 *
 * **The parser is total.** A half-typed `**` stays literal text rather than
 * throwing, because the field being typed into must not explode mid-word — and
 * because the markdown compiler built on top of this inherits the same promise
 * for a half-typed shortcode.
 *
 * **The round trip is exact.** A lossy write would corrupt an article on save,
 * silently, with no error anywhere. So `writeInline()` checks itself: it
 * escapes minimally, parses its own output back, compares, and falls back to
 * escaping every marker character if the two do not match.
 *
 * One deliberate asymmetry: an empty text node is dropped rather than
 * round-tripped, because there is no text to write and nothing renders from it
 * either way.
 */

/**
 * The index of the next unescaped `marker` at or after `from`, or -1.
 *
 * Skipping two characters after a backslash is what makes `\**` literal rather
 * than a closing marker.
 */
function findClose(src: string, from: number, marker: string): number {
  let i = from;
  while (i < src.length) {
    if (src.charAt(i) === "\\") {
      i += 2;
      continue;
    }
    if (src.startsWith(marker, i)) return i;
    i += 1;
  }
  return -1;
}

/** Drop one level of backslash escaping. Used for hrefs, which are not inline. */
function stripEscapes(s: string): string {
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

/**
 * Prose → inline tree. Never throws; unmatched markers stay literal.
 *
 * `fig` casts its programme to `ProgrammeId` without checking. That is
 * deliberate and matches the original: the closed allowlists live in
 * `shared/validate.ts`, which runs on save and again at build, and reports an
 * unknown programme as a named validation failure rather than as a parse that
 * quietly dropped the token.
 */
export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push({ t: "text", v: buf });
      buf = "";
    }
  };

  let i = 0;
  while (i < src.length) {
    const c = src.charAt(i);

    if (c === "\\" && i + 1 < src.length) {
      buf += src.charAt(i + 1);
      i += 2;
      continue;
    }

    if (src.startsWith("**", i)) {
      const sEnd = findClose(src, i + 2, "**");
      if (sEnd >= 0) {
        flush();
        out.push({ t: "strong", c: parseInline(src.slice(i + 2, sEnd)) });
        i = sEnd + 2;
        continue;
      }
    }
    if (c === "_") {
      const eEnd = findClose(src, i + 1, "_");
      if (eEnd >= 0) {
        flush();
        out.push({ t: "em", c: parseInline(src.slice(i + 1, eEnd)) });
        i = eEnd + 1;
        continue;
      }
    }
    if (src.startsWith("((", i)) {
      const nEnd = findClose(src, i + 2, "))");
      if (nEnd >= 0) {
        flush();
        out.push({ t: "note", c: parseInline(src.slice(i + 2, nEnd)) });
        i = nEnd + 2;
        continue;
      }
    }
    if (src.startsWith("{{", i)) {
      const fEnd = findClose(src, i + 2, "}}");
      if (fEnd >= 0) {
        const parts = src.slice(i + 2, fEnd).split(":");
        if (parts.length === 3) {
          flush();
          out.push({
            t: "fig",
            programme: parts[0] as ProgrammeId,
            field: parts[1],
            fmt: parts[2],
          });
          i = fEnd + 2;
          continue;
        }
      }
    }
    if (c === "[") {
      const lEnd = findClose(src, i + 1, "]");
      if (lEnd >= 0 && src.charAt(lEnd + 1) === "(") {
        const hEnd = findClose(src, lEnd + 2, ")");
        if (hEnd >= 0) {
          flush();
          out.push({
            t: "link",
            href: stripEscapes(src.slice(lEnd + 2, hEnd)),
            c: parseInline(src.slice(i + 1, lEnd)),
          });
          i = hEnd + 1;
          continue;
        }
      }
    }

    buf += c;
    i += 1;
  }
  flush();
  return out;
}

/**
 * Escape a text leaf.
 *
 * `hard` escapes every marker character and is the fallback path when the
 * minimal escaping fails its own round-trip check. Minimal escaping covers only
 * what would actually parse: the backslash itself, the emphasis marker, a link
 * opener, and the three doubled openers. A lone asterisk, paren or brace is
 * left alone — prose is full of them and escaping all of them makes the source
 * unreadable to write in.
 */
export function escText(v: string, hard: boolean): string {
  if (hard) return v.replace(/([\\*_[\](){}])/g, "\\$1");
  return v
    .replace(/\\/g, "\\\\")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\*\*/g, "\\*\\*")
    .replace(/\(\(/g, "\\(\\(")
    .replace(/\{\{/g, "\\{\\{");
}

function emitInline(nodes: Inline[] | undefined, hard: boolean): string {
  return (nodes || [])
    .map((n) => {
      if (n.t === "text") return escText(String(n.v == null ? "" : n.v), hard);
      if (n.t === "strong") return "**" + emitInline(n.c, hard) + "**";
      if (n.t === "em") return "_" + emitInline(n.c, hard) + "_";
      if (n.t === "note") return "((" + emitInline(n.c, hard) + "))";
      if (n.t === "fig")
        return "{{" + n.programme + ":" + n.field + ":" + n.fmt + "}}";
      if (n.t === "link") {
        return (
          "[" +
          emitInline(n.c, hard) +
          "](" +
          String(n.href).replace(/([\\()])/g, "\\$1") +
          ")"
        );
      }
      return "";
    })
    .join("");
}

/**
 * Structural equality, written out rather than done with `JSON.stringify`.
 *
 * stringify compares key ORDER too, and a node built by the parser has its keys
 * in a different order from the same node loaded out of D1. That would report
 * every document as lossy and push every write down the hard-escape path —
 * correct output, unreadable source.
 */
export function sameInline(a: Inline[] | undefined, b: Inline[] | undefined): boolean {
  const xs = a || [];
  const ys = b || [];
  if (xs.length !== ys.length) return false;
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    if (x.t !== y.t) return false;
    if (x.t === "text" && y.t === "text") {
      if (x.v !== y.v) return false;
    } else if (x.t === "fig" && y.t === "fig") {
      if (x.programme !== y.programme || x.field !== y.field || x.fmt !== y.fmt)
        return false;
    } else if (x.t === "link" && y.t === "link") {
      if (x.href !== y.href || !sameInline(x.c, y.c)) return false;
    } else if (x.t !== "text" && x.t !== "fig" && y.t !== "text" && y.t !== "fig") {
      if (!sameInline(x.c, y.c)) return false;
    }
  }
  return true;
}

/** Inline tree → prose, minimally escaped, verified by parsing it back. */
export function writeInline(nodes: Inline[]): string {
  const minimal = emitInline(nodes, false);
  if (sameInline(parseInline(minimal), nodes)) return minimal;
  return emitInline(nodes, true);
}

/* ------------------------------------------------------------------ *
 * Table cells
 *
 * Cells are pipe-separated, so a literal pipe inside one needs hiding.
 * `writeInline` never emits a bare backslash-pipe, so this pair is
 * unambiguous.
 * ------------------------------------------------------------------ */

export function cellOut(nodes: Inline[]): string {
  return writeInline(nodes).replace(/\|/g, "\\|");
}

export function cellIn(s: string): Inline[] {
  return parseInline(s.replace(/\\\|/g, "|"));
}

/** Split one table row on unescaped pipes, trimming each cell. */
export function splitCells(line: string): string[] {
  const parts: string[] = [];
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    if (line.charAt(i) === "\\" && i + 1 < line.length) {
      cur += line.charAt(i) + line.charAt(i + 1);
      i += 1;
      continue;
    }
    if (line.charAt(i) === "|") {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += line.charAt(i);
  }
  parts.push(cur.trim());
  return parts;
}
