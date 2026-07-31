import type { Block, InsightCategoryId } from "./blocks";

/**
 * The document envelope — everything about an insight article that is not its
 * body.
 *
 * The field names deliberately match `Insight` in src/lib/data/insights.ts, so
 * a CMS article and a hand-written one are the same thing to `InsightLayout`,
 * to the card, to the sitemap and to the schema block. That is what makes
 * Phase 5's migration a data move rather than a rewrite: transcribe the body,
 * delete the folder, and no consumer changes.
 *
 * ## Why FAQ and sources are fields rather than blocks
 *
 * Every other piece of the article is a block the author can drag anywhere.
 * These two are not, and it is not an oversight.
 *
 * They carry structured data, not prose. The FAQ emits FAQPage JSON-LD from the
 * same array it renders, which is the only thing keeping the structured data
 * from drifting away from what the reader sees — the drift Google penalises.
 * The sources block emits the article's provenance and `InsightLayout` states,
 * in so many words, that "every figure above comes from an official government
 * document". That sentence is only true while the block sits below everything.
 * Make it movable and the first article that puts it halfway up makes the site's
 * central trust claim false, silently.
 *
 * So they render at a fixed position, from fields, and the editor offers no way
 * to move them.
 */
export interface InsightDoc {
  /** URL slug. Lives at /insights/<category>/<slug>/. */
  slug: string;
  category: InsightCategoryId;
  /** The h1 and the card title. */
  title: string;
  /** Standfirst, and the meta description. Written to stand alone in a SERP. */
  dek: string;
  /** ISO date (YYYY-MM-DD) first published. */
  published: string;
  /** ISO date of the last substantive review. Drives the byline. */
  reviewed: string;
  readingMinutes: number;
  /** Programme guides this article hands the reader on to. At least one. */
  relatedGuides: { path: string; title: string }[];
  /**
   * Draft: reviewable at its real URL in `next dev`, noindex, absent from the
   * sitemap and from every listing. Set while a figure is still unconfirmed.
   */
  draft?: boolean;
  /** The body. */
  blocks: Block[];
  /** Rendered, and emitted as FAQPage JSON-LD from the same array. */
  faq: { q: string; a: string }[];
  /** Every figure above traces to one of these. Rendered, not optional. */
  sources: { label: string; url: string; verified: string }[];
}

/** One row of the CMS index, as GET /api/cms/insights returns it. */
export interface InsightSummary {
  slug: string;
  category: InsightCategoryId;
  title: string;
  dek: string;
  published: string;
  reviewed: string;
  readingMinutes: number;
  relatedGuides: { path: string; title: string }[];
  draft: boolean;
}
