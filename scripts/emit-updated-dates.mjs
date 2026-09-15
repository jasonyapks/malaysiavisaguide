#!/usr/bin/env node
/**
 * Emit src/lib/data/updated.json — when each static page's content last changed.
 *
 * ## The bug this exists to fix
 *
 * `sitemapEntries()` stamped `lastModified: new Date()` on every entry built
 * from the route table: the home page, the six guides, /compare/, the three
 * tools pages, /about/, /editorial-policy/, /privacy/ and /contact/. Pages
 * builds on every push, so all fourteen carried the build date and moved
 * together whether or not a word had changed. The news and insight entries in
 * the same file never did this, and their comments say why — "a date that moves
 * on every deploy teaches a crawler to ignore the date on every page in the
 * sitemap". The route table was the one block that did not follow its own file's
 * rule.
 *
 * Google's sitemap documentation is explicit on both halves:
 *
 *   "The <lastmod> value should reflect the date and time of the last
 *    significant update to the page."
 *   "Google uses the <lastmod> value if it's consistently and verifiably
 *    (for example by comparing to the last modification of the page) accurate."
 *
 * A build-time stamp fails the second sentence on thirteen pages that did not
 * change, and taints the dates on the articles that did.
 *
 * ## Where the date comes from
 *
 * The commit that last touched the page's own content files. That is verifiable
 * in the sense Google means — the file's history is the page's history — and it
 * cannot drift on a rebuild, because a rebuild does not write a commit.
 *
 * ## What is deliberately NOT in a page's file list
 *
 * `src/lib/data/programmes.ts` holds all eight programmes. An edit to PVIP's
 * fees is not a significant update to the MM2H page, so attributing that commit
 * to all six guides would inflate five dates to fix one. Inflation is the exact
 * failure mode Google penalises, and it is worse than silence: an absent or old
 * lastmod costs a hint, while a lastmod that is always fresh costs the file its
 * credibility. The guides instead take the later of this date and the curated
 * per-programme dates (`lastVerified`, `superseded.changedOn`,
 * `superseded.attribution.asAt`), which is where a real change to a programme's
 * substance is already recorded by hand. See `pageUpdated()` in src/lib/updated.ts.
 *
 * Shared chrome — the header, the footer, the cookie banner — is excluded for
 * the same reason. Restyling the footer does not modify the main content of
 * ninety pages.
 *
 * ## What happens when git is unavailable
 *
 * The route gets no date, and its sitemap entry is emitted without a <lastmod>
 * at all — which Google documents as optional. A previous run's values are
 * reused if the file is still on disk, but the output is gitignored like the
 * repo's other generated data, so a fresh checkout without history simply omits
 * the element.
 *
 * The one thing this script must never do is fall back to the build clock. An
 * absent lastmod costs a hint; a lastmod that is always fresh costs the whole
 * file its credibility, which is the bug this exists to fix.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "lib", "data", "updated.json");

/**
 * Route path → the files whose content IS that page.
 *
 * Every locale's copy file counts: translating a page is a significant update
 * to it, and the three hosts share one sitemap entry group.
 */
const SOURCES = {
  "/": ["src/content/home"],
  "/insights/": ["src/content/insights/InsightsIndex.tsx", "src/lib/insights.ts"],
  "/news/": ["src/content/news/NewsIndex.tsx", "src/lib/news.ts"],
  "/visas/pvip/": ["src/content/visas/pvip"],
  "/visas/mm2h/": ["src/content/visas/mm2h"],
  "/visas/sarawak-mm2h/": ["src/content/visas/sarawak-mm2h"],
  "/visas/de-rantau/": ["src/content/visas/de-rantau"],
  "/visas/employment-pass/": ["src/content/visas/employment-pass"],
  "/visas/student-pass/": ["src/content/visas/student-pass"],
  "/compare/": ["src/content/compare"],
  "/tools/": ["src/content/tools"],
  "/tools/eligibility/": ["src/content/eligibility"],
  "/tools/cost-calculator/": ["src/content/calculator"],
  "/about/": ["src/content/about"],
  "/editorial-policy/": ["src/content/editorial-policy"],
  "/privacy/": ["src/content/privacy"],
  "/contact/": ["src/content/contact"],
};

/**
 * Is this a shallow clone, and can it be deepened?
 *
 * Cloudflare Pages clones at depth 1. In that repository `git log -1 -- <path>`
 * answers with the tip commit for EVERY path, because the tip is the only
 * commit there is — so all seventeen routes come back with the build commit's
 * date and move together on every push. That is the original bug wearing a
 * different hat, and it does not reproduce locally, where the clone is full.
 * The preview deploy is what exposed it: /about/, /privacy/, /visas/pvip/ and
 * /news/ all carried one identical timestamp.
 *
 * So: deepen if we can, and if we cannot, refuse to date anything rather than
 * publish seventeen copies of today.
 */
function historyIsUsable() {
  const shallow = () => {
    try {
      return (
        execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim() === "true"
      );
    } catch {
      return null; // not a git repository at all
    }
  };

  const first = shallow();
  if (first === null) return false;
  if (first === false) return true;

  try {
    execFileSync("git", ["fetch", "--unshallow", "--quiet"], {
      cwd: ROOT,
      stdio: "ignore",
      timeout: 120_000,
    });
  } catch {
    return false;
  }
  return shallow() === false;
}

/** The commit date of the last commit touching any of `files`, or null. */
function lastCommit(files) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...files],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

function readPrevious() {
  try {
    return JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    return {};
  }
}

const previous = readPrevious();
const usable = historyIsUsable();
const out = {};
const missing = [];

for (const [route, files] of Object.entries(SOURCES)) {
  const found = usable ? lastCommit(files) : null;
  if (found) {
    out[route] = found;
  } else if (previous[route]) {
    out[route] = previous[route];
    missing.push(route);
  } else {
    missing.push(route);
  }
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);

const dated = Object.keys(sorted).length;
console.log(`emit-updated-dates: ${dated}/${Object.keys(SOURCES).length} route(s) dated.`);
if (!usable) {
  console.log(
    "emit-updated-dates: shallow or absent git history and --unshallow did not " +
      "help, so no route was dated from git. Those pages ship without a " +
      "<lastmod>, which is correct — dating them all from the build commit is " +
      "the bug this script exists to prevent.",
  );
} else if (missing.length) {
  console.log(
    `emit-updated-dates: no git history for ${missing.length} route(s) — ` +
      `kept the committed value where there was one: ${missing.join(", ")}`,
  );
}
