import { writeContentFile, type Frontmatter } from "../../shared/frontmatter";
import { writeNewsSections, type NewsSection } from "../../shared/newsbody";
import { commitFile, deleteFile, type CommitResult } from "./github";
import type { Env, NewsItem } from "./types";

/**
 * Turn an approved `news_items` row into `content/news/<slug>.md` and commit it.
 *
 * This is the step that makes an approved article visible, and it is the whole
 * of that step now. Previously the row itself was the article and a separate
 * Pages build had to be asked for; the file IS the article, and committing it
 * to `main` is the deploy.
 *
 * ## It writes exactly what the migration wrote
 *
 * `scripts/migrate-cms-to-files.mjs` produced the twenty files already in the
 * repo, from the same rows, through the same two serialisers. Keeping the field
 * list and the ordering identical here is not tidiness — it is what stops the
 * first re-approval of an existing article showing up as a whole-file diff.
 *
 * The two collapsed pairs are collapsed the same way: `headline` falls back to
 * the publisher's `title`, `dek` to `summary`, and both dates are normalised to
 * real ISO because `updated_at` is SQLite's `datetime('now')` — "2026-07-25
 * 09:41:02" — which is not a valid `<time datetime>` value.
 */

interface StoredBody {
  keyPoints?: string[];
  sections?: NewsSection[];
  whatItMeans?: string[];
}

/** Copy of `toIso` in src/lib/news.ts and in the migration script. */
function toIso(v: string | null): string | null {
  if (!v) return null;
  const normalised = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)
    ? v.replace(" ", "T") + "Z"
    : v;
  const d = new Date(normalised);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Drop null and undefined — frontmatter has no null. */
function defined(obj: Record<string, unknown>): Frontmatter {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined),
  ) as Frontmatter;
}

export function newsFilePath(slug: string): string {
  return `content/news/${slug}.md`;
}

/**
 * Render the file. Exported so the dashboard can preview exactly what would be
 * committed, rather than describing it.
 */
export function renderNewsFile(item: NewsItem, body: StoredBody): string {
  const data = defined({
    headline: item.headline?.trim() || item.title,
    dek: item.dek?.trim() || item.summary,
    category: item.category,
    sourceName: item.source_name,
    sourceUrl: item.source_url,
    publishedAt: toIso(item.published_at),
    updatedAt: toIso(item.updated_at),
    readingMinutes: item.reading_minutes ?? 3,
    keyPoints: body.keyPoints ?? [],
    whatItMeans: body.whatItMeans ?? [],
    sourceExcerpt: item.source_excerpt ?? null,
  });

  return writeContentFile(data, writeNewsSections(body.sections ?? []));
}

/**
 * Read the row, render it, commit it.
 *
 * Refuses on a body that will not parse or has no sections, matching
 * `readArticle()` in src/lib/news.ts: a row with no prose is not a page today,
 * and committing one would publish an empty article rather than fail loudly.
 */
export async function publishNewsFile(
  env: Env,
  id: string,
): Promise<CommitResult & { slug?: string }> {
  const item = await env.DB.prepare("SELECT * FROM news_items WHERE id = ?")
    .bind(id)
    .first<NewsItem>();

  if (!item) return { ok: false, error: `No item with id ${id}.` };
  if (!item.slug) {
    return {
      ok: false,
      error:
        "The item has no slug, which means the article was never written. " +
        "Approve it again to commission the prose first.",
    };
  }

  let body: StoredBody;
  try {
    body = JSON.parse(item.body ?? "") as StoredBody;
  } catch {
    return { ok: false, error: "The stored article body is not valid JSON." };
  }

  if (!Array.isArray(body.sections) || body.sections.length === 0) {
    return {
      ok: false,
      error:
        "The stored body has no sections. The site skips an article like this " +
        "rather than publishing a headline with nothing under it, so there is " +
        "nothing to commit.",
    };
  }

  const result = await commitFile(
    env,
    newsFilePath(item.slug),
    renderNewsFile(item, body),
    `content: publish news "${item.slug}"`,
  );

  return { ...result, slug: item.slug };
}

/** Retire an article: remove the file, which removes the page on the next build. */
export async function unpublishNewsFile(
  env: Env,
  slug: string,
): Promise<CommitResult> {
  return deleteFile(env, newsFilePath(slug), `content: retire news "${slug}"`);
}
