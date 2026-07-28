/**
 * The registry for /insights/ — Jason's own authored articles, as distinct from
 * the six programme guides under /visas/ and the aggregated feed under /news/.
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
 * ## Why there are no dynamic segments here
 *
 * Every article and every category index is a real folder under src/app/insights/.
 * A [category] segment cannot coexist with a literal `comparisons` folder at the
 * same level — the literal wins and the dynamic route would never match it — and
 * a static export has already bitten this project once over dynamic routes that
 * generate zero paths (see the note in src/app/news/[slug]/page.tsx). Literal
 * folders cost one file each and cannot fail at build time.
 *
 * ## The rule for adding an article
 *
 * 1. Add its entry to `insights` below.
 * 2. Create src/app/insights/<category>/<slug>/page.tsx.
 * 3. If that is the category's FIRST article, create
 *    src/app/insights/<category>/page.tsx too — see `hasIndex` below.
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
  | "perspective";

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
};

/** The h1 of the category's own index page. */
export const CATEGORY_TITLE: Record<InsightCategory, string> = {
  comparisons: "Comparisons and decision guides",
  "by-nationality": "Malaysia visas by nationality",
  "expat-living": "Expat living, tax and money",
  perspective: "From the desk",
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
};

/**
 * Which categories have an index page built.
 *
 * An index with a heading and no articles under it is the thin content Search
 * Console flags, so a category page is created when its first article lands,
 * not in advance. This flag exists so /insights can render the browse strip
 * without linking at a 404 — keep it in step with the folders under
 * src/app/insights/.
 */
export const hasIndex: Record<InsightCategory, boolean> = {
  comparisons: true,
  "by-nationality": false,
  "expat-living": false,
  perspective: false,
};

/**
 * Launched 2026-07-27, once Jason supplied the PVIP 2026 figures and the
 * `superseded` mechanism in programmes.ts gave them a declared source.
 *
 * Adding an article: entry here, folder under src/app/insights/<category>/, and
 * a category index page if it is that category's first. Set `draft: true` while
 * a figure in the body is still unconfirmed — a draft is reviewable at its real
 * URL in `next dev`, is noindex, and stays out of the sitemap and every listing.
 *
 * Newest first. This order is the order /insights renders.
 */
export const insights: Insight[] = [
  {
    slug: "mm2h-platinum-vs-pvip",
    category: "comparisons",
    title:
      "MM2H Platinum vs. PVIP: Which 20-Year Malaysia Visa Actually Costs Less?",
    dek: "Both run twenty years, both charge RM200,000, and since December 2025 both let you work — so the tiebreaker everyone still quotes is gone. One question separates them: whether you can prove RM40,000 a month. If you can, PVIP locks a fraction of the capital. If you cannot, PVIP is shut at any price.",
    published: "2026-07-28",
    reviewed: "2026-07-28",
    readingMinutes: 7,
    relatedGuides: [
      { path: "/visas/pvip/", title: "the PVIP guide" },
      { path: "/visas/mm2h/", title: "the MM2H guide" },
    ],
  },
  {
    slug: "mm2h-vs-pvip-vs-de-rantau",
    category: "comparisons",
    title: "MM2H vs. PVIP vs. DE Rantau: Which Malaysia Visa Fits Your Income?",
    dek: "Only one of the three qualifies you on income alone. One tests income and capital together. The third does not test income at all — which is the fact that decides this for most people.",
    published: "2026-07-27",
    reviewed: "2026-07-27",
    readingMinutes: 8,
    relatedGuides: [
      { path: "/visas/mm2h/", title: "the MM2H guide" },
      { path: "/visas/pvip/", title: "the PVIP guide" },
      { path: "/visas/de-rantau/", title: "the DE Rantau guide" },
    ],
  },
];

/** What the public site is allowed to list, link and submit to a sitemap. */
export const published = (): Insight[] => insights.filter((a) => !a.draft);

export function insightPath(a: Pick<Insight, "category" | "slug">): string {
  return `/insights/${a.category}/${a.slug}/`;
}

export function categoryPath(category: InsightCategory): string {
  return `/insights/${category}/`;
}

export function byCategory(category: InsightCategory): Insight[] {
  return published().filter((a) => a.category === category);
}

/**
 * Categories that have at least one article AND an index page, in registry
 * order. Feeds the browse strip on /insights and every category page.
 */
export function liveCategories(): {
  category: InsightCategory;
  articles: Insight[];
}[] {
  const seen: InsightCategory[] = [];
  for (const a of published()) {
    if (!seen.includes(a.category) && hasIndex[a.category]) seen.push(a.category);
  }
  return seen.map((category) => ({ category, articles: byCategory(category) }));
}
