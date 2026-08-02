import type { Env } from "./types";
import type { InsightDoc, InsightSummary } from "../../shared/insight";
import type { Block } from "../../shared/blocks";
import { validateInsightDoc } from "../../shared/validate";

/**
 * The public read path for CMS-authored documents — what `next build` fetches.
 *
 * Two endpoints, both public for exactly the reason /api/news is public: the
 * build machine has no browser to log in with, and nothing served here is not
 * about to be published on the site anyway. Drafts are the one wrinkle and they
 * are served on purpose — a draft is reviewed at its real URL, noindex and
 * unlisted, which is only possible if the build can read it.
 *
 * ## The contract, and why it is worth being fussy about
 *
 * `src/lib/insights.ts` **throws** on anything it cannot read: a non-200, a body
 * with no `items` array, a document that fails validation. That is not
 * defensiveness for its own sake. /insights/ pages are the evergreen, meant-to-
 * be-cited half of the site, and an API that answered `{items: []}` when it
 * meant "I am broken" would delete every article path from the static export.
 * Cloudflare Pages then holds a deleted path at the edge for up to seven days,
 * serving 200 for a page that no longer exists — so the mistake outlives the
 * fix by a week. A failed build costs a minute.
 *
 * So this file's job is to be unambiguous. It answers with articles, or it
 * answers with a status code. It never answers "nothing" to mean "I could not
 * tell you".
 *
 * The one exception is spelled out on `missingTable()` below, and it is about
 * deploy ordering rather than about failure.
 *
 * ## Shape
 *
 * Deliberately NOT the news API's snake_case-columns-as-JSON shape. That shape
 * exists because /api/news predates anyone thinking about it and is now frozen
 * — the site's build reads it and the 2026-07-25 outage was that coupling
 * breaking. This one is defined the other way round: `shared/insight.ts` is the
 * type, both sides import it, and the SQL is mapped into it here. The columns
 * can be refactored without touching the site.
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

/* ------------------------------------------------------------------ *
 * The write path — Phase 5. Admin only; the router gates it on Access.
 * ------------------------------------------------------------------ */

/**
 * The admin list. Same rows as the public index plus `id`, because the editor
 * addresses a document by identity and the public site addresses it by path.
 * That distinction is the whole reason the primary key is a UUID rather than
 * the path (see migration 006): correcting a slug is an ordinary edit, and it
 * must not orphan the row being edited.
 */
export async function listInsightsAdmin(
  env: Env,
): Promise<{ items: (InsightSummary & { id: string })[] }> {
  let results: SummaryRow[] | undefined;
  try {
    ({ results } = await env.DB.prepare(
      `SELECT ${SUMMARY_COLUMNS} FROM cms_documents
        WHERE kind = 'insight'
        ORDER BY COALESCE(published, created_at) DESC
        LIMIT 500`,
    ).all<SummaryRow>());
  } catch (err) {
    if (missingTable(err)) return { items: [] };
    throw err;
  }
  return {
    items: (results ?? []).map((r) => ({ ...toSummary(r), id: r.id })),
  };
}

/** One whole document by id, for the editor to load. */
export async function getInsightById(
  env: Env,
  id: string,
): Promise<(InsightDoc & { id: string }) | null> {
  let row: DocRow | null = null;
  try {
    row = await env.DB.prepare(
      `SELECT ${SUMMARY_COLUMNS}, blocks, faq, sources FROM cms_documents
        WHERE kind = 'insight' AND id = ?`,
    )
      .bind(id)
      .first<DocRow>();
  } catch (err) {
    if (missingTable(err)) return null;
    throw err;
  }
  if (!row) return null;
  return {
    ...toSummary(row),
    id: row.id,
    blocks: parseJson<Block[]>(row.blocks, []),
    faq: parseJson<InsightDoc["faq"]>(row.faq, []),
    sources: parseJson<InsightDoc["sources"]>(row.sources, []),
  };
}

export type SaveOutcome =
  | { ok: true; id: string; created: boolean }
  | { ok: false; status: 404 | 409 | 422; error: string; errors?: string[] };

/**
 * Create or replace a document, whole.
 *
 * A whole-document PUT rather than a field patch, and that is deliberate. The
 * body is an AST: a patch that could touch one block would need block identity,
 * an ordering column and a merge rule, all to save bytes on a payload that is
 * 26KB at its worst. The editor holds the document in memory and sends it back.
 *
 * `validateInsightDoc` runs here **before** anything is written. That is the
 * point of Phase 5 — a malformed document has to fail against the thing Jason
 * just typed, not ten minutes later in a red Pages build that names no article.
 * The site validates again at render, because a row can also arrive from a
 * script or a migration (both of which have already happened once).
 */
export async function saveInsightDoc(
  env: Env,
  doc: unknown,
  id: string | null,
): Promise<SaveOutcome> {
  const errors = validateInsightDoc(doc);
  if (errors.length) {
    return { ok: false, status: 422, error: "Document did not validate", errors };
  }
  const d = doc as InsightDoc;

  // The unique index on (kind, category, slug) would raise a constraint error
  // anyway. Checking first turns "D1_ERROR: UNIQUE constraint failed" into a
  // sentence naming the article that already sits at that URL.
  const clash = await env.DB.prepare(
    `SELECT id FROM cms_documents WHERE kind = 'insight' AND category = ? AND slug = ?`,
  )
    .bind(d.category, d.slug)
    .first<{ id: string }>();
  if (clash && clash.id !== id) {
    return {
      ok: false,
      status: 409,
      error: `/insights/${d.category}/${d.slug}/ is already taken by another document.`,
    };
  }

  // Undefined means draft. Migration 006 defaults the column the same way, for
  // the same reason: a half-written article that is accidentally live is worse
  // than a finished one that needs a second click.
  const draft = d.draft === false ? 0 : 1;
  const guides = JSON.stringify(d.relatedGuides);
  const blocks = JSON.stringify(d.blocks);
  const faq = JSON.stringify(d.faq);
  const sources = JSON.stringify(d.sources);

  if (id === null) {
    const newId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO cms_documents
         (id, kind, category, slug, title, dek, published, reviewed,
          reading_minutes, related_guides, blocks, faq, sources, draft)
       VALUES (?, 'insight', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        newId, d.category, d.slug, d.title, d.dek, d.published, d.reviewed,
        d.readingMinutes, guides, blocks, faq, sources, draft,
      )
      .run();
    return { ok: true, id: newId, created: true };
  }

  const res = await env.DB.prepare(
    `UPDATE cms_documents
        SET category = ?, slug = ?, title = ?, dek = ?, published = ?,
            reviewed = ?, reading_minutes = ?, related_guides = ?, blocks = ?,
            faq = ?, sources = ?, draft = ?, updated_at = datetime('now')
      WHERE kind = 'insight' AND id = ?`,
  )
    .bind(
      d.category, d.slug, d.title, d.dek, d.published, d.reviewed,
      d.readingMinutes, guides, blocks, faq, sources, draft, id,
    )
    .run();

  if (!res.meta.changes) {
    return { ok: false, status: 404, error: "No such document." };
  }
  return { ok: true, id, created: false };
}

/**
 * Delete a document.
 *
 * No soft delete and no undo, and that is a considered omission rather than a
 * gap. A published article's URL is the thing worth protecting, and Cloudflare
 * Pages keeps serving a removed path from the edge for up to seven days — so
 * "deleted" is already slow and messy at the reader's end. Unpublishing is what
 * the draft flag is for, and it is reversible in one click. Delete is for a
 * document that was never live.
 */
export async function deleteInsightDoc(env: Env, id: string): Promise<boolean> {
  const res = await env.DB.prepare(
    `DELETE FROM cms_documents WHERE kind = 'insight' AND id = ?`,
  )
    .bind(id)
    .run();
  return Boolean(res.meta.changes);
}
