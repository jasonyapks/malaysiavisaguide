import type { MetadataRoute } from "next";
import {
  categoryPath as insightCategoryPath,
  insightPath,
} from "@/lib/data/insights";
import { liveInsightCategories, publishedInsights } from "@/lib/insights";
import { categoryPath, getCategoryIndex, getNewsIndex } from "@/lib/news";
import { assertRouteTitles, routes, site } from "@/lib/site";
import { htmlLang, locales, localeUrl, type Locale } from "@/lib/i18n";
import { availableLocales } from "@/lib/translated";

/**
 * One sitemap per host — SPEC.md §4.4.
 *
 * ## Why this is not one sitemap listing all three hosts
 *
 * It used to be. Google only reads sitemap entries for hostnames you have
 * verified, unless *every* host in the file is verified in the same Search
 * Console account — "cross-submission". A single apex sitemap listing
 * `cn.` and `tw.` URLs therefore made indexing of the entire Chinese site
 * depend on a console setting nobody can see from the repo, and the failure is
 * silent: the sitemap fetches fine and the URLs are quietly ignored.
 *
 * So each host now gets a sitemap of its own URLs, served from its own origin.
 * Cross-submission never arises and no verification is required for the
 * sitemap to work. Verifying the subdomains is still worth doing for the
 * reporting, but it is no longer load-bearing.
 *
 * ## What still points across hosts, and why that is fine
 *
 * The `alternates.languages` block on every entry names all three hosts. That
 * is *hreflang*, not cross-submission — annotating a URL with its counterparts
 * on other domains is the documented way to do a multi-host multilingual site,
 * and the rule it must satisfy is reciprocity, not verification. Each host's
 * sitemap declares the same complete group, so the return tags agree whichever
 * file Google reads first.
 */
export async function sitemapEntries(
  locale: Locale,
): Promise<MetadataRoute.Sitemap> {
  // Every build runs a sitemap, which makes this the cheapest place to hang the
  // check that no route has shipped without a title in all three locales.
  assertRouteTitles();

  /**
   * Static pages that exist in THIS locale, each carrying the `alternates`
   * block for its whole language group.
   *
   * The sitemap is the second place hreflang can be declared (the first is the
   * <link> tags `pageMetadata()` emits) and Google reads both. Stating it twice
   * is not redundant: the tags are per-page and easy to get wrong one page at a
   * time, while this is generated from one loop over the route table, so a page
   * whose tags are missing is still discovered as part of its group.
   */
  const pages: MetadataRoute.Sitemap = routes
    .filter((r) => availableLocales(r.path).includes(locale))
    .map((r) => ({
      url: localeUrl(r.path, locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      // The English page stays the primary one. A translation of the home page
      // is not a second 1.0-priority page on the site.
      priority: r.path === "/" ? (locale === "en" ? 1 : 0.9) : 0.8,
      alternates: {
        languages: Object.fromEntries(
          availableLocales(r.path).map((l) => [htmlLang[l], localeUrl(r.path, l)]),
        ),
      },
    }));

  // Everything below is English-only: the CMS has no locale dimension, so there
  // are no translated articles to list. A Chinese host's sitemap ends here
  // rather than listing English URLs it does not serve — those belong to the
  // apex's sitemap, which is exactly the separation this file exists to keep.
  if (locale !== "en") return pages;

  // Each article carries its own real lastModified, not the build time — a news
  // page whose date moves on every deploy teaches a crawler to ignore the date.
  const articles = await getNewsIndex();
  const news: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${site.url}/news/${a.slug}/`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt ?? Date.now()),
    // Once written, an article is finished. Only a correction changes it.
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Category indexes. Each one's lastModified is its newest story's, so the
  // date says something true — a category only changes when a story lands in
  // it, and stamping the build time here would teach a crawler to ignore the
  // date on every page in the sitemap, articles included.
  const categories = await getCategoryIndex();
  const categoryPages: MetadataRoute.Sitemap = categories.map(
    ({ category, articles }) => ({
      url: `${site.url}${categoryPath(category)}`,
      lastModified: new Date(
        Math.max(
          ...articles.map((a) =>
            new Date(a.updatedAt ?? a.publishedAt ?? 0).getTime(),
          ),
          0,
        ),
      ),
      changeFrequency: "weekly",
      // Above an article, below the guides: it is an index, and it is the page
      // that should rank for "<programme> news".
      priority: 0.7,
    }),
  );

  // Authored articles. Priority above a news story and below a programme guide:
  // evergreen and meant to be cited, but the guides are still the reference.
  // Drafts are excluded by `published()`, which is the whole point of the flag.
  const insights = await publishedInsights();
  const insightPages: MetadataRoute.Sitemap = insights.map((a) => ({
    url: `${site.url}${insightPath(a)}`,
    lastModified: new Date(a.reviewed),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const insightCategories: MetadataRoute.Sitemap = (
    await liveInsightCategories()
  ).map(({ category, articles }) => ({
    url: `${site.url}${insightCategoryPath(category)}`,
    // The newest article's review date, for the same reason the news category
    // pages use theirs: a date that moves on every deploy teaches a crawler to
    // ignore every date in the sitemap.
    lastModified: new Date(
      Math.max(...articles.map((a) => new Date(a.reviewed).getTime()), 0),
    ),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...pages,
    ...categoryPages,
    ...news,
    ...insightCategories,
    ...insightPages,
  ];
}

/**
 * `robots.txt` — one file, served on every host.
 *
 * SPEC.md §4.4 — AI crawlers are allowed on purpose. Being cited by assistants
 * is a primary goal of this site, not a side effect to be defended against.
 *
 * ## Why one file rather than one per host
 *
 * Next only emits `robots.txt` from the app root; a nested `robots.ts` builds
 * without complaint and produces nothing, which is a quiet way to ship a host
 * whose sitemap is advertised nowhere. So this lists all three sitemaps
 * instead, and the middleware lets the same file serve on every host.
 *
 * That is not the cross-submission problem again. Each sitemap lives on the
 * host whose URLs it contains — `cn.…/sitemap.xml` lists only `cn.` URLs — so
 * every one of them is valid on its own terms. robots.txt is only how they get
 * discovered, and a `Sitemap:` line naming another host is ordinary.
 */
export function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
      },
    ],
    sitemap: locales.map((l) => localeUrl("/sitemap.xml", l)),
  };
}
