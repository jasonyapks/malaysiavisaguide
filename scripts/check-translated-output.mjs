#!/usr/bin/env node
/**
 * The three checks that have to pass before a translated page ships.
 *
 * All three have caught real bugs, and none of them is a typecheck or a lint —
 * they read the built HTML in `out/`, because every failure they catch is
 * invisible in the source. Run after `npm run build`:
 *
 *   node scripts/check-translated-output.mjs
 *   node scripts/check-translated-output.mjs --baseline /tmp/mvg-baseline
 *   node scripts/check-translated-output.mjs --leaks zh-hans/privacy/
 *
 * ## 1. Link integrity
 *
 * Every `href="/zh-han[st]/…"` in the built output must resolve to a built
 * `index.html`. The header, footer and 404 render the whole route table, so a
 * mistake here is never one dead link — it is every untranslated route dead on
 * every Chinese page at once. That is exactly what happened before `linkPath`
 * existed: eleven dead links on every Chinese page.
 *
 * ## 2. English leaks — REPORTS, NEVER FAILS
 *
 * Strip the tags off each Chinese page and list the Latin words. This is how
 * you find the sentence that renders in English inside a Chinese paragraph,
 * which no type can catch because the type is `string` either way. It found the
 * ~200 English words that programme data was putting on the insight pages.
 *
 * It cannot be a gate, and pretending otherwise would make it noise that gets
 * ignored. A news article legitimately names Anwar Ibrahim, cites Free Malaysia
 * Today and quotes ePPAx; the set of proper nouns a Chinese page may correctly
 * carry is unbounded and grows every time an article lands. `EXPECTED` below
 * only silences the recurring site chrome so the list stays readable.
 *
 * So: read the output, do not diff it. `--leaks <prefix>` narrows it to the
 * page or subtree you just translated, which is the way to use it — a short
 * list you can check by eye against "is every one of these meant to be Latin?".
 *
 * ## 3. Baseline diff (`--baseline <dir>`)
 *
 * English output must not change. Build the previous commit into a directory,
 * pass it here, and every page's visible text is compared. Translation work
 * touches shared components constantly and the English site must come through
 * untouched; this is the proof. It caught the custom 404 silently reverting to
 * Next's default, and a guide's contents rail rendering empty.
 *
 * THE TRAP IN THIS COMPARISON, which cost a day once: React separates adjacent
 * text nodes with an empty `<!-- -->` comment. Replace comments with a space
 * and a locale change that merges three text nodes into one interpolated string
 * reads as a whitespace diff on 32 pages (`2026 .` → `2026.`) — a sitewide
 * regression that is not one. Empty comments strip to "", others to " ".
 */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");

/** Locale prefixes in the built tree. `src/lib/i18n.ts` is the source. */
const PREFIXES = ["zh-hans", "zh-hant"];

/**
 * Recurring site chrome that is meant to be Latin, filtered out so the report
 * is short enough to read. NOT a whitelist of everything legitimate — see the
 * header. Programme and company names are the registered identities on the
 * licences; authority names are bracketed after the Chinese so a reader who
 * checks lands on the right page; vendor and domain names are what a reader
 * searches for. See the header of src/locales/programmes/zh-hans.ts.
 */
const EXPECTED = new Set(
  `Jason Yap MYPVIP PVIP MM2H Rantau EMGS MDEC MOTAC MTCP Sarawak Malaysia
   Malaysian Immigration Department Expatriate Services Division Employment
   Pass Student Talent Corp Residence Premium Visa Programme Second Home Entry
   Permit Guide Guidelines guidelines Category Panel Approving Care Google
   Analytics Cloudflare Forms Personal Data Protection admin malaysiavisaguide
   educationmalaysia motac talentcorp myxpats consent Cookie salary basic
   Revised policy effective eligibility criteria benefits structure June July
   August September October November December January February March April May`
    .split(/\s+/)
    .filter(Boolean),
);

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (e.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** Visible text only. See the note above about `<!-- -->`. */
function visibleText(file) {
  return readFileSync(file, "utf8")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--\s*-->/g, "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function checkLinks() {
  let dead = 0;
  for (const f of walk(OUT)) {
    const html = readFileSync(f, "utf8");
    for (const m of html.matchAll(/href="(\/zh-han[st]\/[^"#?]*)"/g)) {
      const p = m[1];
      if (
        !existsSync(join(OUT, p, "index.html")) &&
        !existsSync(join(OUT, p.replace(/\/$/, "") + ".html"))
      ) {
        console.log(`  DEAD  ${relative(OUT, f)} -> ${p}`);
        dead++;
      }
    }
  }
  console.log(
    dead === 0
      ? "link integrity: OK — every /zh-han[st]/ link resolves"
      : `link integrity: ${dead} DEAD LINK(S)`,
  );
  return dead === 0;
}

function checkLeaks(filter) {
  const rows = [];
  for (const prefix of PREFIXES) {
    for (const f of walk(join(OUT, prefix))) {
      const rel = relative(OUT, f);
      if (filter && !rel.startsWith(filter)) continue;
      const words = [...visibleText(f).matchAll(/[A-Za-z][A-Za-z]{3,}/g)]
        .map((m) => m[0])
        .filter((w) => !EXPECTED.has(w));
      if (words.length) {
        const counts = {};
        for (const w of words) counts[w] = (counts[w] || 0) + 1;
        rows.push([rel, Object.entries(counts).sort((a, b) => b[1] - a[1])]);
      }
    }
  }
  rows.sort((a, b) => b[1].length - a[1].length);
  if (!rows.length) {
    console.log("english leaks: none beyond the known chrome");
    return;
  }
  console.log(
    `english leaks (report only — check by eye): ${rows.length} page(s)`,
  );
  for (const [rel, counts] of rows.slice(0, 20)) {
    console.log(`  ${rel}`);
    console.log(
      "    " + counts.map(([w, n]) => (n > 1 ? `${w}(${n})` : w)).join(" "),
    );
  }
  if (rows.length > 20) console.log(`  … and ${rows.length - 20} more`);
}

function checkBaseline(baseDir) {
  const rel = (root) => new Set(walk(root).map((f) => relative(root, f)));
  const before = rel(baseDir);
  const after = rel(OUT);
  let changed = 0;
  for (const f of after) if (!before.has(f)) console.log(`  ADDED    ${f}`);
  for (const f of before) if (!after.has(f)) console.log(`  REMOVED  ${f}`);
  for (const f of [...before].filter((f) => after.has(f)).sort()) {
    const a = visibleText(join(baseDir, f));
    const b = visibleText(join(OUT, f));
    if (a === b) continue;
    changed++;
    let i = 0;
    while (a[i] === b[i]) i++;
    console.log(`  CHANGED  ${f}`);
    console.log(`     was: ${JSON.stringify(a.slice(Math.max(0, i - 60), i + 90))}`);
    console.log(`     now: ${JSON.stringify(b.slice(Math.max(0, i - 60), i + 90))}`);
  }
  console.log(
    changed === 0
      ? "baseline: OK — no page changed its visible text"
      : `baseline: ${changed} page(s) changed — each one needs a reason`,
  );
  return changed === 0;
}

const args = process.argv.slice(2);
const arg = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
};

if (!existsSync(OUT)) {
  console.error("No out/ — run `npm run build` first.");
  process.exit(1);
}

// Only the two that can be wrong in one direction gate the exit code. The
// leak report is for a person to read.
let ok = checkLinks();
checkLeaks(arg("--leaks"));
const baseline = arg("--baseline");
if (baseline) ok = checkBaseline(baseline) && ok;

process.exit(ok ? 0 : 1);
