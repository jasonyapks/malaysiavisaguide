import { site } from "@/lib/site";

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

/** One row as the API returns it. Snake_case because it is SQLite columns. */
interface ApiItem {
  id: string;
  slug: string;
  headline: string | null;
  title: string;
  dek: string | null;
  summary: string;
  category: string;
  source_name: string;
  source_url: string;
  published_at: string | null;
  reading_minutes: number | null;
  updated_at: string | null;
  body?: string | null;
  source_excerpt?: string | null;
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
 * Where to read the articles from.
 *
 * `site.newsApi` is the deployed Worker. NEWS_API_URL overrides it so the blog
 * can be built and inspected against a local `wrangler dev` before anything is
 * deployed:
 *
 *   NEWS_API_URL=http://localhost:8787/api/news npm run build
 *
 * The override lives here rather than in lib/site.ts because site.ts is imported
 * by client components, and a server-only env var read has no business being
 * evaluated in a browser bundle.
 */
const NEWS_API = process.env.NEWS_API_URL ?? site.newsApi;

/**
 * Per-build cache-buster.
 *
 * Freshness here is not optional: a rebuild that serves yesterday's article list
 * from Next's persistent fetch cache in `.next/cache` would deploy a site that
 * silently lags the dashboard, and the symptom — "I approved it and it isn't
 * live" — points nowhere near the cause.
 *
 * The obvious fix, `cache: "no-store"`, is not available. It marks the route as
 * dynamically rendered, and `output: "export"` then refuses to build it at all.
 * So instead the URL itself changes every build, which moves the cache key
 * rather than fighting the cache. The Worker matches on pathname and ignores the
 * parameter.
 *
 * Next builds pages across several worker processes, so this evaluates once per
 * process rather than once per build — a handful of requests instead of one, and
 * every one of them current.
 */
const BUILD_ID = Date.now().toString(36);

function withBuildId(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}b=${BUILD_ID}`;
}

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

function toArticle(it: ApiItem): NewsArticle {
  return {
    slug: it.slug,
    headline: it.headline?.trim() || it.title,
    dek: it.dek?.trim() || it.summary,
    category: asCategory(it.category),
    sourceName: it.source_name,
    sourceUrl: it.source_url,
    publishedAt: toIso(it.published_at),
    updatedAt: toIso(it.updated_at),
    readingMinutes: it.reading_minutes ?? 3,
  };
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
let indexPromise: Promise<NewsArticle[]> | null = null;

export function getNewsIndex(): Promise<NewsArticle[]> {
  indexPromise ??= fetchIndex();
  return indexPromise;
}

async function fetchIndex(): Promise<NewsArticle[]> {
  const data = await getJson<{ items: ApiItem[] }>(NEWS_API, "the news index");
  if (!data) return [];
  return (data.items ?? []).filter((it) => it.slug).map(toArticle);
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

const articleCache = new Map<string, Promise<FullNewsArticle | null>>();

export function getArticle(slug: string): Promise<FullNewsArticle | null> {
  let p = articleCache.get(slug);
  if (!p) {
    p = fetchArticle(slug);
    articleCache.set(slug, p);
  }
  return p;
}

async function fetchArticle(slug: string): Promise<FullNewsArticle | null> {
  const data = await getJson<{ item: ApiItem }>(
    `${NEWS_API}/${encodeURIComponent(slug)}`,
    `the article "${slug}"`,
    true,
  );
  const it = data?.item;
  if (!it?.slug) return null;

  // A row that reached the index but whose body will not parse is a bug, not a
  // reason to publish a headline with nothing under it.
  let body: ArticleBody;
  try {
    const parsed = JSON.parse(it.body ?? "") as ArticleBody;
    if (!Array.isArray(parsed?.sections) || parsed.sections.length === 0) return null;
    body = {
      keyPoints: parsed.keyPoints ?? [],
      sections: parsed.sections,
      whatItMeans: parsed.whatItMeans ?? [],
    };
  } catch {
    console.warn(`[news] article "${slug}" has an unreadable body — skipping it.`);
    return null;
  }

  return { ...toArticle(it), body, sourceExcerpt: it.source_excerpt ?? null };
}

/**
 * Fetch JSON, and decide loudly what an unreachable API means.
 *
 * In a production build it throws. The tempting alternative — carry on with an
 * empty list — would build a site whose /news index is empty and whose article
 * pages have vanished, and deploying that de-indexes every article the blog has
 * earned. A failed build is recoverable in a minute; a silent de-index is not,
 * and Pages holds deleted paths at the edge for up to seven days on top.
 *
 * In `next dev` it warns and returns null, so the rest of the site is still
 * workable offline.
 */
async function getJson<T>(
  url: string,
  what: string,
  /**
   * Whether a 404 is a legitimate answer. It is for one article — the slug may
   * have been unpublished since the index was read. It is NOT for the index
   * itself: a 404 there means the endpoint is wrong, and treating that as "no
   * articles yet" would turn a misconfiguration into a silently empty blog.
   */
  notFoundIsEmpty = false,
): Promise<T | null> {
  const isProdBuild = process.env.NODE_ENV === "production";
  try {
    const res = await fetch(withBuildId(url), {
      headers: { accept: "application/json" },
    });
    if (res.status === 404 && notFoundIsEmpty) return null;
    if (!res.ok) throw new Error(`status ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    // Next signals its own control flow — static-generation bailouts, notFound,
    // redirects — by throwing tagged errors. Swallowing one and reporting it as
    // an unreachable API sends the reader of the message in exactly the wrong
    // direction. Anything carrying a digest is the framework's, not ours.
    if (err && typeof err === "object" && "digest" in err) throw err;

    const msg = `[news] could not fetch ${what} from ${url} — ${String(err)}`;
    if (isProdBuild) {
      throw new Error(
        `${msg}\n\nThe build is stopping on purpose. Publishing without the news ` +
          `API would ship an empty /news and remove every article page. Check the ` +
          `mvg-news Worker is up, then rebuild.`,
      );
    }
    console.warn(`${msg} — continuing with no news (dev only).`);
    return null;
  }
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
