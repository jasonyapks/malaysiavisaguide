#!/usr/bin/env node
/**
 * Parse and validate every file under content/, and say what is there.
 *
 * The point is *when* it runs. A bad shortcode or a figure token that will not
 * resolve used to be caught mid-export, in a build log, minutes after the save
 * that caused it. Run this on save — or in the editor's own check — and the
 * same mistake is caught while the person who made it is still looking at it.
 *
 *   npm run content:check
 *
 * It reads through src/lib/insights.ts and src/lib/news.ts rather than opening
 * the files itself, so what it accepts is exactly what the build accepts. A
 * checker with its own parser is a checker that eventually disagrees.
 *
 * Insights throw on anything invalid; news warns and skips. That asymmetry is
 * deliberate and both files explain it: an insight article is an evergreen page
 * Jason believes is live, and the blog fills from a cron where one malformed
 * item must not stop the other nineteen.
 */
import process from "node:process";

import { prefixedLocales } from "../src/lib/i18n.ts";
import { getCmsIndex } from "../src/lib/insights.ts";
import { getNewsIndex } from "../src/lib/news.ts";

const insights = await getCmsIndex();
const news = await getNewsIndex();

const drafts = insights.filter((a) => a.draft);
const byCategory = new Map();
for (const a of insights) {
  byCategory.set(a.category, (byCategory.get(a.category) ?? 0) + 1);
}

console.log(`insights: ${insights.length} article(s), ${drafts.length} draft(s)`);
for (const [category, n] of [...byCategory].sort()) {
  console.log(`  ${category}: ${n}`);
}
for (const d of drafts) {
  console.log(`  draft — /insights/${d.category}/${d.slug}/`);
}

console.log(`news:     ${news.length} article(s)`);

/**
 * Translation coverage, reported and never enforced.
 *
 * A gap here is the normal state for a few minutes after an article is
 * published — the reconciler runs on the push that publishes it, one build
 * behind. Failing on it would block the English article going live over a
 * Chinese page nobody has yet. `scripts/translate-content.mjs --check` says
 * which files are outstanding; this says how many.
 */
for (const locale of prefixedLocales) {
  const n = await getNewsIndex(locale);
  const i = await getCmsIndex(locale);
  console.log(
    `${locale}:  ${n.length}/${news.length} news, ${i.length}/${insights.length} insights translated`,
  );
}

if (insights.length === 0 || news.length === 0) {
  console.error("\nA section came back empty. That is never intentional here.");
  process.exit(1);
}

console.log("\nEvery file parsed and validated.");
