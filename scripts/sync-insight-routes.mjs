#!/usr/bin/env node
/**
 * Decide whether the /insights/ dynamic routes are switched on for this build.
 *
 * Writes two booleans to .insight-routes.json; `next.config.ts` reads them and
 * composes `pageExtensions` from them. The long explanation of why the routes
 * have to be switchable at all — `output: "export"` hard-fails a dynamic route
 * that yields zero paths — is in next.config.ts, next to the code that acts on
 * it.
 *
 * ## What decides
 *
 *   article   — there is at least one document, drafts included. A draft is
 *               reviewed at its real URL, noindex and unlisted, so it needs a
 *               page even though nothing links to it.
 *   category  — at least one category with a PUBLISHED article has no literal
 *               folder in the repo. Drafts do not open a category index: an
 *               index over nothing is the thin content Search Console flags.
 *
 * ## It reads through src/lib/insights.ts, on purpose
 *
 * This script and the build have to agree about what counts as a document. They
 * used to agree by coincidence — both called the same endpoint and each parsed
 * the answer its own way — and a disagreement would have been near-invisible:
 * the routes switched off while the build still had articles to render, or on
 * while it had none. Importing the reader makes agreement structural.
 *
 * It also means every file is parsed and validated here, in prebuild, so a
 * malformed article fails before Next starts rather than midway through an
 * export.
 *
 * The old `--soft` flag is gone with the fetch it protected. It existed so
 * `npm run dev` still worked with the CMS unreachable; the content is on disk
 * now, and a missing content/ directory is a real problem in dev too.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { insights as authored } from "../src/lib/data/insights.ts";
import { getCmsIndex } from "../src/lib/insights.ts";
import { prefixedLocales } from "../src/lib/i18n.ts";
import { getNewsIndex } from "../src/lib/news.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = path.join(ROOT, ".insight-routes.json");

// Throws, with the file named, if anything under content/insights/ is missing
// or will not parse. That is the intended behaviour — see the header.
const items = await getCmsIndex();

const published = items.filter((it) => !it.draft);
const authoredCategories = new Set(authored.map((a) => a.category));

/**
 * The Chinese /news subtree switches on the same way, and for the same reason.
 *
 * It carries two dynamic routes, and a translated tree is legitimately empty
 * until the first article has been through `scripts/translate-content.mjs` —
 * on a fresh clone, and on the first build after a locale is added. The index
 * is switched with them rather than left standing: an index with nothing in it
 * would be thin content on a host that is trying to earn its own authority,
 * and it would contradict the manifest in lib/translated.ts, which only calls
 * /news/ translated once there is something there.
 *
 * EVERY translated locale must have something, not just one. The routes are
 * generated for all of `prefixedLocales` in one pass, so a locale with nothing
 * in it is still a dynamic route yielding zero paths.
 */
const translatedNews = await Promise.all(
  prefixedLocales.map(async (locale) => (await getNewsIndex(locale)).length),
);

/**
 * The translated /insights subtree switches independently of the news one: an
 * article can be translated hours before an insight is, and a route with no
 * paths fails the export either way.
 */
const translatedInsights = await Promise.all(
  prefixedLocales.map(async (locale) => (await getCmsIndex(locale)).length),
);

const flags = {
  article: items.length > 0,
  category: published.some((it) => !authoredCategories.has(it.category)),
  zhNews: translatedNews.every((n) => n > 0),
  zhInsights: translatedInsights.every((n) => n > 0),
};

/**
 * One locale translated and another empty means the Traditional tree has not
 * been generated yet, not that the site is half-translated.
 *
 * `content/zh-hant/` is gitignored and written by gen-zh-hant.mjs. When this
 * script ran before it in `prebuild`, a clean checkout counted zh-hant 0 and
 * `every(n => n > 0)` switched BOTH Chinese article routes off — so Simplified
 * was taken down by Traditional's absence, and the build succeeded. Cloudflare
 * Pages served every Chinese /news and /insights URL as a 302 to English while
 * a local build, where content/zh-hant/ survives from last time, looked
 * perfect. Nothing failed; 28 articles simply were not there.
 *
 * The order is fixed in package.json. This is the tripwire for the next time
 * something moves it: an asymmetry between locales is a generation failure, and
 * it should stop the build rather than quietly unpublish a language.
 */
function assertLocalesAgree(label, counts) {
  const translated = counts.filter((n) => n > 0).length;
  if (translated === 0 || translated === counts.length) return;
  const detail = prefixedLocales.map((l, i) => `${l} ${counts[i]}`).join(", ");
  throw new Error(
    `[insight-routes] ${label} counts disagree across locales (${detail}).\n` +
      `A locale at zero while another has documents means its tree was not ` +
      `generated — run gen-zh-hant.mjs before this script. Refusing to switch ` +
      `the Chinese ${label} route off on the strength of a missing directory.`,
  );
}

assertLocalesAgree("news", translatedNews);
assertLocalesAgree("insights", translatedInsights);

await writeFile(MARKER, JSON.stringify(flags, null, 2) + "\n");
console.log(
  `[insight-routes] ${items.length} document(s), ${published.length} published — ` +
    `article route ${flags.article ? "on" : "off"}, category route ${flags.category ? "on" : "off"}.`,
);
console.log(
  `[insight-routes] translated news per locale: ` +
    prefixedLocales.map((l, i) => `${l} ${translatedNews[i]}`).join(", ") +
    ` — Chinese /news route ${flags.zhNews ? "on" : "off"}.`,
);
console.log(
  `[insight-routes] translated insights per locale: ` +
    prefixedLocales.map((l, i) => `${l} ${translatedInsights[i]}`).join(", ") +
    ` — Chinese /insights route ${flags.zhInsights ? "on" : "off"}.`,
);
