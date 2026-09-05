#!/usr/bin/env node
/**
 * Write the list of content paths that exist in every translated locale.
 *
 * Read by `isTranslated()` in src/lib/translated.ts, which the language
 * switcher, `linkPath()` and every page's `hreflang` all go through. The static
 * routes are a hand-maintained set in that file; this covers the part that
 * cannot be hand-maintained — `/news/<slug>/` and the category indexes, which
 * arrive daily and are translated a few minutes after they are published.
 *
 * ## Why "in EVERY translated locale"
 *
 * `hreflang` is a mutual claim: naming a URL that does not exist gets the whole
 * cluster dropped with "no return tag". Traditional is generated from
 * Simplified so the two agree in practice, but the intersection is what makes
 * that a property of the data rather than an assumption.
 *
 * ## It reads through src/lib/news.ts, on purpose
 *
 * The same argument `sync-insight-routes.mjs` makes: this file and the build
 * have to agree about what a published article is, and importing the reader is
 * the only way to guarantee they do.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  categoryPath as insightCategoryPath,
  insightPath,
} from "../src/lib/data/insights.ts";
import { prefixedLocales } from "../src/lib/i18n.ts";
import { liveInsightCategories, publishedInsights } from "../src/lib/insights.ts";
import { categoryPath, getCategoryIndex, getNewsIndex } from "../src/lib/news.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "lib", "data", "translated-content.json");

/**
 * Every content path a locale actually serves.
 *
 * The two sections are independent: news can be translated while insights are
 * not, and the routes for each are switched separately, so an index is listed
 * only when its own section has something in it.
 */
async function pathsFor(locale) {
  const paths = new Set();

  const articles = await getNewsIndex(locale);
  if (articles.length > 0) {
    paths.add("/news/");
    for (const a of articles) paths.add(`/news/${a.slug}/`);
    for (const { category } of await getCategoryIndex(locale)) {
      paths.add(categoryPath(category));
    }
  }

  // Drafts are excluded by publishedInsights(), which is the point of the flag:
  // a draft is noindex and unlisted, so claiming a translation of it in hreflang
  // would be claiming a page no crawler is allowed to see.
  const insights = await publishedInsights(locale);
  if (insights.length > 0) {
    paths.add("/insights/");
    for (const a of insights) paths.add(insightPath(a));
    for (const { category } of await liveInsightCategories(locale)) {
      paths.add(insightCategoryPath(category));
    }
  }

  return paths;
}

const sets = [];
for (const locale of prefixedLocales) sets.push(await pathsFor(locale));

const [first, ...rest] = sets;
const shared = [...first].filter((p) => rest.every((s) => s.has(p))).sort();

await writeFile(OUT, `${JSON.stringify({ paths: shared }, null, 2)}\n`);
console.log(
  `emit-translated-content: ${shared.length} path(s) translated in all ${prefixedLocales.length} locale(s).`,
);
