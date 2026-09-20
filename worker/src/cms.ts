import type { Env } from "./types";
import type { InsightDoc, InsightSummary } from "../../shared/insight";
import type { Block } from "../../shared/blocks";

/**
 * Read-only access to the pre-migration /insights/ rows in `cms_documents`.
 *
 * ## This is no longer how the site gets its articles
 *
 * It was, until 2026-08-25. The CMS then moved out of D1 and into markdown under
 * `content/insights/`, edited at /admin/ in Sveltia CMS, where a save is a commit
 * and a push to main is the deploy. `src/lib/insights.ts` reads those files off
 * disk and makes no request at all, so nothing on the reader's path touches this
 * file any more.
 *
 * What still calls it: `scripts/test-markdown.mjs`, whose live suite round-trips
 * each stored document through `shared/markdown.ts` to prove the compiler is
 * lossless, and `scripts/migrate-cms-to-files.mjs`, kept as the record of what
 * the migration did. Both go when the table does.
 *
 * The write path that used to live at the bottom of this file — `saveInsightDoc`,
 * `deleteInsightDoc`, and the admin-only readers the editor addressed documents
 * by id with — is gone. Its endpoints answered 410 from the migration onward,
 * because a write here would have reported success, changed a row, and changed
 * nothing a reader could ever see. That is the exact failure the migration
 * removed, and keeping a working-looking editor over it would have reintroduced
 * it. `validateInsightDoc` in shared/validate.ts is unaffected: the site still
 * runs it at render, on documents that now arrive as files.
 *
 * ## Shape
 *
 * Deliberately NOT the news API's snake_case-columns-as-JSON shape. That shape
 * exists because /api/news predates anyone thinking about it and is now frozen
 * — the site's build reads it and the 2026-07-25 outage was that coupling
 * breaking. This one is defined the other way round: `shared/insight.ts` is the
 * type, both sides import it, and the SQL is mapped into it here.
 */

/** Columns the index needs. `blocks` is absent — see below. */
const SUMMARY_COLUMNS = `id, category, slug, title, dek, published, reviewed,
   reading_minutes, related_guides, draft`;

interface SummaryRow {
  id: string;
  category: string;
  slug: string;
  title: string;
  dek: string;
  published: string | null;
  reviewed: string | null;
  reading_minutes: number | null;
  related_guides: string;
  draft: number;
}

interface DocRow extends SummaryRow {
  blocks: string;
  faq: string;
  sources: string;
}

/**
 * GET /api/cms/insights
 *
 * Every insight document, drafts included, newest first. `blocks` is left out:
 * the index feeds `generateStaticParams`, the /insights listing and the sitemap,
 * none of which render a body, and shipping every article's full AST to build
 * one list would multiply the payload by an order of magnitude for nothing. The
 * article route fetches each document by path.
 */
export async function listInsights(
  env: Env,
): Promise<{ items: InsightSummary[] } | { items: []; schema: "pending" }> {
  let results: SummaryRow[] | undefined;
  try {
    ({ results } = await env.DB.prepare(
      `SELECT ${SUMMARY_COLUMNS} FROM cms_documents
        WHERE kind = 'insight'
        ORDER BY COALESCE(published, created_at) DESC
        LIMIT 500`,
    ).all<SummaryRow>());
  } catch (err) {
    if (missingTable(err)) return { items: [], schema: "pending" };
    throw err;
  }

  return { items: (results ?? []).map(toSummary) };
}

/**
 * GET /api/cms/insights/:category/:slug
 *
 * One document, whole. `null` means no such row, which the router turns into a
 * 404 — and 404 is a legitimate answer the site handles, because the index it
 * read a moment ago can name a slug that was unpublished since.
 */
export async function getInsight(
  env: Env,
  category: string,
  slug: string,
): Promise<InsightDoc | null> {
  let row: DocRow | null = null;
  try {
    row = await env.DB.prepare(
      `SELECT ${SUMMARY_COLUMNS}, blocks, faq, sources FROM cms_documents
        WHERE kind = 'insight' AND category = ? AND slug = ?`,
    )
      .bind(category, slug)
      .first<DocRow>();
  } catch (err) {
    if (missingTable(err)) return null;
    throw err;
  }
  if (!row) return null;

  return {
    ...toSummary(row),
    blocks: parseJson<Block[]>(row.blocks, []),
    faq: parseJson<InsightDoc["faq"]>(row.faq, []),
    sources: parseJson<InsightDoc["sources"]>(row.sources, []),
  };
}

function toSummary(row: SummaryRow): InsightSummary {
  return {
    slug: row.slug,
    category: row.category as InsightSummary["category"],
    title: row.title,
    dek: row.dek ?? "",
    // The site's `Insight` type takes plain strings and sorts on `published`.
    // A row with no dates is a draft that has never been given any, and "" sorts
    // last, which is where an undated draft belongs.
    published: row.published ?? "",
    reviewed: row.reviewed ?? row.published ?? "",
    readingMinutes: row.reading_minutes ?? 0,
    relatedGuides: parseJson<InsightSummary["relatedGuides"]>(
      row.related_guides,
      [],
    ),
    draft: row.draft === 1,
  };
}

/**
 * A JSON column that will not parse.
 *
 * Falls back rather than throwing, and that is safe here only because it is not
 * the last check: `src/lib/insights.ts` runs `validateInsightDoc()` on whatever
 * this returns and fails the build with the article's path and the specific
 * complaint. An empty `blocks` array reaches that validator and is rejected by
 * it. Throwing here instead would produce a 500 and a build error naming the
 * endpoint rather than the article.
 */
function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw) as T;
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * "no such table: cms_documents" — the migration has not been applied yet.
 *
 * Answered as an empty list rather than a 500, and this is the one place this
 * file softens. The reason is deploy ordering, not failure tolerance. The Worker
 * and the D1 migration are two separate manual steps, and the site's build sits
 * downstream of both: if a deployed Worker 500s on this route between the deploy
 * and the migration, every Pages build in that window fails, including ones that
 * have nothing to do with insights. That is the coupling that took the site down
 * on 2026-07-25.
 *
 * It is narrow on purpose — the SQLite message, on this table only. Any other
 * database error still propagates and still fails the build. And `schema:
 * "pending"` travels with the empty list so the state is visible in the response
 * and to `worker/scripts/preflight.mjs`, rather than being indistinguishable
 * from "nothing published yet".
 *
 * The residual risk, stated plainly: drop the table by accident once articles
 * exist and the site quietly loses every one of them at the next build. The
 * migration is `CREATE TABLE IF NOT EXISTS` and nothing in this repo drops it,
 * so that requires someone at a console with a DROP statement.
 */
function missingTable(err: unknown): boolean {
  return /no such table:\s*cms_documents/i.test(String(err));
}
