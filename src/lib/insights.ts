import type { InsightDoc, InsightSummary } from "@shared/insight";
import { validateInsightDoc } from "@shared/validate";
import {
  insights as authored,
  type Insight,
  type InsightCategory,
} from "@/lib/data/insights";
import { site } from "@/lib/site";

/**
 * Build-time data layer for /insights/ — the half that comes from the CMS.
 *
 * This is `src/lib/news.ts` applied to a second content type, and it copies its
 * policies rather than reinventing them: a module-level promise memo, a
 * per-build cache-buster on the URL, and a `getJson()` that **throws in a
 * production build**. Read the header comments in news.ts for why each of those
 * is the way it is; the reasoning transfers unchanged.
 *
 * One thing is genuinely different and worth stating. The blog degrades badly
 * when the API is down; /insights degrades *worse*. These are the evergreen,
 * meant-to-be-cited pages, and an unreachable API answering with an empty list
 * would not merely publish an empty index — it would delete every article path
 * from the export. Cloudflare Pages then holds those deleted paths at the edge
 * for up to seven days, serving 200s for pages that no longer exist, so even a
 * corrected redeploy does not put them back for a reader or a crawler. A failed
 * build costs a minute. That is the entire argument for the throw.
 *
 * ## Authored articles and CMS articles are the same thing
 *
 * The two hand-written articles under src/app/insights/ stay exactly where they
 * are for now (Phase 5 transcribes them). Everything that lists articles — the
 * index, the category pages, the sitemap, the browse strip — reads the merged
 * list from here, so an article's origin is invisible to every consumer. That
 * is what makes the migration a data move rather than a rewrite.
 */

/**
 * Where to read CMS articles from.
 *
 * `INSIGHTS_API_URL` overrides it so the site can be built against a local
 * `wrangler dev`, exactly as `NEWS_API_URL` does:
 *
 *   cd worker && npx wrangler dev
 *   INSIGHTS_API_URL=http://localhost:8787/api/cms/insights npm run build
 */
const INSIGHTS_API = process.env.INSIGHTS_API_URL ?? site.insightsApi;

/** Per-build cache-buster. See the long comment on BUILD_ID in news.ts. */
const BUILD_ID = Date.now().toString(36);

function withBuildId(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}b=${BUILD_ID}`;
}

/**
 * The article paths the repo owns — one per folder under src/app/insights/.
 *
 * A literal route and a dynamic sibling coexist happily under `output:
 * "export"`, and the literal wins deterministically (measured on 16.2.11; see
 * the header of src/lib/data/insights.ts). The problem is what that looks like
 * from the dashboard: publish an article whose slug matches a literal folder
 * and it simply never appears. No error, no warning, no 404, nothing in the
 * build log. A published article nobody can see and no log mentions is the
 * worst failure mode available here, so it is made loud instead.
 */
const AUTHORED_PATHS = new Set(authored.map((a) => `${a.category}/${a.slug}`));

/**
 * The categories that have a literal index page in the repo.
 *
 * Derived from the authored registry rather than listed, because the rule for
 * adding an authored article has always been "create the category index if this
 * is its first article" — so the set of categories in the registry IS the set
 * of index folders. Deriving it keeps that true without a third manual step.
 */
const AUTHORED_CATEGORIES = new Set<InsightCategory>(
  authored.map((a) => a.category),
);

export function hasAuthoredIndex(category: InsightCategory): boolean {
  return AUTHORED_CATEGORIES.has(category);
}

// --- The CMS index ---------------------------------------------------------

let indexPromise: Promise<Insight[]> | null = null;

/** Every CMS article, drafts included, in the order the API returned them. */
export function getCmsIndex(): Promise<Insight[]> {
  indexPromise ??= fetchCmsIndex();
  return indexPromise;
}

async function fetchCmsIndex(): Promise<Insight[]> {
  const data = await getJson<{ items: InsightSummary[] }>(
    INSIGHTS_API,
    "the insights index",
  );
  if (!data) return [];
  const items = (data.items ?? []).filter((it) => it.slug && it.category);
  assertNoCollisions(items);
  return items.map(toInsight);
}

/**
 * Refuse to build when the CMS claims a path the repo already owns.
 *
 * Throws rather than filtering. Filtering would be correct output and a silent
 * content bug: the article stays "published" in the dashboard forever and never
 * exists on the site, which is precisely the failure this check is here to make
 * impossible to have without noticing.
 */
function assertNoCollisions(items: { category: string; slug: string }[]): void {
  const clashes = items
    .map((it) => `${it.category}/${it.slug}`)
    .filter((path) => AUTHORED_PATHS.has(path));

  if (clashes.length === 0) return;

  throw new Error(
    `[insights] the CMS published ${clashes.length === 1 ? "an article" : "articles"} at ${clashes
      .map((p) => `/insights/${p}/`)
      .join(", ")}, but that path is a hand-written page in this repo ` +
      `(src/app/insights/${clashes[0]}/page.tsx).\n\n` +
      `A literal folder wins over the dynamic route silently — the CMS article ` +
      `would never render, and nothing in the build log would say so. The build ` +
      `is stopping instead.\n\n` +
      `Fix it one of two ways: give the CMS article a different slug, or delete ` +
      `the hand-written folder because the CMS copy is now the real one (that is ` +
      `the Phase 5 migration, and the URL is unchanged either way).`,
  );
}

/** An API row in the shape every consumer already understands. */
function toInsight(it: InsightSummary): Insight {
  return {
    slug: it.slug,
    category: it.category as InsightCategory,
    title: it.title,
    dek: it.dek,
    published: it.published,
    reviewed: it.reviewed,
    readingMinutes: it.readingMinutes,
    relatedGuides: it.relatedGuides ?? [],
    ...(it.draft && { draft: true }),
  };
}

// --- The merged view every page reads --------------------------------------

/**
 * Every published article, authored and CMS, newest first.
 *
 * Sorted by publication date. `Array.prototype.sort` is stable, and the
 * authored entries are concatenated first, so a CMS article published the same
 * day as an authored one sits below it rather than shuffling the order between
 * builds for no reason a reader could perceive.
 */
export async function publishedInsights(): Promise<Insight[]> {
  const cms = await getCmsIndex();
  return [...authored, ...cms]
    .filter((a) => !a.draft)
    .sort((a, b) => b.published.localeCompare(a.published));
}

export async function insightsByCategory(
  category: InsightCategory,
): Promise<Insight[]> {
  return (await publishedInsights()).filter((a) => a.category === category);
}

/**
 * A category has an index page iff it has at least one published article.
 *
 * Computed, where it used to be a hand-maintained `hasIndex` map in
 * src/lib/data/insights.ts. That map was the third manual step in the
 * add-an-article rule and the one most likely to be forgotten — forget it and
 * the browse strip either links at a 404 or hides a category that exists.
 * Deriving it also lights up a new category the moment its first article is
 * published from the dashboard, with nothing to remember.
 *
 * An empty index is still never published: no articles, no entry here.
 */
export async function liveInsightCategories(): Promise<
  { category: InsightCategory; articles: Insight[] }[]
> {
  const items = await publishedInsights();
  const seen: InsightCategory[] = [];
  for (const a of items) if (!seen.includes(a.category)) seen.push(a.category);
  return seen.map((category) => ({
    category,
    articles: items.filter((a) => a.category === category),
  }));
}

/** Categories whose index page the dynamic [category] route has to generate. */
export async function cmsOnlyCategories(): Promise<InsightCategory[]> {
  const live = await liveInsightCategories();
  return live
    .map((c) => c.category)
    .filter((category) => !hasAuthoredIndex(category));
}

// --- One document ----------------------------------------------------------

const docCache = new Map<string, Promise<InsightDoc | null>>();

export function getInsightDoc(
  category: string,
  slug: string,
): Promise<InsightDoc | null> {
  const key = `${category}/${slug}`;
  let p = docCache.get(key);
  if (!p) {
    p = fetchDoc(category, slug);
    docCache.set(key, p);
  }
  return p;
}

async function fetchDoc(
  category: string,
  slug: string,
): Promise<InsightDoc | null> {
  const data = await getJson<{ item: InsightDoc }>(
    `${INSIGHTS_API}/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
    `the insight "${category}/${slug}"`,
    true,
  );
  const doc = data?.item;
  if (!doc) return null;

  /**
   * Validate again here, even though the Worker validated on save.
   *
   * The row can predate the current schema, or have been written by a script,
   * or by a Worker deployed before shared/validate.ts last changed. This is the
   * last moment anything can be checked and the moment before a reader sees it
   * — and unlike the news pipeline, which skips an unreadable body and carries
   * on, a broken insight article is a page Jason believes is live. Fail the
   * build and say which article and what is wrong with it.
   */
  const errors = validateInsightDoc(doc);
  if (errors.length > 0) {
    throw new Error(
      `[insights] the stored document for /insights/${category}/${slug}/ is not valid:\n` +
        errors.map((e) => `  • ${e}`).join("\n") +
        `\n\nThe build is stopping on purpose. Publishing a half-rendered article ` +
        `is worse than not publishing it: the page would go live missing whatever ` +
        `the broken block was carrying. Fix it in the dashboard and publish again.`,
    );
  }

  return doc;
}

/**
 * Fetch JSON, and decide loudly what an unreachable API means.
 *
 * Copied from news.ts:getJson, deliberately and without softening — see the
 * header of this file for why /insights needs it more than /news does, not
 * less.
 */
async function getJson<T>(
  url: string,
  what: string,
  /**
   * Whether a 404 is a legitimate answer. It is for one article — the slug may
   * have been unpublished since the index was read. It is NOT for the index
   * itself: a 404 there means the endpoint is wrong, and treating that as "no
   * articles yet" would turn a misconfiguration into a silently empty section.
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

    const msg = `[insights] could not fetch ${what} from ${url} — ${String(err)}`;
    if (isProdBuild) {
      throw new Error(
        `${msg}\n\nThe build is stopping on purpose. Publishing without the CMS ` +
          `would remove every /insights/ article page from the export, and ` +
          `Cloudflare Pages then serves those deleted paths from the edge for up ` +
          `to seven days. Check the mvg-news Worker is up, then rebuild.`,
      );
    }
    console.warn(`${msg} — continuing with no CMS articles (dev only).`);
    return null;
  }
}
