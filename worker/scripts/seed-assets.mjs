#!/usr/bin/env node
/**
 * One-time bootstrap: put the images the repo already ships into the library.
 *
 *   node worker/scripts/seed-assets.mjs --local     # against `wrangler dev`
 *   node worker/scripts/seed-assets.mjs --remote    # against the real bucket
 *   node worker/scripts/seed-assets.mjs --remote --dry-run
 *
 * WHY IT EXISTS. `src/lib/images.ts` now prefers a CMS picture for the slot
 * `site/<key>` and falls back to its own entry. Without this seed the CMS half
 * is simply empty, and swapping the PVIP photo in the dashboard is impossible
 * until someone uploads all eight by hand. Running it is what makes the CMS the
 * live source for images that already exist.
 *
 * WHY IT WRITES THROUGH WRANGLER, NOT THE API. The admin endpoints are behind
 * Cloudflare Access, which a script has no way to satisfy without a service
 * token nobody has issued. `wrangler r2 object put` and `wrangler d1 execute`
 * already hold the credential. Metadata only goes through D1's statement text,
 * which is capped at 100KB — fine, because no image bytes travel that way.
 *
 * WHY THE HEROES ARE NOT RE-CROPPED. These files are already the finished,
 * hand-picked renditions the site ships today, and one of them is deliberately
 * near-square: `home-visa-guide.webp` is 1024×997 and `images.ts` says in as many
 * words that cropping it to a landscape ratio would take the title off the top.
 * Forcing all eight through a 1440×810 cover crop to satisfy a naming convention
 * would change the site's appearance for no reason. They are seeded as they are —
 * `hero_key` promises "the rendition the page renders", not a fixed aspect ratio.
 * Anything uploaded from here on goes through derive() and is 16:9.
 *
 * SAFE TO RE-RUN. Every write is keyed on the slot, and an existing slot is
 * skipped rather than overwritten — re-running it will not clobber a picture
 * Jason has since replaced in the dashboard.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKER = join(HERE, "..");
const ROOT = join(WORKER, "..");

const REMOTE = process.argv.includes("--remote");
const LOCAL = process.argv.includes("--local");
const DRY = process.argv.includes("--dry-run");
if (REMOTE === LOCAL) {
  console.error("Pick exactly one of --local or --remote.");
  process.exit(1);
}
const SCOPE = REMOTE ? "--remote" : "--local";

/**
 * The eight slots, and the file each one already has.
 *
 * Keys match `codeImages` in src/lib/images.ts exactly — that is what makes the
 * seeded asset win over the code entry rather than sit beside it.
 */
const SEEDS = [
  ["site/home", "public/images/home-visa-guide.webp"],
  ["site/pvip", "public/images/pvip.webp"],
  ["site/mm2h", "public/images/mm2h.webp"],
  ["site/sarawak-mm2h", "public/images/sarawak-mm2h.webp"],
  ["site/de-rantau", "public/images/de-rantau.webp"],
  ["site/employment-pass", "public/images/employment-pass.webp"],
  ["site/student-pass", "public/images/student-pass.webp"],
  ["site/about", "public/images/jason-yap.webp"],
];

/**
 * Alt text, lifted verbatim from src/lib/images.ts.
 *
 * Copied rather than imported because that file is TypeScript with a path alias
 * and this is a plain node script. Keyed by slot so a mismatch is visible rather
 * than positional — and the seed refuses to run if one is missing, because an
 * asset row with invented alt text is worse than no asset row.
 */
const ALT = {
  "site/home":
    "A Malaysia Visa Guide graphic: a Malaysian flag and an approval stamp over a visa application form, with passports and the Petronas Towers.",
  "site/pvip":
    "Business professionals meeting in a high-rise office with a city skyline view.",
  "site/mm2h":
    "A family with a young child enjoying a lush, green tree-lined path together.",
  "site/sarawak-mm2h":
    "The Sarawak State Legislative Assembly and a river cruise boat on the Kuching waterfront.",
  "site/de-rantau":
    "A laptop and backpack on a wooden table in a bright, plant-filled tropical café.",
  "site/employment-pass":
    "A diverse team collaborating over a laptop in a bright modern office.",
  "site/student-pass": "A diverse group of students walking and laughing together.",
  "site/about": "Jason Yap, Managing Director of MYPVIP.",
};

function wrangler(args) {
  return execFileSync("npx", ["wrangler", ...args], {
    cwd: WORKER,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** Slots already taken, so a re-run is a no-op rather than a clobber. */
function existingSlots() {
  const out = wrangler([
    "d1", "execute", "mvg-news", SCOPE, "--json",
    "--command", "SELECT slot FROM assets WHERE slot IS NOT NULL",
  ]);
  const parsed = JSON.parse(out.slice(out.indexOf("[")));
  return new Set((parsed[0]?.results ?? []).map((r) => r.slot));
}

/** SQL string literal. Alt text has apostrophes in it; nothing else is escaped. */
const q = (s) => (s === null || s === undefined ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);

async function main() {
  const taken = existingSlots();
  let seeded = 0;

  for (const [slot, rel] of SEEDS) {
    if (taken.has(slot)) {
      console.log(`· ${slot} — already in the library, left alone`);
      continue;
    }
    const path = join(ROOT, rel);
    if (!existsSync(path)) {
      console.error(`! ${slot} — no file at ${rel}`);
      process.exitCode = 1;
      continue;
    }
    const alt = ALT[slot];
    if (!alt || alt.length < 5) {
      console.error(`! ${slot} — no alt text; add it to ALT before seeding`);
      process.exitCode = 1;
      continue;
    }

    const bytes = readFileSync(path);
    // A deterministic id from the file's own bytes, formatted as a UUID so it
    // satisfies the endpoints' id check. Deterministic so a seed run against
    // local and a seed run against remote produce the same keys, which makes the
    // two comparable when something looks wrong.
    const id = uuidFromBytes(bytes, slot);
    const ext = rel.endsWith(".webp") ? "webp" : rel.split(".").pop();
    const mime = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
    const origKey = `orig/${id}.${ext}`;
    const heroKey = `hero/${id}.${ext}`;

    console.log(`${DRY ? "(dry) " : ""}+ ${slot} → ${heroKey} (${bytes.length} bytes)`);
    if (DRY) continue;

    // The same bytes under both keys rather than a byte-for-byte copy: R2 bills
    // for storage, and these are already the finished rendition.
    for (const key of [origKey, heroKey]) {
      wrangler([
        "r2", "object", "put", `mvg-assets/${key}`,
        `--file=${path}`, `--content-type=${mime}`, SCOPE,
      ]);
    }

    // og_key is NULL on purpose. A social card is a per-article thing; nothing
    // renders a programme photo as an OG image, and generating one that will
    // never be served is waste. See articleOgImage() — it answers null for these.
    wrangler([
      "d1", "execute", "mvg-news", SCOPE, "--command",
      `INSERT INTO assets (id, slot, hero_key, og_key, orig_key, mime, alt, source)
       VALUES (${q(id)}, ${q(slot)}, ${q(heroKey)}, NULL, ${q(origKey)}, ${q(mime)},
               ${q(alt)}, ${q(rel)})`,
    ]);
    seeded++;
  }

  console.log(`\n${seeded} slot(s) seeded${DRY ? " (dry run — nothing written)" : ""}.`);
  if (!DRY && seeded) {
    console.log("Next: npm run images:pull, then check public/images/cms/.");
  }
}

/** A stable UUID-shaped id derived from the file. */
function uuidFromBytes(bytes, salt) {
  const h = createHash("sha256").update(salt).update(bytes).digest("hex");
  return [h.slice(0, 8), h.slice(8, 12), `4${h.slice(13, 16)}`,
          `${((parseInt(h[16], 16) & 0x3) | 0x8).toString(16)}${h.slice(17, 20)}`,
          h.slice(20, 32)].join("-");
}

main().catch((err) => {
  console.error(err.stderr?.toString?.() ?? err.message ?? err);
  process.exit(1);
});
