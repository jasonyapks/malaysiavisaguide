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
  // Public read-only endpoint for CMS-authored /insights/ articles, on the same
  // Worker. Read at BUILD time, like the news API, and subject to the same rule:
  // if it is unreachable the build fails rather than shipping an empty section.
  // Override with INSIGHTS_API_URL; see src/lib/insights.ts.
  insightsApi: "https://mvg-news.jason-6bf.workers.dev/api/cms/insights",
  // No Cloudflare Web Analytics token here — Cloudflare injects its own beacon at
  // the edge for this zone (site tag 6d5e4a6a…, which the Worker dashboard queries).
  // The hand-placed token that used to live here recorded nothing; removed 2026-07-28.
  // Google Analytics 4 measurement ID. Public by design (ships in the page HTML).
  // Unlike the Cloudflare beacon this one sets first-party cookies.
  //
  // Corrected 2026-07-31. The previous value, G-VRPMB0841V, belonged to no GA4
  // property in any account Jason owns — the tag fired on every page from
  // 2026-07-26 and the data went nowhere, so five days of "we have Google
  // Analytics now" collected nothing. Cloudflare Web Analytics was the only
  // working source that whole time, which is the reason it is still here.
  //
  // This one is property 547981147 ("malaysiavisaguide.com", account "Malaysia
  // Visa Guide" under jason@mypvip.com) — the same property the Worker's traffic
  // panel queries via GA_PROPERTY_ID. If you change one, change both, or the
  // dashboard will report on a property the site is not tagged with.
  gaMeasurementId: "G-PXKCPDWJET",
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
  { path: "/privacy/", title: "Privacy", nav: "site" },
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
