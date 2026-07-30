#!/usr/bin/env node
/**
 * Build the site and deploy it. This is the step that actually publishes.
 *
 * WHY IT IS A SCRIPT AND NOT A BUTTON. Approving an article writes a row to D1
 * and nothing else; the site is a static export that reads those rows at BUILD
 * time. So nothing a reader can see changes until someone runs `next build` and
 * uploads the result — and a Cloudflare Worker cannot run a Next.js build. The
 * dashboard can queue work, but publishing has to happen where Node does.
 *
 *   node scripts/deploy-site.mjs          # or: npm run publish:site
 *
 * push-polish.mjs calls deploySite() at the end of a successful polish run, so
 * the /humanizer loop finishes with the articles live rather than staged.
 */

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = "malaysiavisaguide";

/**
 * Deployment errors Cloudflare returns that mean "try again", not "your build is
 * wrong". Observed in the wild: a deploy of a purely static `out/` — no
 * _worker.js, no functions/ — failed with "Failed to publish your Function",
 * and the identical upload succeeded on the next attempt seconds later.
 */
const TRANSIENT = [
  "Failed to publish your Function",
  "Unknown internal error",
  "internal error",
  "please try again",
];

export function deploySite({ log = console.log } = {}) {
  // BREAK-GLASS ONLY, as of 2026-07-30. The normal way to publish is the Publish
  // button in the dashboard, or a push to `main` — both build on Cloudflare from
  // the commit, so the live site provably matches the repo.
  //
  // What this does instead is a DIRECT UPLOAD, which becomes the live deployment
  // without coming from a commit. Use it when Pages CI is down or a build needs
  // debugging locally, and expect the next git build to supersede it. If it ever
  // ships something `main` does not contain, the site and the repo have diverged
  // and that difference is invisible until someone pushes.
  log("!! Direct upload — bypasses the git build. The next push supersedes it.");

  // Bring across any image attached in the dashboard since the last deploy.
  // This is the last moment it can happen: the build that follows reads the
  // registry, so an article whose picture has not been pulled ships without one.
  // Deliberately NOT fatal — a hiccup fetching an image is not a reason to hold
  // a corrected figure off the live site.
  log("Pulling attached article images…");
  try {
    run("npm", ["run", "images:pull"]);
  } catch {
    log("Could not pull the images — deploying with the ones already here. Retry later:");
    log("  npm run images:pull");
  }

  log("Building the site…");
  run("npm", ["run", "build"]);

  log("Deploying to Cloudflare Pages…");
  // The build reads live D1 rows through the Worker, so a retry rebuilds
  // nothing — the same `out/` is re-uploaded, and Pages skips files it already
  // has. Retrying is cheap and costs no correctness.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const out = run("npx", [
        "wrangler",
        "pages",
        "deploy",
        "out",
        `--project-name=${PROJECT}`,
      ]);
      // Two labels before pages.dev: <deployment-hash>.<project>.pages.dev
      const url = out.match(/https:\/\/[a-z0-9.-]+\.pages\.dev/)?.[0];
      log(`Deployed${url ? ` — ${url}` : ""}`);
      return { ok: true, url };
    } catch (err) {
      const message = String(err.stdout ?? "") + String(err.stderr ?? "") + String(err);
      const retryable = TRANSIENT.some((t) => message.includes(t));
      if (!retryable || attempt === 3) {
        log(`Deploy failed:\n${message.trim().split("\n").slice(-12).join("\n")}`);
        return { ok: false, error: message };
      }
      log(`Deploy hit a transient Cloudflare error, retrying (${attempt}/2)…`);
    }
  }
  return { ok: false, error: "unreachable" };
}

function run(cmd, args) {
  return execFileSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    // Build output goes to the terminal as it happens; a five-minute silence
    // reads as a hang. Only the deploy's stdout is captured, for the URL.
    stdio: cmd === "npm" ? "inherit" : ["ignore", "pipe", "pipe"],
  });
}

// Run directly, or import deploySite() from another script.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = deploySite();
  process.exit(result.ok ? 0 : 1);
}
