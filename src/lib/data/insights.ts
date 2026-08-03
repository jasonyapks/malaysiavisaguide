/**
 * The registry for /insights/ — the articles that are still hand-written .tsx,
 * as distinct from the six programme guides under /visas/, the aggregated feed
 * under /news/, and the CMS-authored articles that now arrive from the Worker
 * (src/lib/insights.ts).
 *
 * This list only shrinks. Every new article is written in the dashboard; the two
 * below are transcribed into blocks in Phase 5, at which point their folders are
 * deleted and their URLs do not change.
 *
 * Three sections, three jobs:
 *   /visas/*    reference. What a programme is. Structurally identical pages.
 *   /news/*     what changed. Machine-fed from the Worker, dated, perishable.
 *   /insights/* what Jason thinks. Comparison, decision, first-person. Evergreen.
 *
 * ## Why the URL carries the category
 *
 * Articles live at /insights/<category>/<slug>/ rather than /insights/<slug>/.
 * That was Jason's call (2026-07-27) and it buys a keyword-bearing URL and a
 * breadcrumb that needs no lookup. The cost is real and worth writing down:
 * **recategorising an article changes its URL**, and Cloudflare Pages holds a
 * deleted path at the edge for up to seven days, so the old URL will keep
 * serving 200 long after the rebuild. Pick the category once.
 *
 * ## Literal folders and the dynamic route DO coexist
 *
 * This file used to claim the opposite — that "a [category] segment cannot
 * coexist with a literal `comparisons` folder at the same level; the literal
 * wins and the dynamic route would never match it". The first half is false and
 * the second is true only of the one colliding path. Measured on Next 16.2.11
 * (2026-07-31): a dynamic route adds new children into a directory that already
 * has literal children, and where a param collides with a literal the literal
 * wins **deterministically** — Next scores segment specificity (static 0,
 * `[param]` 1) and drops the colliding param from the dynamic prerender set
 * before rendering, so it is not a last-writer race. The static page count did
 * not move when a colliding param was added. There is already a precedent
 * shipping in this repo: `news/[slug]` sits beside literal `news/category/`.
 *
 * What is true, and is the reason this note matters: a colliding CMS article
 * vanishes **silently**. No error, no warning, no 404, nothing in the build log.
 * So `assertNoCollisions()` in src/lib/insights.ts throws instead of filtering.
 *
 * ## The rule for adding an article
 *
 * Write it in the dashboard. Nothing here changes.
 *
 * For the two hand-written articles that remain:
 * 1. Their entry is in `insights` below.
 * 2. Their folder is src/app/insights/<category>/<slug>/page.tsx.
 * 3. Their category has a literal index at src/app/insights/<category>/page.tsx
 *    — and that folder's existence is what `hasAuthoredIndex()` derives from,
 *    so there is no separate flag to keep in step any more.
 *
 * Figures in article prose come from `programmes.ts` via the format helpers,
 * never typed as literals. §4.1 applies here exactly as it does to a guide page:
 * the reason the PVIP staleness of July 2026 was expensive is that RM40,000 was
 * hardcoded into JSX in four places.
 */

export type InsightCategory =
  | "comparisons"
  | "by-nationality"
  | "expat-living"
  | "perspective"
  | "how-to";

export type Insight = {
  slug: string;
  category: InsightCategory;
  /** The h1 and the card title. */
  title: string;
  /** Standfirst, and the meta description. Written to stand alone in a SERP. */
  dek: string;
  /** ISO date first published. */
  published: string;
  /** ISO date of the last substantive review. Drives the byline. */
  reviewed: string;
  readingMinutes: number;
  /** Programme guides this article should hand the reader on to. */
  relatedGuides: { path: string; title: string }[];
  /**
   * Written, reviewable at its real URL in `next dev`, and deliberately not
   * launched: a draft is noindex, is left out of the sitemap, and does not
   * appear in any listing. Set to false only when every figure in the body is
   * sourced — see LAUNCH below.
   */
  draft?: boolean;
};

export const CATEGORY_LABEL: Record<InsightCategory, string> = {
  comparisons: "Comparisons",
  "by-nationality": "By nationality",
  "expat-living": "Expat living",
  perspective: "From the desk",
  "how-to": "How-to",
};

/** The h1 of the category's own index page. */
export const CATEGORY_TITLE: Record<InsightCategory, string> = {
  comparisons: "Comparisons and decision guides",
  "by-nationality": "Malaysia visas by nationality",
  "expat-living": "Expat living, tax and money",
  perspective: "From the desk",
  "how-to": "How to apply, step by step",
};

/**
 * Each category index's standfirst and meta description.
 *
 * Written per category rather than generated from the label, for the same reason
 * the news blurbs are: a category page described as "Articles about comparisons"
 * competes with /insights and the guides for the same terms and deserves to lose
 * to both.
 */
export const CATEGORY_BLURB: Record<InsightCategory, string> = {
  comparisons:
    "Side-by-side decisions rather than feature lists — which programme actually fits a given income, a given pile of capital, and a given plan for the next twenty years.",
  "by-nationality":
    "What changes when the passport changes: documentation, visa fees rated by nationality, and the parts of an application that behave differently depending on where you are from.",
  "expat-living":
    "The questions that arrive straight after the visa question — tax residency and offshore income, property thresholds by state, opening a bank account, schools and healthcare.",
  perspective:
    "First-person notes from running two licensed Malaysian long-stay agencies — where the published rules and the counter behave differently, and what that costs an applicant.",
  "how-to":
    "The application itself, in the order it actually happens — what has to be in hand before you file, what only unlocks after approval, and the steps that must be done inside Malaysia rather than from home.",
};

/*
 * `hasIndex` used to live here — a hand-maintained map of which categories had
 * an index page built. It is gone, and is now computed: a category has an index
 * iff it has at least one published article, from either source. See
 * `liveInsightCategories()` in src/lib/insights.ts.
 *
 * The rule it encoded still holds — an index with a heading and no articles
 * under it is the thin content Search Console flags — but a flag someone has to
 * remember to flip is the wrong way to hold it. Forget it and the browse strip
 * either links at a 404 or hides a category that exists, and neither shows up
 * in a build.
 */

/**
 * Empty since the Phase 5 migration (2026-08-02), and that is the finished
 * state rather than a gap.
 *
 * Both comparison articles that used to live here are CMS documents now, at
 * the same URLs, with every figure still a `fig` node resolved from
 * programmes.ts at build. Their folders under src/app/insights/comparisons/
 * went in the same commit — deleting one without the other is the silent
 * failure `assertNoCollisions()` in src/lib/insights.ts exists to catch, and
 * a literal folder left behind would win over the CMS copy with nothing in
 * the build log to say so.
 *
 * Nothing should be added back. A new article is written in the dashboard.
 * The type, the labels and the blurbs below are still live — they describe
 * every article, whichever side it is authored on.
 */
export const insights: Insight[] = [];

export function insightPath(a: Pick<Insight, "category" | "slug">): string {
  return `/insights/${a.category}/${a.slug}/`;
}

export function categoryPath(category: InsightCategory): string {
  return `/insights/${category}/`;
}

/*
 * `published()`, `byCategory()` and `liveCategories()` moved to
 * src/lib/insights.ts and became async, because the answer now depends on a
 * fetch. They are not re-exported here on purpose: a synchronous accessor left
 * in place would keep compiling and would quietly answer with the two
 * hand-written articles and nothing else.
 */
