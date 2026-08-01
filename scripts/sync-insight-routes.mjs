#!/usr/bin/env node
/**
 * Decide whether the /insights/ dynamic routes are switched on for this build.
 *
 * Writes two booleans to .insight-routes.json; `next.config.ts` reads them and
 * composes `pageExtensions` from them. The long explanation of why the routes
 * have to be switchable at all — `output: "export"` hard-fails a dynamic route
 * that yields zero paths, and Phase 4 ships with zero CMS articles — is in
 * next.config.ts, next to the code that acts on it.
 *
 * ## What decides
 *
 *   article   — the CMS has at least one document, drafts included. A draft is
 *               reviewed at its real URL, noindex and unlisted, so it needs a
 *               page even though nothing links to it.
 *   category  — at least one category with a PUBLISHED article has no literal
 *               folder in the repo. Drafts do not open a category index: an
 *               index over nothing is the thin content Search Console flags,
 *               and `comparisons` already has its own literal page.
 *
 * ## Failure policy
 *
 * Hard, matching src/lib/insights.ts and the news pipeline before it. An
 * unreachable CMS must fail the build rather than quietly switching the routes
 * off — that would delete every article path from the export, and Cloudflare
 * Pages then serves the deleted paths from the edge for up to seven days, so the
 * mistake outlives the fix by a week. A failed build costs a minute.
 *
 * `--soft` downgrades it to a warning and leaves the previous answer in place.
 * That is for `npm run dev` only, so the site is still workable offline.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { insights as authored } from "../src/lib/data/insights.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = path.join(ROOT, ".insight-routes.json");
const SOFT = process.argv.includes("--soft");

const API =
  process.env.INSIGHTS_API_URL ??
  "https://mvg-news.jason-6bf.workers.dev/api/cms/insights";

let items;
try {
  const res = await fetch(`${API}?b=${Date.now().toString(36)}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const data = await res.json();
  // The assertion pull-images.mjs learned the hard way: a 200 carrying an
  // unexpected body must never be read as "nothing published".
  if (!Array.isArray(data?.items)) throw new Error("response has no `items` array");
  items = data.items;
} catch (err) {
  const msg = `[insight-routes] could not read the CMS index from ${API} — ${err}`;
  if (SOFT) {
    console.warn(`${msg} — leaving .insight-routes.json as it is (dev only).`);
    process.exit(0);
  }
  console.error(
    `${msg}\n\nThe build is stopping on purpose. Carrying on would switch the ` +
      `/insights/ routes off and remove every article page from the export, and ` +
      `Pages serves deleted paths from the edge for up to seven days afterwards. ` +
      `Check the mvg-news Worker is up, then rebuild.`,
  );
  process.exit(1);
}

const published = items.filter((it) => !it.draft);
const authoredCategories = new Set(authored.map((a) => a.category));

const flags = {
  article: items.length > 0,
  category: published.some((it) => !authoredCategories.has(it.category)),
};

await writeFile(MARKER, JSON.stringify(flags, null, 2) + "\n");
console.log(
  `[insight-routes] ${items.length} document(s), ${published.length} published — ` +
    `article route ${flags.article ? "on" : "off"}, category route ${flags.category ? "on" : "off"}.`,
);
