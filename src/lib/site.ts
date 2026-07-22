export const site = {
  name: "Malaysia Visa Guide",
  // Update to https://malaysiavisaguide.com at domain cutover (SPEC.md §2 —
  // deliberately deferred). Until then this is the *.pages.dev URL.
  url: "https://malaysiavisaguide.pages.dev",
  description:
    "An independent guide to Malaysia's long-stay visa programmes — PVIP, MM2H, Sarawak MM2H and DE Rantau. Costs, requirements and timelines, verified against official sources.",
} as const;

/**
 * Every route on the site — SPEC.md §3. Single source for the nav and the
 * generated sitemap, so a new page can't be added and then silently omitted
 * from either.
 */
export type Route = {
  path: string;
  title: string;
  /** Shown in the primary nav. */
  nav?: "programmes" | "tools" | "site";
};

export const routes: Route[] = [
  { path: "/", title: "Home" },

  { path: "/visas/pvip/", title: "PVIP", nav: "programmes" },
  { path: "/visas/mm2h/", title: "MM2H", nav: "programmes" },
  { path: "/visas/sarawak-mm2h/", title: "Sarawak MM2H", nav: "programmes" },
  { path: "/visas/de-rantau/", title: "DE Rantau", nav: "programmes" },

  { path: "/compare/", title: "Compare", nav: "tools" },
  { path: "/tools/eligibility/", title: "Eligibility checker", nav: "tools" },
  { path: "/tools/cost-calculator/", title: "Cost calculator", nav: "tools" },

  { path: "/about/", title: "About", nav: "site" },
  { path: "/editorial-policy/", title: "Editorial policy", nav: "site" },
  { path: "/contact/", title: "Contact", nav: "site" },
];

export const navRoutes = (group: Route["nav"]) =>
  routes.filter((r) => r.nav === group);
