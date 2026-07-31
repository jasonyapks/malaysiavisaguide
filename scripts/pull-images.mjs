#!/usr/bin/env node
/**
 * Pull every CMS image into the repo, ready for the build.
 *
 *   node scripts/pull-images.mjs           # the lot
 *   node scripts/pull-images.mjs --soft    # never fail the caller
 *   node scripts/pull-images.mjs --force   # ignore the stamps, fetch everything
 *
 * REPLACES scripts/article-image.mjs, and the difference is where the resizing
 * happens. That script downloaded a full-size photo out of a D1 base64 column
 * and cropped it here with `sharp` — a native dependency compiled on every
 * Cloudflare Pages build to do work a browser had already been asked to do. The
 * dashboard now crops at upload time (worker/src/dashboard.ts, `derive()`), R2
 * holds the finished renditions, and this script only has to fetch them. `sharp`
 * is gone from the site's dependencies entirely.
 *
 * WHY A STEP AT ALL, still. The site is a static export: the picture a reader
 * loads has to be a file in `out/` before `next build` runs. And it has to be
 * served same-origin — not from `r2.dev`, which is rate-limited, documented as
 * not for production, and would put an unbranded third-party host on the LCP
 * element of every article.
 *
 * WHAT IT WRITES:
 *   public/images/cms/<key>.webp       the 1440×810 hero
 *   public/images/cms/<key>-og.jpg     the 1200×630 social card, where there is one
 *   src/lib/data/article-images.json   alt, credit and provenance
 *
 * All three are BUILD ARTIFACTS and are gitignored. That is the answer to "CI
 * must get the images without anyone committing them", and it means the repo
 * stops carrying binaries that D1 and R2 are already the source of truth for.
 *
 * The JSON is written in exactly the shape it has always had, so
 * `src/lib/articleImages.ts` and every page that calls it are unchanged.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = join(ROOT, "src/lib/data/article-images.json");
const CMS_DIR = join(ROOT, "public/images/cms");
const PUBLIC_PREFIX = "/images/cms";

/**
 * The Worker that holds the library. Overridable so the site can be built
 * against a local `wrangler dev` before anything is deployed:
 *
 *   IMAGES_API_URL=http://localhost:8787/api/images npm run build
 */
const IMAGES_API =
  process.env.IMAGES_API_URL ?? "https://mvg-news.jason-6bf.workers.dev/api/images";

/**
 * `--soft`: report a failure loudly and exit 0 anyway.
 *
 * How `prebuild` runs it, and the policy `deploy-site.mjs` has always applied by
 * hand — a hiccup fetching a photo must never hold a corrected fee figure off
 * the site.
 *
 * Deliberately narrower than `|| true` in the npm script, which would also
 * swallow a genuine crash in this file and leave every future build silently not
 * pulling images. A syntax error or an unresolvable import still fails before
 * main() is reached. What is soft is the *operational* set — an unreachable
 * Worker, a non-2xx, a rendition that will not download.
 */
const SOFT = process.argv.includes("--soft");
const FORCE = process.argv.includes("--force");

// ---------------------------------------------------------------------------

async function main() {
  // FIRST, unconditionally. `src/lib/articleImages.ts` imports this JSON, so a
  // missing file is not a missing picture — it is a build that fails at module
  // resolution. The file is gitignored, so a fresh CI clone genuinely has none,
  // and every soft failure below has to leave a valid one behind.
  const registry = readRegistry();
  writeRegistry(registry);

  const manifest = await fetchManifest();

  // Asserted, not defaulted, and the reason is the prune at the bottom: this
  // script DELETES any entry the manifest does not mention, so "what the Worker
  // told us" is the only thing standing between a picture and its removal. A 200
  // whose body is not the shape we expect must stop the run, never read as "the
  // library is empty" — which in a fresh CI clone would strip every image out of
  // the build and look like a success.
  if (!Array.isArray(manifest.images)) {
    die("The images API returned no `images` array.");
  }

  mkdirSync(CMS_DIR, { recursive: true });

  const next = {};
  let fetched = 0;
  let kept = 0;

  for (const entry of manifest.images) {
    if (!entry || typeof entry.key !== "string" || typeof entry.hero !== "string") {
      die(`The images API returned an entry with no key or hero: ${JSON.stringify(entry)}`);
    }
    const name = fileName(entry.key);
    const src = `${PUBLIC_PREFIX}/${name}.webp`;
    const og = entry.og ? `${PUBLIC_PREFIX}/${name}-og.jpg` : null;
    const have = registry[entry.key];
    const stamp = entry.stamp ?? "";

    // Nothing has changed. The stamp is the asset's `updated_at`, which moves
    // when the bytes are replaced AND when only the alt or the credit is edited —
    // a caption change is a real edit that never touches a pixel. The alt and
    // credit are compared anyway, so a registry written by an older version of
    // this script still self-corrects.
    const unchanged =
      !FORCE &&
      have &&
      have.stamp === stamp &&
      have.alt === (entry.alt ?? "") &&
      (have.credit ?? null) === (entry.credit ?? null) &&
      existsSync(join(ROOT, "public", src)) &&
      (!og || existsSync(join(ROOT, "public", og)));

    if (unchanged) {
      next[entry.key] = have;
      kept++;
      continue;
    }

    await download(entry.hero, join(ROOT, "public", src));
    if (og) await download(entry.og, join(ROOT, "public", og));

    next[entry.key] = {
      src,
      // The shape has always had `og`. An asset with no social card — a
      // programme card, say — records null rather than dropping the key, so the
      // JSON stays uniform and `articleOgImage()` keeps returning null for it.
      og,
      alt: entry.alt ?? "",
      credit: entry.credit ?? null,
      stamp,
      updated: new Date().toISOString().slice(0, 10),
    };
    fetched++;
    console.log(`✓ ${entry.key} → ${src}`);
  }

  // Anything the library no longer has, the site no longer has. Removing a
  // picture in the dashboard has to actually remove it, rather than leaving the
  // last one in place forever.
  let removed = 0;
  for (const [key, entry] of Object.entries(registry)) {
    if (next[key]) continue;
    dropFiles(entry);
    removed++;
    console.log(`− ${key} — no longer in the library`);
  }

  writeRegistry(next);
  sweepOrphans(next);

  console.log(
    fetched || removed
      ? `${fetched} image(s) fetched, ${kept} unchanged, ${removed} removed.`
      : `Every image is already up to date (${kept}).`,
  );
}

async function fetchManifest() {
  let res;
  try {
    res = await fetch(IMAGES_API, { headers: { accept: "application/json" } });
  } catch (err) {
    die(`Could not reach ${IMAGES_API} — ${err.message ?? err}`);
  }
  if (!res.ok) die(`${IMAGES_API} returned ${res.status}.`);
  try {
    return await res.json();
  } catch {
    die(`${IMAGES_API} returned something that is not JSON.`);
  }
}

/** Fetch one rendition to disk. Absolute or Worker-relative URLs both work. */
async function download(path, dest) {
  const url = /^https?:/.test(path) ? path : new URL(IMAGES_API).origin + path;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length === 0) throw new Error(`${url} returned an empty file`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, bytes);
}

/**
 * A manifest key as a file name.
 *
 * `site/pvip` → `site-pvip`, `news/<slug>` → `news-<slug>`. Flattened rather than
 * nested so `public/images/cms/` is one directory that can be emptied wholesale,
 * and narrowed to `[a-z0-9-]` because this string becomes a path — the Worker
 * validates slots on the same alphabet, and this is the second line of that
 * defence rather than a duplicate of it.
 */
function fileName(key) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dropFiles(entry) {
  for (const p of [entry?.src, entry?.og]) {
    if (p && p.startsWith(`${PUBLIC_PREFIX}/`)) rmSync(join(ROOT, "public", p), { force: true });
  }
}

/**
 * Delete anything in public/images/cms/ the registry does not claim.
 *
 * Belt and braces for the case the registry itself was lost — a stale file there
 * is never served (nothing links to it) but it would be copied into `out/` on
 * every build forever. Scoped to the one generated directory; nothing outside it
 * is ever touched.
 */
function sweepOrphans(registry) {
  if (!existsSync(CMS_DIR)) return;
  const claimed = new Set();
  for (const e of Object.values(registry)) {
    for (const p of [e.src, e.og]) if (p) claimed.add(p.slice(PUBLIC_PREFIX.length + 1));
  }
  for (const f of readdirSync(CMS_DIR)) {
    if (!claimed.has(f)) rmSync(join(CMS_DIR, f), { force: true });
  }
}

function readRegistry() {
  if (!existsSync(REGISTRY)) return {};
  try {
    const parsed = JSON.parse(readFileSync(REGISTRY, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    // A corrupt artifact is not worth failing a build over — it is regenerated
    // from the manifest a few lines later anyway.
    return {};
  }
}

function writeRegistry(data) {
  // Sorted so a changed entry is a one-key diff rather than a reorder. The file
  // is gitignored now, but it is still read by a human when a picture is missing.
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  mkdirSync(dirname(REGISTRY), { recursive: true });
  writeFileSync(REGISTRY, `${JSON.stringify(sorted, null, 2)}\n`);
}

function die(msg) {
  console.error(msg);
  giveUp();
  process.exit(1);
}

/**
 * In soft mode, say plainly what the build is about to ship without and stop
 * with a success code. Loud, because the only other symptom is a missing picture
 * that nobody would connect to this step.
 */
function giveUp() {
  if (!SOFT) return;
  console.error(
    "\n" +
      "!! IMAGE PULL FAILED — building with whatever is already on disk.\n" +
      "!! On a fresh CI clone that is NOTHING, and articles will publish without\n" +
      "!! their pictures. Everything else in the build is fine. Re-run when the\n" +
      "!! Worker is back:\n" +
      "!!   npm run images:pull\n",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(`\n${err.message ?? err}`);
  giveUp();
  process.exit(1);
});
