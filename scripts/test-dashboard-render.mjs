#!/usr/bin/env node
/**
 * The dashboard has to be valid JavaScript, and nothing proves that at build time.
 *
 * `worker/src/dashboard.ts` is a single 1,200-line template literal that emits an
 * HTML document with one inline `<script>` in it, and `worker/src/insight-images.ts`
 * is injected into that script as a second raw block. TypeScript typechecks the
 * *template* — it has no opinion about the JavaScript inside the string. So a
 * stray backtick, an unbalanced brace, a `${` that was meant to be literal, or an
 * element id that a rename left behind all ship clean and fail in Jason's browser,
 * on a page whose whole purpose is to be there when something else has gone wrong.
 *
 * This renders the thing and checks it:
 *
 *   1. the script parses — extracted and handed to `new Function`, which is the
 *      same parser the browser would use and fails on exactly what it would;
 *   2. every `$("#id")` and `getElementById` the script reaches for exists in the
 *      markup it shipped with — the check that catches a half-finished deletion;
 *   3. the markup is balanced — every <section>, <div> and <details> closes;
 *   4. no `${` survived into the output, which would mean an interpolation that
 *      was supposed to run got emitted as text.
 *
 *   npm run test:dashboard
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const tmp = mkdtempSync(path.join(tmpdir(), "mvg-dash-"));
const bundle = path.join(tmp, "dashboard.mjs");

/**
 * esbuild rather than tsc: the Worker's own imports are extensionless and
 * cross-project (`../../shared/blocks`), which is exactly what wrangler resolves
 * for it at deploy time and what `node` on its own will not. Bundling with the
 * same tool wrangler uses means this test reads the module the way production does.
 */
execFileSync(
  path.join(ROOT, "worker/node_modules/.bin/esbuild"),
  [
    path.join(ROOT, "worker/src/dashboard.ts"),
    "--bundle",
    "--format=esm",
    "--platform=neutral",
    `--outfile=${bundle}`,
    "--log-level=warning",
  ],
  { stdio: "inherit" },
);

const { dashboardHtml } = await import(bundle);

const html = dashboardHtml(
  "jason@mypvip.com",
  "https://malaysiavisaguide.com",
  "https://mvg-news.jason-6bf.workers.dev",
  "test-nonce",
);

const fail = [];

// --- 1. The inline script parses -------------------------------------------
//
// One <script> in the document, and everything runs in it. Taken out by its
// tags rather than by a parser, because pulling in a DOM library to read four
// lines of HTML would be a dependency for the test and not for the thing tested.
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(
  (m) => m[1],
);
if (scripts.length === 0) fail.push("no <script> in the rendered dashboard");

scripts.forEach((src, i) => {
  try {
    // Not eval: `new Function` parses the whole body and throws on a syntax
    // error without running any of it. Nothing here should execute — the script
    // calls fetch() on the first line of its own bootstrap.
    new Function(src);
  } catch (err) {
    fail.push(`script ${i + 1} does not parse — ${err.message}`);
  }
});

// --- 2. Every element the script addresses exists --------------------------
//
// The check that earns this file. A panel removed from the markup but still
// wired up in the script throws on load, and because the bootstrap runs at the
// bottom of one <script>, the throw takes every panel with it — the page comes
// up empty with one line in a console nobody has open.
const joined = scripts.join("\n");
const referenced = new Set();
for (const m of joined.matchAll(/\$\(\s*["'`]#([A-Za-z0-9_-]+)["'`]\s*\)/g)) {
  referenced.add(m[1]);
}
for (const m of joined.matchAll(
  /getElementById\(\s*["'`]([A-Za-z0-9_-]+)["'`]\s*\)/g,
)) {
  referenced.add(m[1]);
}

const present = new Set(
  [...html.matchAll(/\bid="([A-Za-z0-9_-]+)"/g)].map((m) => m[1]),
);
for (const id of [...referenced].sort()) {
  if (!present.has(id)) {
    fail.push(`the script addresses #${id}, which is not in the markup`);
  }
}

// Unreferenced ids are reported but do not fail: a few are there for the CSS or
// as an anchor target, which is legitimate.
const orphans = [...present]
  .filter((id) => !referenced.has(id))
  .filter((id) => !joined.includes(`"${id}"`) && !joined.includes(`'${id}'`));

// --- 3. Balanced markup ----------------------------------------------------
for (const tag of ["section", "details", "main", "div", "table"]) {
  const open = (html.match(new RegExp(`<${tag}\\b`, "g")) ?? []).length;
  const close = (html.match(new RegExp(`</${tag}>`, "g")) ?? []).length;
  if (open !== close) {
    fail.push(`<${tag}>: ${open} opened, ${close} closed`);
  }
}

// --- 4. No unevaluated interpolation ---------------------------------------
//
// `${` in the output means a template hole was written into a String.raw block
// (insight-images.ts) or escaped by accident, so the browser gets the source
// text of an expression where a value belonged.
if (html.includes("${")) {
  const at = html.indexOf("${");
  fail.push(
    `an unevaluated \${ reached the output near: ${JSON.stringify(
      html.slice(Math.max(0, at - 60), at + 60),
    )}`,
  );
}

rmSync(tmp, { recursive: true, force: true });

if (fail.length > 0) {
  console.error("dashboard render FAILED\n");
  for (const f of fail) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log(
  `dashboard render: ok — ${(html.length / 1024).toFixed(1)}KB, ` +
    `${scripts.length} script(s), ${referenced.size} element(s) addressed and present.`,
);
if (orphans.length > 0) {
  console.log(`  note: ids in the markup the script never reads — ${orphans.join(", ")}`);
}
