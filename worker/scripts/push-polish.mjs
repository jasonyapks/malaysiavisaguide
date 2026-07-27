#!/usr/bin/env node
/**
 * Push a humanized draft back to D1 and clear it off the queue.
 *
 *   node worker/scripts/push-polish.mjs <id>
 *   node worker/scripts/push-polish.mjs --all
 *
 * Only the prose moves: headline, dek, body. Not the slug (an indexed URL must
 * not shift under a rewrite), not source_url or source_name (the citation
 * belongs to whatever was actually read), and not source_excerpt — that is a
 * real quotation from a publisher, and editing it would put words in their
 * mouth. The humanizer must never have been given it in the first place.
 *
 * The SQL is written to a temp file rather than passed with --command, because
 * article prose is full of quotes and apostrophes and shell quoting is the wrong
 * place to find that out. String literals are escaped by doubling single quotes,
 * which is SQLite's own rule.
 */

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WORKER_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRAFTS_DIR = join(WORKER_DIR, ".drafts");

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node worker/scripts/push-polish.mjs <id> | --all");
  process.exit(1);
}

const ids =
  arg === "--all"
    ? readdirSync(DRAFTS_DIR)
        .filter((f) => f.endsWith(".json") && !f.endsWith(".baseline.json"))
        .map((f) => f.slice(0, -5))
    : [arg];

for (const id of ids) push(id);

function push(id) {
  const path = join(DRAFTS_DIR, `${id}.json`);
  const draft = JSON.parse(readFileSync(path, "utf8"));

  const problem = check(draft) || figuresLost(id, draft);
  if (problem) {
    console.error(`✗ ${id}: ${problem}`);
    console.error("  Nothing written. Fix the draft and run this again.");
    process.exitCode = 1;
    return;
  }

  const words = draft.body.sections
    .flatMap((s) => s.paragraphs)
    .concat(draft.body.keyPoints, draft.body.whatItMeans)
    .join(" ")
    .split(/\s+/).length;

  const sql = `UPDATE news_items
   SET headline        = ${lit(draft.headline)},
       dek             = ${lit(draft.dek)},
       body            = ${lit(JSON.stringify(draft.body))},
       reading_minutes = ${Math.max(1, Math.round(words / 220))},
       polish_state    = 'claude-polished',
       polished_at     = datetime('now'),
       updated_at      = datetime('now')
 WHERE id = ${lit(id)};`;

  const sqlPath = join(DRAFTS_DIR, `${id}.sql`);
  writeFileSync(sqlPath, sql + "\n");
  try {
    execFileSync(
      "npx",
      ["wrangler", "d1", "execute", "mvg-news", "--remote", "--file", sqlPath],
      { cwd: WORKER_DIR, stdio: ["ignore", "ignore", "inherit"] },
    );
  } finally {
    rmSync(sqlPath, { force: true });
  }

  rmSync(path, { force: true });
  rmSync(join(DRAFTS_DIR, `${id}.baseline.json`), { force: true });
  console.log(`✓ ${id}  ${draft.slug ?? "(no slug)"}  ${draft.headline}`);
}

/**
 * The set of numbers in the article as pulled must match the set in the article
 * as edited — nothing lost, and nothing new. Same rule as the Worker's own pass;
 * see the long note on numericFidelity in src/humanize.ts for why the no-new
 * half is the half that catches a rounded figure.
 */
function figuresLost(id, draft) {
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(join(DRAFTS_DIR, `${id}.baseline.json`), "utf8"));
  } catch {
    // No baseline — the draft was hand-made rather than pulled. Nothing to
    // compare against, so nothing to complain about.
    return null;
  }

  const prose = (d) =>
    [d.headline, d.dek, ...d.body.keyPoints, ...d.body.whatItMeans]
      .concat(d.body.sections.flatMap((s) => [s.heading, ...s.paragraphs]))
      .join(" ");

  const tokens = (s) => new Set(s.match(/\d[\d,.]*\d|\d/g) ?? []);
  const a = tokens(prose(baseline));
  const b = tokens(prose(draft));

  const lost = [...a].filter((n) => !b.has(n));
  const invented = [...b].filter((n) => !a.has(n));
  if (lost.length) return `figures lost: ${lost.join(", ")}`;
  if (invented.length) return `figures invented: ${invented.join(", ")}`;
  return null;
}

/**
 * Refuse a draft that has been damaged rather than edited. These are the same
 * checks the Worker's pass applies to its own output — a human editing JSON by
 * hand can break the shape just as easily as a model can.
 */
function check(d) {
  if (typeof d.headline !== "string" || !d.headline.trim()) return "headline is empty";
  if (typeof d.dek !== "string" || d.dek.trim().length < 40) return "dek is under 40 characters";
  const b = d.body;
  if (!b || typeof b !== "object") return "body is missing";
  const strings = (x) => Array.isArray(x) && x.every((s) => typeof s === "string" && s.trim());
  if (!strings(b.keyPoints) || !b.keyPoints.length) return "keyPoints is empty or not all strings";
  if (!strings(b.whatItMeans)) return "whatItMeans is not all strings";
  if (!Array.isArray(b.sections) || !b.sections.length) return "sections is empty";
  for (const s of b.sections) {
    if (!s || typeof s.heading !== "string" || !s.heading.trim()) return "a section has no heading";
    if (!strings(s.paragraphs) || !s.paragraphs.length) return "a section has no paragraphs";
  }
  return null;
}

/** SQLite string literal. Doubling the quote is the only escape it has. */
function lit(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}
