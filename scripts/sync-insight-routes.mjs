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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = path.join(ROOT, ".insight-routes.json");

// Throws, with the file named, if anything under content/insights/ is missing
// or will not parse. That is the intended behaviour — see the header.
const items = await getCmsIndex();

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
