#!/usr/bin/env node
/**
 * Pull every article waiting on the real /humanizer skill into local JSON files.
 *
 * The Worker's own humanize pass is a condensed version of the skill running on
 * gpt-oss-120b. It is good enough that a draft reads properly the moment it is
 * written, and not good enough to be the last word — so it flags what it touched
 * with polish_state = 'needs-claude'. This script is the near side of that
 * handover.
 *
 * Goes through `wrangler d1 execute --remote` rather than the admin API on
 * purpose: wrangler is already OAuth'd, and the API sits behind Cloudflare
 * Access, which would mean provisioning a service token to read our own rows.
 *
 *   node worker/scripts/pull-drafts.mjs
 *
 * Writes worker/.drafts/<id>.json, one per article. Edit the prose in those
 * files, then push each back with push-polish.mjs.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WORKER_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(WORKER_DIR, ".drafts");

const SQL = `SELECT id, slug, headline, dek, body, source_name, source_url,
                    source_text, article_model, origin
               FROM news_items
              WHERE polish_state = 'needs-claude'
              ORDER BY COALESCE(updated_at, created_at) DESC`;

const raw = execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "mvg-news", "--remote", "--json", "--command", SQL],
  { cwd: WORKER_DIR, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
);

// wrangler prints its own chatter before the JSON on some versions. Take the
// outermost bracket pair rather than trusting the whole of stdout to parse.
const start = raw.indexOf("[");
const end = raw.lastIndexOf("]");
if (start === -1 || end <= start) {
  console.error("Could not find JSON in wrangler's output:\n" + raw.slice(0, 2000));
  process.exit(1);
}
const rows = JSON.parse(raw.slice(start, end + 1))[0]?.results ?? [];

if (!rows.length) {
  console.log("Nothing waiting on the humanizer.");
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const row of rows) {
  // body is stored as a JSON string. Inline it so the file is one document to
  // edit, not a document with a string of JSON buried in it.
  const draft = { ...row, body: JSON.parse(row.body) };
  const json = JSON.stringify(draft, null, 2) + "\n";
  writeFileSync(join(OUT_DIR, `${row.id}.json`), json);
  // An untouched copy. push-polish.mjs diffs the figures against it before
  // writing anything back — on a site whose whole proposition is that its
  // numbers are checked, a rewrite that quietly drops RM200,000 is the one
  // failure that actually costs something.
  writeFileSync(join(OUT_DIR, `${row.id}.baseline.json`), json);
  console.log(`${row.id}  ${row.slug ?? "(no slug)"}  ${row.headline}`);
}

console.log(`\n${rows.length} draft(s) in worker/.drafts/.`);
console.log("Humanize the prose in each, then: node worker/scripts/push-polish.mjs <id>");
