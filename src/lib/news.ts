import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { splitContentFile } from "@shared/frontmatter";
import { parseNewsSections } from "@shared/newsbody";

/**
 * Build-time data layer for the news blog.
 *
 * Every article page, the /news index and the sitemap are prerendered by
 * `next build` from the news Worker's public API. Nothing here runs in the
 * browser: the pages this feeds are static HTML by the time a reader or a
 * crawler sees them, which is the whole point — a client-rendered feed cannot
 * rank, and ranking is why the blog exists.
 *
 * The cost of that choice: new articles appear only after a rebuild and
 * redeploy. That is the same manual step the rest of the site already needs
 * (SPEC.md §4.2), so it adds no new operational surface.
 */

export type NewsCategory =
  | "pvip"
  | "mm2h"
  | "sarawak-mm2h"
  | "de-rantau"
  | "employment-pass"
  | "student-pass"
  | "general"
  | "world";

/** The article body as the Worker stores it — see worker/src/article.ts. */
export interface ArticleBody {
  keyPoints: string[];
  sections: { heading: string; paragraphs: string[] }[];
  whatItMeans: string[];
}

/** An article in the shape the pages actually want. */
export interface NewsArticle {
  slug: string;
  /** Our headline, falling back to the publisher's if none was written. */
  headline: string;
  /** Standfirst; also the page's meta description. */
  dek: string;
  category: NewsCategory;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string | null;
  updatedAt: string | null;
  readingMinutes: number;
}

export interface FullNewsArticle extends NewsArticle {
  body: ArticleBody;
  sourceExcerpt: string | null;
}

/**
 * Where the articles live.
 *
 * One markdown file per article, committed to the repo, so the build reads them
 * off disk. The cron Worker still sweeps and still triages in D1 — the pending
 * queue is a queue, not content — but an *approved* article becomes a file.
 *
 * That retires the cache-buster this file used to carry, and the failure it
 * existed for. Serving yesterday's list out of Next's persistent fetch cache is
 * not reachable any more, and neither is the two-step publish behind it: the
 * symptom "I approved it and it isn't live" had its cause in a D1 write that no
 * build had seen yet. A commit is the trigger now, so approving is publishing.
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "news");

export const CATEGORY_LABEL: Record<NewsCategory, string> = {
  pvip: "PVIP",
  mm2h: "MM2H",
  "sarawak-mm2h": "Sarawak MM2H",
  "de-rantau": "DE Rantau",
  "employment-pass": "Employment Pass",
  "student-pass": "Student Pass",
  general: "Immigration",
  world: "Other countries",
};

/**
 * Standfirst for each category's own index page, and its meta description.
 *
 * Written per category rather than generated from the label, because a category
 * page whose description is "News about MM2H" is thin content by any measure —
 * it competes with /news and the guide for the same terms and deserves to lose
 * to both. Each of these says what the category actually covers.
 */
export const CATEGORY_BLURB: Record<NewsCategory, string> = {
  pvip: "Changes to the Premium Visitor Pass — the participation fee, the fixed deposit, and how the 20-year term is being applied in practice.",
  mm2h: "Malaysia My Second Home news — the Silver, Gold and Platinum tiers, deposit and property thresholds, and the agent requirement.",
  "sarawak-mm2h":
    "Sarawak's own MM2H — the state programme with its own deposit, its own approvals and its own rules, reported separately because it moves separately.",
  "de-rantau":
    "DE Rantau, Malaysia's digital nomad pass — income thresholds, eligible professions and how the twelve-month pass is renewed.",
  "employment-pass":
    "Employment Pass news — the EP I, II and III salary tiers, ESD processing, and the rules employers and holders both have to meet.",
  "student-pass":
    "Student Pass news — EMGS processing, institution sponsorship, and the conditions attached to studying in Malaysia.",
  general:
    "Malaysian immigration policy that affects foreign nationals across the programmes rather than any single one of them.",
  world:
    "Long-stay, retirement and investor visas in other countries — the alternatives a reader is weighing Malaysia against, reported for comparison rather than recommendation.",
};

/**
 * What a category's own index page is called.
 *
 * Usually "<label> news", which reads correctly for a programme name — "MM2H
 * news", "Student Pass news". It does not read correctly for every label:
 * "Other countries news" is not English. Only the exceptions are listed.
 */
const CATEGORY_PAGE_TITLE: Partial<Record<NewsCategory, string>> = {
  world: "Visa news from other countries",
  general: "Malaysian immigration news",
};

export function categoryTitle(category: NewsCategory): string {
  return CATEGORY_PAGE_TITLE[category] ?? `${CATEGORY_LABEL[category]} news`;
}

/** The browse-by-category index for a category. Trailing slash, like every route here. */
export function categoryPath(category: NewsCategory): string {
  return `/news/category/${category}/`;
}

/**
 * The guide each category belongs to. An article's job is to answer the news
 * question and then hand the reader to the page that answers the real one, so
 * every article carries this link — it is the site's internal linking, and it is
 * what stops the blog being a dead end for both readers and crawlers.
 */
export const CATEGORY_GUIDE: Record<NewsCategory, { path: string; title: string } | null> = {
  pvip: { path: "/visas/pvip/", title: "the PVIP guide" },
  mm2h: { path: "/visas/mm2h/", title: "the MM2H guide" },
  "sarawak-mm2h": { path: "/visas/sarawak-mm2h/", title: "the Sarawak MM2H guide" },
  "de-rantau": { path: "/visas/de-rantau/", title: "the DE Rantau guide" },
  "employment-pass": { path: "/visas/employment-pass/", title: "the Employment Pass guide" },
  "student-pass": { path: "/visas/student-pass/", title: "the Student Pass guide" },
  general: null,
  // Other countries' news has no Malaysian guide to hand off to, so it points at
  // the comparison table — which is exactly the question it raises in a reader.
  world: { path: "/compare/", title: "how Malaysia compares" },
};

function asCategory(v: string): NewsCategory {
  return v in CATEGORY_LABEL ? (v as NewsCategory) : "general";
}

/**
 * Drop the body, leaving the shape every listing wants.
 *
 * The row used to carry `headline`/`title` and `dek`/`summary` — ours and the
 * publisher's, one falling back to the other. A file has one field for each:
 * the fallback was resolved once, during the migration, and does not need
 * resolving again on every read.
 */
function toSummary(a: FullNewsArticle): NewsArticle {
  return {
    slug: a.slug,
    headline: a.headline,
    dek: a.dek,
    category: a.category,
    sourceName: a.sourceName,
    sourceUrl: a.sourceUrl,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    readingMinutes: a.readingMinutes,
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v === undefined ? "" : String(v);
}

/** A frontmatter list of plain strings — `keyPoints`, `whatItMeans`. */
function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.map(str) : [];
}

/**
 * Normalise a stored date to a real ISO string.
 *
 * `published_at` arrives as ISO (the feed and the extractor both call
 * toISOString), but `updated_at` is SQLite's `datetime('now')` — "2026-07-25
 * 09:41:02", with a space and no zone. That parses, so it looks fine, but it is
 * not a valid `<time datetime>` value and not a valid OG `modifiedTime`, and
 * both fail silently rather than visibly. Convert once, here, so no consumer has
 * to know which column it came from.
 */
function toIso(v: string | null): string | null {
  if (!v) return null;
  // A bare SQLite datetime is UTC; say so explicitly rather than letting the
  // build machine's timezone decide what it meant.
  const normalised = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)
    ? v.replace(" ", "T") + "Z"
    : v;
  const d = new Date(normalised);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Fetch once per build, not once per page.
 *
 * `generateStaticParams`, every article page and the sitemap all want this list.
 * A module-level promise is the memo: it does not depend on framework fetch-cache
 * semantics, which have changed between Next majors and would be an invisible
 * dependency if relied on here.
 */
let articlesPromise: Promise<FullNewsArticle[]> | null = null;

/** Every article on disk, read once per build. */
function getArticles(): Promise<FullNewsArticle[]> {
  articlesPromise ??= readArticles();
  return articlesPromise;
}

export async function getNewsIndex(): Promise<NewsArticle[]> {
  return (await getArticles()).map(toSummary);
}

/**
 * Newest first, ties broken by slug.
 *
 * The tie-break is the part worth stating: two articles can share a
 * `publishedAt` to the second, and without a second key their order would come
 * out of whatever `readdir` happened to return. That would reshuffle two cards
 * between builds for no reason a reader could perceive — the same argument
 * `getCategoryIndex` makes a few lines down.
 */
async function readArticles(): Promise<FullNewsArticle[]> {
  let files: string[];
  try {
    files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith(".md"));
  } catch (err) {
    throw new Error(
      `[news] could not read ${CONTENT_DIR} — ${String(err)}\n\n` +
        `The build is stopping rather than exporting a site with no /news/ ` +
        `pages. Pages\nserves paths that vanish from an export for up to seven ` +
        `days afterwards, so the\nmistake would outlive the fix by a week.`,
    );
  }

  const articles: FullNewsArticle[] = [];
  for (const file of files.sort()) {
    const article = await readArticle(file);
    if (article) articles.push(article);
  }

  if (articles.length === 0) {
    throw new Error(
      `[news] ${CONTENT_DIR} contains no readable articles.\n\n` +
        `An empty blog is never the intention, and shipping one would delete ` +
        `every article\npath from the export. Restore the files, or revert ` +
        `whatever removed them.`,
    );
  }

  return articles.sort(
    (a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") ||
      a.slug.localeCompare(b.slug),
  );
}

/**
 * Read one file.
 *
 * A file with no prose is skipped with a warning rather than failing the build,
 * which is the policy the fetch had: the blog fills from a cron and an approval
 * click, and one malformed article should not stop the other nineteen from
 * publishing. /insights takes the opposite line, and the header of
 * src/lib/insights.ts says why.
 */
async function readArticle(file: string): Promise<FullNewsArticle | null> {
  const raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
  const { data, body } = splitContentFile(raw);
  const sections = parseNewsSections(body);

  if (sections.length === 0) {
    console.warn(`[news] content/news/${file} has no body — skipping it.`);
    return null;
  }

  return {
    slug: file.replace(/\.md$/, ""),
    headline: str(data.headline),
    dek: str(data.dek),
    category: asCategory(str(data.category)),
    sourceName: str(data.sourceName),
    sourceUrl: str(data.sourceUrl),
    publishedAt: toIso(str(data.publishedAt) || null),
    updatedAt: toIso(str(data.updatedAt) || null),
    readingMinutes:
      typeof data.readingMinutes === "number" ? data.readingMinutes : 3,
    body: {
      keyPoints: strings(data.keyPoints),
      sections,
      whatItMeans: strings(data.whatItMeans),
    },
    sourceExcerpt:
      typeof data.sourceExcerpt === "string" ? data.sourceExcerpt : null,
  };
}

/**
 * The categories that actually have something in them, most-populated first,
 * each with its articles in index order (newest first).
 *
 * Only non-empty categories. A page per key of CATEGORY_LABEL would be simpler,
 * but it would publish up to eight URLs carrying a heading and no stories, and
 * an empty index is the definition of the thin content Search Console flags.
 * The categories are a fixed set that only ever fills up, so a category page,
 * once it exists, does not later vanish and 404.
 */
export async function getCategoryIndex(): Promise<
  { category: NewsCategory; articles: NewsArticle[] }[]
> {
  const items = await getNewsIndex();

  const byCategory = new Map<NewsCategory, NewsArticle[]>();
  for (const a of items) {
    const bucket = byCategory.get(a.category);
    if (bucket) bucket.push(a);
    else byCategory.set(a.category, [a]);
  }

  return [...byCategory.entries()]
    .map(([category, articles]) => ({ category, articles }))
    .sort(
      (a, b) =>
        b.articles.length - a.articles.length ||
        // Ties broken by label so the browse strip does not reshuffle itself
        // between builds for no reason a reader could perceive.
        CATEGORY_LABEL[a.category].localeCompare(CATEGORY_LABEL[b.category]),
    );
}

export async function getArticle(slug: string): Promise<FullNewsArticle | null> {
  const articles = await getArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}

/** "23 July 2026" — matches reviewDate() in lib/format.ts. */
export function newsDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
