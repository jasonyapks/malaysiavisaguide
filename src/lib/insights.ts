import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { InsightDoc } from "@shared/insight";
import { splitContentFile } from "@shared/frontmatter";
import { parseBody } from "@shared/markdown";
import { validateInsightDoc } from "@shared/validate";
import {
  insights as authored,
  type Insight,
  type InsightCategory,
} from "@/lib/data/insights";

/**
 * Build-time data layer for /insights/ — the half that comes from the CMS.
 *
 * Articles are markdown files under content/insights/<category>/<slug>.md.
 * They used to be rows in D1, fetched over HTTP at build; the fetch is gone and
 * the reasoning it carried is not.
 *
 * **The empty case still throws.** These are the evergreen, meant-to-be-cited
 * pages, and a build that read zero articles would not merely publish an empty
 * index — it would delete every article path from the export. Cloudflare Pages
 * then holds those deleted paths at the edge for up to seven days, serving 200s
 * for pages that no longer exist, so even a corrected redeploy does not put them
 * back for a reader or a crawler. A missing directory or an empty one is a
 * mistake, never an intention. A failed build costs a minute.
 *
 * What changes is which mistakes are possible. An unreachable Worker, a 200
 * carrying the wrong body, a stale cache and a two-step publish all stop being
 * failure modes, because the content is on disk next to the code that renders
 * it and arrives in the same commit.
 *
 * ## Authored articles and CMS articles are the same thing
 *
 * `src/lib/data/insights.ts` is the registry of articles written as literal
 * `.tsx` folders. It is empty and meant to stay that way. Everything that lists
 * articles — the index, the category pages, the sitemap, the browse strip —
 * reads the merged list from here, so an article's origin is invisible to every
 * consumer. That is what let the content move twice without a consumer changing.
 */

/**
 * Where the articles live.
 *
 * Resolved from `process.cwd()` rather than from `import.meta.url`, because
 * this module is bundled before it runs and the bundle's location is a build
 * detail. Next runs the build from the project root, which is where content/
 * sits.
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "insights");

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

let docsPromise: Promise<InsightDoc[]> | null = null;

/**
 * Every article on disk, drafts included, read once per build.
 *
 * One read serves the index, every article page and the sitemap. The old shape
 * had an index endpoint and a per-document endpoint and a cache for each; a
 * directory is small enough that reading all of it is simpler and cannot get
 * the two out of step.
 */
function getDocs(): Promise<InsightDoc[]> {
  docsPromise ??= readDocs();
  return docsPromise;
}

/** Every CMS article, drafts included, ordered by category then slug. */
export async function getCmsIndex(): Promise<Insight[]> {
  return (await getDocs()).map(toInsight);
}

async function readDocs(): Promise<InsightDoc[]> {
  let categories: string[];
  try {
    const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
    categories = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch (err) {
    throw new Error(
      `[insights] could not read ${CONTENT_DIR} — ${String(err)}\n\n` +
        `That directory holds every article on the site. The build is stopping ` +
        `rather than\nexporting a site with no /insights/ pages — see the header ` +
        `of this file for what\nPages does with paths that disappear from an ` +
        `export.`,
    );
  }

  const docs: InsightDoc[] = [];
  for (const category of categories) {
    const dir = path.join(CONTENT_DIR, category);
    const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
    for (const file of files) docs.push(await readDoc(category, file));
  }

  if (docs.length === 0) {
    throw new Error(
      `[insights] ${CONTENT_DIR} contains no articles.\n\n` +
        `An empty section is never the intention here, and shipping one would ` +
        `delete every\narticle path from the export. Restore the files, or ` +
        `revert whatever removed them.`,
    );
  }

  assertNoCollisions(docs);
  return docs;
}

// --- One file --------------------------------------------------------------

function str(v: unknown): string {
  return typeof v === "string" ? v : v === undefined ? "" : String(v);
}

function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v) || 0;
}

/** A frontmatter list of flat mappings, or nothing if the key was absent. */
function mappings(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v)
    ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    : [];
}

/**
 * Read one file into an `InsightDoc`, and validate it.
 *
 * The validation is not belt-and-braces. A file can be hand-edited, written by
 * an editor against an older schema, or land in a merge nobody rebuilt — and
 * unlike the news pipeline, which skips an unreadable body and carries on, a
 * broken insight article is a page Jason believes is live. Fail the build and
 * name the file and what is wrong with it.
 */
async function readDoc(category: string, file: string): Promise<InsightDoc> {
  const rel = path.posix.join("content", "insights", category, file);
  const raw = await readFile(path.join(CONTENT_DIR, category, file), "utf8");
  const { data, body } = splitContentFile(raw);

  const doc = {
    slug: file.replace(/\.md$/, ""),
    category,
    title: str(data.title),
    dek: str(data.dek),
    published: str(data.published),
    reviewed: str(data.reviewed),
    readingMinutes: num(data.readingMinutes),
    relatedGuides: mappings(data.relatedGuides).map((g) => ({
      path: str(g.path),
      title: str(g.title),
    })),
    ...(data.draft === true && { draft: true }),
    blocks: parseBody(body),
    faq: mappings(data.faq).map((f) => ({ q: str(f.q), a: str(f.a) })),
    sources: mappings(data.sources).map((x) => ({
      label: str(x.label),
      url: str(x.url),
      verified: str(x.verified),
    })),
  } as InsightDoc;

  const errors = validateInsightDoc(doc);
  if (errors.length > 0) {
    throw new Error(
      `[insights] ${rel} is not a valid article:\n` +
        errors.map((e) => `  \u2022 ${e}`).join("\n") +
        `\n\nThe build is stopping on purpose. Publishing a half-rendered ` +
        `article is worse than\nnot publishing it: the page would go live ` +
        `missing whatever the broken block was\ncarrying.`,
    );
  }
  return doc;
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

/** A document in the summary shape every consumer already understands. */
function toInsight(it: InsightDoc): Insight {
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

/**
 * One article, or null if that path has no file.
 *
 * Null is reachable only through a stale link — `generateStaticParams` builds
 * its list from the same read — so it stays a 404 rather than a throw.
 */
export async function getInsightDoc(
  category: string,
  slug: string,
): Promise<InsightDoc | null> {
  const docs = await getDocs();
  return docs.find((d) => d.category === category && d.slug === slug) ?? null;
}
