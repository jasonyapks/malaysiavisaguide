import type { ProgrammeSlug } from "./data/programmes";
import { locales, localeOrigin, type Locale } from "./i18n";
import { linkPath } from "./translated";
import { getUi } from "./ui";

export const site = {
  name: "Malaysia Visa Guide",
  // Feeds canonicals, sitemap and OG tags. Switched to the real domain at the
  // cutover (SPEC.md §10e, 2026-07-25).
  url: localeOrigin.en,
  description:
    "An independent guide to Malaysia's long-stay visa programmes — PVIP, MM2H, Sarawak MM2H and DE Rantau. Costs, requirements and timelines, verified against official sources.",
  // There were `newsApi` and `insightsApi` URLs here, pointing at the news
  // Worker, and the build fetched both. It does not any more: since 2026-08-25
  // articles are markdown in content/, and src/lib/news.ts and
  // src/lib/insights.ts read them off disk. Nothing in src/ makes a network call
  // at build time, which is why a Worker outage can no longer fail a build.
  //
  // The Worker's origin has NOT stopped mattering — scripts/pull-images.mjs still
  // fetches /api/images from it during prebuild. That URL lives in that script,
  // next to the code that uses it.
  //
  // No Cloudflare Web Analytics token here — Cloudflare injects its own beacon at
  // the edge for this zone (site tag 6d5e4a6a…, which the Worker dashboard queries).
  // The hand-placed token that used to live here recorded nothing; removed 2026-07-28.
  // Google Analytics 4 measurement ID. Public by design (ships in the page HTML).
  // Unlike the Cloudflare beacon this one sets first-party cookies.
  //
  // Set back to G-VRPMB0841V on 2026-08-18 at Jason's instruction, replacing
  // G-PXKCPDWJET (property 547981147, "malaysiavisaguide.com" under
  // jason@mypvip.com).
  //
  // READ THIS BEFORE TRUSTING ANY GA4 NUMBER FROM THIS SITE. This same ID was
  // removed on 2026-07-31 because it resolved to no GA4 property in any account
  // Jason owned at the time: it fired on every page from 2026-07-26, and five
  // days of data went nowhere while Cloudflare Web Analytics was the only source
  // actually recording anything. A tag ID in the HTML is not evidence a property
  // is receiving hits. If Realtime in GA4 does not show this site, the ID is
  // wrong again, not the site.
  //
  // Two things now point at the OLD property and were deliberately not changed:
  //   - GA_PROPERTY_ID on the mvg-news Worker, which the dashboard traffic panel
  //     queries. It still reads 547981147, so the dashboard now reports on a
  //     property this site is no longer tagged with.
  //   - Any GA4 key-event/conversion config living on 547981147.
  // Point both at whatever property G-VRPMB0841V belongs to, or move the tag back.
  gaMeasurementId: "G-VRPMB0841V",
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
  // Sitemap only — no `nav`, on purpose. `isActive()` in SiteNav is a prefix
  // match, so a /tools/ entry in the tools dropdown would light up alongside
  // whichever tool the reader is actually on. Its internal link is the Tools
  // section heading on the home page. Added 2026-08-08 because Search Console
  // was crawling /tools/ as an inferred parent of /tools/eligibility/ and
  // getting a 404.
  { path: "/tools/", title: "Tools" },

  { path: "/about/", title: "About", nav: "site" },
  { path: "/editorial-policy/", title: "Editorial policy", nav: "site" },
  { path: "/privacy/", title: "Privacy", nav: "site" },
  { path: "/contact/", title: "Contact", nav: "site" },
];

/**
 * Each programme slug points at the guide page that documents it.
 *
 * Not one-to-one: the three MM2H tiers share a single guide, which is why a
 * guide's update date cannot be derived from a programme slug alone.
 */
export const guideHref: Record<ProgrammeSlug, string> = {
  pvip: "/visas/pvip/",
  "mm2h-silver": "/visas/mm2h/",
  "mm2h-gold": "/visas/mm2h/",
  "mm2h-platinum": "/visas/mm2h/",
  smm2h: "/visas/sarawak-mm2h/",
  "de-rantau": "/visas/de-rantau/",
  "employment-pass": "/visas/employment-pass/",
  "student-pass": "/visas/student-pass/",
};

export const navRoutes = (group: Route["nav"]) =>
  routes.filter((r) => r.nav === group);

/**
 * The same route table, resolved for a locale: titles translated and paths
 * prefixed. Every consumer that renders links — the header, the footer, the
 * 404 — goes through this rather than touching `routes` directly, so a link on
 * a Chinese page cannot silently point at the English page.
 *
 * `path` is the localised, ready-to-render href. `canonicalPath` is the
 * unprefixed English one, kept because the sitemap and the language switcher
 * both need to talk about "the same page in another language".
 */
export type LocalisedRoute = Route & { canonicalPath: string };

function localisedRoutes(locale: Locale): LocalisedRoute[] {
  const { routeTitles } = getUi(locale);
  return routes.map((r) => ({
    ...r,
    canonicalPath: r.path,
    path: linkPath(r.path, locale),
    title: routeTitles[r.path] ?? r.title,
  }));
}

export function localisedNavRoutes(
  group: Route["nav"],
  locale: Locale,
): LocalisedRoute[] {
  return localisedRoutes(locale).filter((r) => r.nav === group);
}

/**
 * Every route must have a title in every locale.
 *
 * Without this, adding a route ships it to the Chinese trees labelled in
 * English — which nobody notices, because the English site (where it was
 * added and tested) looks perfect. `localisedRoutes` falls back to the English
 * title rather than crashing a reader's page, so this assertion is the thing
 * that makes the omission loud. Called from the sitemap, which every build
 * runs.
 */
export function assertRouteTitles(): void {
  const missing: string[] = [];
  for (const locale of locales) {
    const titles = getUi(locale).routeTitles;
    for (const r of routes) {
      if (!titles[r.path]) missing.push(`${locale} → ${r.path}`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Untranslated routes in src/locales/ui/*. Add a routeTitles entry for:\n` +
        missing.map((m) => `  ${m}`).join("\n"),
    );
  }
}

/**
 * The categorised primary nav — SPEC.md §3. Each group is a labelled dropdown
 * in the header instead of every programme sitting flat in one row.
 *
 * **This array's order is the left-to-right order in the header.** `reading` is
 * last so the nav reads as a funnel: what the programmes are, then help
 * deciding, then what is being written about them.
 *
 * Keys only — the labels are in `src/locales/ui/*.ts` under `navGroups`, because
 * the header renders in three languages. There was a second copy of this list
 * here carrying English labels, unreferenced, while RootShell and
 * NotFoundContent each hardcoded the same four keys inline; both now read this.
 * A group added here appears in both, and `assertRouteTitles()` still catches a
 * route that no locale has a title for.
 */
export type NavGroupKey = "programmes" | "work-study" | "tools" | "reading";

export const navGroupKeys = [
  "programmes",
  "work-study",
  "tools",
  "reading",
] as const satisfies readonly NavGroupKey[];
