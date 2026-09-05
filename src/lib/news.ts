import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { splitContentFile } from "@shared/frontmatter";
import { parseNewsSections } from "@shared/newsbody";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";

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
 *
 * English is at `content/news/`; every other locale is a derived tree at
 * `content/<locale>/news/`, written by `scripts/translate-content.mjs` from the
 * English file. The asymmetry is deliberate: English is the source of truth and
 * moving it would have renamed 21 files and every path in the Worker that
 * commits them, to gain symmetry and nothing else.
 */
function contentDir(locale: Locale): string {
  return locale === defaultLocale
    ? path.join(process.cwd(), "content", "news")
    : path.join(process.cwd(), "content", locale, "news");
}

/** Every category, in no particular order — the closed set of folder names. */
export const NEWS_CATEGORIES: readonly NewsCategory[] = [
  "pvip",
  "mm2h",
  "sarawak-mm2h",
  "de-rantau",
  "employment-pass",
  "student-pass",
  "general",
  "world",
];

/**
 * What a category's own index page is called.
 *
 * Usually "<label> news", which reads correctly for a programme name — "MM2H
 * news", "Student Pass news". It does not read correctly for every label:
 * "Other countries news" is not English. Only the exceptions are listed, and
 * both the labels and the exceptions live in the UI dictionary now, because a
 * Chinese reader needs the same distinction made in Chinese.
 */
export function categoryTitle(
  category: NewsCategory,
  locale: Locale = defaultLocale,
): string {
  const copy = getUi(locale).news;
  return copy.categoryPageTitle[category] ?? copy.categoryPageTitleFor(copy.categoryLabel[category]);
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
 *
 * The path is here; the link's wording is `ui.news.guideTitle`, because the
 * path is the same on every host and the wording is not.
 */
export const CATEGORY_GUIDE: Record<NewsCategory, { path: string } | null> = {
  pvip: { path: "/visas/pvip/" },
  mm2h: { path: "/visas/mm2h/" },
  "sarawak-mm2h": { path: "/visas/sarawak-mm2h/" },
  "de-rantau": { path: "/visas/de-rantau/" },
  "employment-pass": { path: "/visas/employment-pass/" },
  "student-pass": { path: "/visas/student-pass/" },
  general: null,
  // Other countries' news has no Malaysian guide to hand off to, so it points at
  // the comparison table — which is exactly the question it raises in a reader.
  world: { path: "/compare/" },
};

function asCategory(v: string): NewsCategory {
  return (NEWS_CATEGORIES as readonly string[]).includes(v)
    ? (v as NewsCategory)
    : "general";
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
 * Fetch once per build, not once per page — and once per locale.
 *
 * `generateStaticParams`, every article page and the sitemap all want this list.
 * A module-level promise is the memo: it does not depend on framework fetch-cache
 * semantics, which have changed between Next majors and would be an invisible
 * dependency if relied on here. Keyed by locale because the Chinese tree is a
 * different set of files, not a different view of the same ones.
 */
const articlesByLocale = new Map<Locale, Promise<FullNewsArticle[]>>();

/** Every article on disk for a locale, read once per build. */
function getArticles(locale: Locale): Promise<FullNewsArticle[]> {
  let promise = articlesByLocale.get(locale);
  if (!promise) {
    promise = readArticles(locale);
    articlesByLocale.set(locale, promise);
  }
  return promise;
}

export async function getNewsIndex(
  locale: Locale = defaultLocale,
): Promise<NewsArticle[]> {
  return (await getArticles(locale)).map(toSummary);
}

/**
 * Newest first, ties broken by slug.
 *
 * The tie-break is the part worth stating: two articles can share a
 * `publishedAt` to the second, and without a second key their order would come
 * out of whatever `readdir` happened to return. That would reshuffle two cards
 * between builds for no reason a reader could perceive — the same argument
 * `getCategoryIndex` makes a few lines down.
 *
 * ## An empty English tree is a build failure; an empty Chinese one is not
 *
 * English is the site. Exporting it with no /news/ pages would delete every
 * article path, and Pages serves a path that has vanished from an export for up
 * to seven days afterwards, so the mistake outlives the fix by a week.
 *
 * A translated tree is derived, and it fills up one article at a time: the
 * build that runs immediately after an English article is published has no
 * Chinese file for it yet, by design (see scripts/translate-content.mjs). So a
 * missing or empty directory there means "not translated yet" and the Chinese
 * host simply does not carry that story — which is what `hreflang` and the
 * language switcher are already told, through lib/translated.ts.
 */
async function readArticles(locale: Locale): Promise<FullNewsArticle[]> {
  const dir = contentDir(locale);
  const english = locale === defaultLocale;

  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch (err) {
    if (!english) return [];
    throw new Error(
      `[news] could not read ${dir} — ${String(err)}\n\n` +
        `The build is stopping rather than exporting a site with no /news/ ` +
        `pages. Pages\nserves paths that vanish from an export for up to seven ` +
        `days afterwards, so the\nmistake would outlive the fix by a week.`,
    );
  }

  const articles: FullNewsArticle[] = [];
  for (const file of files.sort()) {
    const article = await readArticle(dir, file);
    if (article) articles.push(article);
  }

  if (articles.length === 0 && english) {
    throw new Error(
      `[news] ${dir} contains no readable articles.\n\n` +
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
async function readArticle(
  dir: string,
  file: string,
): Promise<FullNewsArticle | null> {
  const raw = await readFile(path.join(dir, file), "utf8");
  const { data, body } = splitContentFile(raw);
  const sections = parseNewsSections(body);

  if (sections.length === 0) {
    console.warn(`[news] ${path.join(dir, file)} has no body — skipping it.`);
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
 * Only non-empty categories. A page per category would be simpler, but it would
 * publish up to eight URLs carrying a heading and no stories, and an empty index
 * is the definition of the thin content Search Console flags. The categories are
 * a fixed set that only ever fills up, so a category page, once it exists, does
 * not later vanish and 404.
 */
export async function getCategoryIndex(
  locale: Locale = defaultLocale,
): Promise<{ category: NewsCategory; articles: NewsArticle[] }[]> {
  const items = await getNewsIndex(locale);
  const label = getUi(locale).news.categoryLabel;

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
        label[a.category].localeCompare(label[b.category]),
    );
}

export async function getArticle(
  slug: string,
  locale: Locale = defaultLocale,
): Promise<FullNewsArticle | null> {
  const articles = await getArticles(locale);
  return articles.find((a) => a.slug === slug) ?? null;
}

/**
 * "23 July 2026" in English, 2026年7月23日 in Chinese — matches reviewDate() in
 * lib/format.ts, which formats the same date on the guide pages.
 */
export function newsDate(
  iso: string | null,
  locale: Locale = defaultLocale,
): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
