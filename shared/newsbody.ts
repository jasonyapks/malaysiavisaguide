/**
 * News article bodies ⇄ markdown.
 *
 * Much simpler than `shared/markdown.ts`, and deliberately a separate module
 * rather than a mode of it. A news body is `{ heading, paragraphs[] }[]` of
 * **plain strings** — no inline AST, no links, no live figures. That is not an
 * accident of the pipeline: news prose is written from a source article by a
 * model and approved in a triage pass, and the narrow shape is what stops a
 * generated paragraph carrying markup onto the site. Reusing the insight
 * compiler here would hand it exactly the expressiveness it was kept away from.
 *
 * `keyPoints` and `whatItMeans` are not in the body at all — they are lists of
 * plain strings and they live in frontmatter, the same field-versus-prose split
 * `shared/insight.ts` argues for.
 *
 *     ## Nighttime raids in Kuching
 *
 *     The Kuching Immigration Enforcement Division carried out two sweeps…
 *
 *     Officers visited three sites across the district.
 *
 * A paragraph that would otherwise open a heading is escaped with a leading
 * backslash, and the reader strips it back — the same trick `markdown.ts` uses,
 * for the same reason.
 */

export interface NewsSection {
  heading: string;
  paragraphs: string[];
}

/** A line start that means "not a paragraph" in this smaller grammar. */
const HEADING = /^##\s+(.*)$/;

export function writeNewsSections(sections: NewsSection[]): string {
  const chunks: string[] = [];

  for (const section of sections) {
    if (section.heading) chunks.push(`## ${section.heading}`);
    for (const paragraph of section.paragraphs) {
      const text = paragraph.trim();
      if (text === "") continue;
      chunks.push(HEADING.test(text) || text.startsWith("\\") ? `\\${text}` : text);
    }
  }

  return chunks.join("\n\n");
}

/**
 * Markdown → sections. Never throws.
 *
 * Paragraphs before the first heading become a section with an empty heading,
 * which is how a body that opens with prose round-trips. `src/lib/news.ts`
 * already renders a section with no heading as bare paragraphs.
 */
export function parseNewsSections(md: string): NewsSection[] {
  const blocks = md
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b !== "");

  const sections: NewsSection[] = [];
  let current: NewsSection | null = null;

  for (const block of blocks) {
    const h = block.match(HEADING);
    if (h) {
      current = { heading: h[1], paragraphs: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { heading: "", paragraphs: [] };
      sections.push(current);
    }
    const unescaped =
      block.startsWith("\\") && (HEADING.test(block.slice(1)) || block.slice(1).startsWith("\\"))
        ? block.slice(1)
        : block;
    current.paragraphs.push(unescaped);
  }

  return sections;
}
