export const site = {
  name: "Malaysia Visa Guide",
  // Feeds canonicals, sitemap and OG tags. Switched to the real domain at the
  // cutover (SPEC.md §10e, 2026-07-25).
  url: "https://malaysiavisaguide.com",
  description:
    "An independent guide to Malaysia's long-stay visa programmes — PVIP, MM2H, Sarawak MM2H and DE Rantau. Costs, requirements and timelines, verified against official sources.",
  // Public read-only endpoint of the news Worker (worker/). Read at BUILD time —
  // /news and every /news/<slug>/ page are prerendered from it. The build points
  // itself at a local Worker via NEWS_API_URL; see src/lib/news.ts.
  newsApi: "https://mvg-news.jason-6bf.workers.dev/api/news",
  // Cloudflare Web Analytics beacon token — cookieless, privacy-first. Public by
  // design (it ships in the page HTML). Same value as the Worker's
  // WEB_ANALYTICS_SITE_TAG, which the dashboard queries for visitor stats.
  webAnalyticsToken: "1a342e6cdad047ccb88138e3b35a6ab0",
} as const;

/**
 * Every route on the site — SPEC.md §3. Single source for the nav and the
 * generated sitemap, so a new page can't be added and then silently omitted
 * from either.
 */
export type Route = {
  path: string;
  title: string;
  /**
   * Shown in the primary nav, under the group of this name. The exception is
   * "site", which the header ignores — those routes render in the footer.
   */
  nav?: "programmes" | "work-study" | "tools" | "reading" | "site";
};

export const routes: Route[] = [
  { path: "/", title: "Home" },

  // Insights before News: the dropdown renders in this order, and the group is
  // labelled "Insights & news" to match.
  { path: "/insights/", title: "Insights", nav: "reading" },
  { path: "/news/", title: "News", nav: "reading" },

  { path: "/visas/pvip/", title: "PVIP", nav: "programmes" },
  { path: "/visas/mm2h/", title: "MM2H", nav: "programmes" },
  { path: "/visas/sarawak-mm2h/", title: "Sarawak MM2H", nav: "programmes" },

  { path: "/visas/de-rantau/", title: "DE Rantau", nav: "work-study" },
  {
    path: "/visas/employment-pass/",
    title: "Employment Pass",
    nav: "work-study",
  },
  { path: "/visas/student-pass/", title: "Student Pass", nav: "work-study" },

  { path: "/compare/", title: "Compare", nav: "tools" },
  { path: "/tools/eligibility/", title: "Eligibility checker", nav: "tools" },
  { path: "/tools/cost-calculator/", title: "Cost calculator", nav: "tools" },

  { path: "/about/", title: "About", nav: "site" },
  { path: "/editorial-policy/", title: "Editorial policy", nav: "site" },
  { path: "/contact/", title: "Contact", nav: "site" },
];

export const navRoutes = (group: Route["nav"]) =>
  routes.filter((r) => r.nav === group);

/**
 * The categorised primary nav — SPEC.md §3. Each group is a labelled dropdown
 * in the header instead of every programme sitting flat in one row. Order here
 * is the order they appear left-to-right.
 */
export type NavGroupKey = "programmes" | "work-study" | "tools" | "reading";

export const navGroups: { key: NavGroupKey; label: string }[] = [
  { key: "programmes", label: "Long-stay visas" },
  { key: "work-study", label: "Work & study" },
  { key: "tools", label: "Tools & compare" },
  // Last, so the header reads as a funnel: what the programmes are, then help
  // deciding, then what is being written about them.
  { key: "reading", label: "Insights & news" },
];
