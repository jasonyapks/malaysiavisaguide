#!/usr/bin/env node
/**
 * Pull the hero images Jason attached into the repo, ready for the build.
 *
 *   node scripts/article-image.mjs                          # every news article
 *   node scripts/article-image.mjs news <slug>
 *   node scripts/article-image.mjs insights <cat>/<slug> --file photo.jpg --alt "…"
 *
 * WHY A STEP AT ALL. The site is a static export, so the picture a reader loads
 * has to be a file in this repo before `next build` runs, at the sizes the pages
 * ask for. Jason attaches the image in the dashboard, which stores it in D1; this
 * is the step that brings it across, resizes it, and writes the alt text into
 * the registry the pages read. `npm run publish:site` runs it first.
 *
 * WHAT IT WRITES, per article:
 *   public/images/<section>/<slug>.webp      1440×810, the page hero
 *   public/images/<section>/<slug>-og.jpg    1200×630, the social card
 *   src/lib/data/article-images.json         alt, credit and provenance
 *
 * It also REMOVES entries whose image has been taken off the article, so
 * removing a picture in the dashboard actually removes it from the site rather
 * than leaving the last one in place forever.
 *
 * /insights/ articles are written in this repo rather than stored in D1, so they
 * have no dashboard to attach anything in. `--file` covers them: it puts a local
 * image through exactly the same resize and registry.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = join(ROOT, "src/lib/data/article-images.json");
const NEWS_API =
  process.env.NEWS_API_URL ?? "https://mvg-news.jason-6bf.workers.dev/api/news";

/**
 * The hero renders at most 720px wide in a 2× display's worth of pixels; 1440
 * covers that exactly. The OG card is the size every social platform asks for.
 * Both are cropped to 16:9 from the middle, which is what `fit: "cover"` does.
 */
const HERO = { width: 1440, height: 810 };
const OG = { width: 1200, height: 630 };

// ---------------------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const file = argValue(argv, "--file");
  const alt = argValue(argv, "--alt");
  const credit = argValue(argv, "--credit");
  const [section, target] = argv
    .filter((a) => !a.startsWith("--"))
    .filter((a) => a !== file && a !== alt && a !== credit);

  if (section === "insights") {
    await fromFile(target, { file, alt, credit });
    return;
  }
  if (section && section !== "news") {
    die(
      "Usage:\n" +
        "  node scripts/article-image.mjs                     # pull every news image\n" +
        "  node scripts/article-image.mjs news <slug>\n" +
        '  node scripts/article-image.mjs insights <cat>/<slug> --file photo.jpg --alt "…"',
    );
  }

  await pullNews(target, { force: flags.has("--force") });
}

// ---------------------------------------------------------------------------
// News — attached in the dashboard, stored in D1, fetched here

async function pullNews(slug, { force }) {
  const res = await fetch(NEWS_API, { headers: { accept: "application/json" } });
  if (!res.ok) die(`The news API returned ${res.status}.`);
  const { items } = await res.json();

  let articles = (items ?? []).filter((it) => it.slug);
  if (slug) {
    articles = articles.filter((it) => it.slug === slug);
    if (articles.length === 0) die(`No published article with the slug "${slug}".`);
  }

  const registry = readRegistry();
  let added = 0;
  let removed = 0;

  for (const item of articles) {
    const key = `news/${item.slug}`;
    const have = registry[key];

    // Taken off the article in the dashboard: take it off the site too.
    if (!item.has_image) {
      if (have) {
        dropFiles(have);
        delete registry[key];
        removed++;
        console.log(`− ${key} — image removed`);
      }
      continue;
    }

    // Nothing has changed since the last pull. The stamp is image_updated_at,
    // not the article's updated_at: replacing the picture does not touch the
    // prose, so the article's own timestamp would say nothing had happened. The
    // alt and credit are compared too, because editing a caption alone is a real
    // edit that never touches the bytes.
    const stamp = item.image_updated_at ?? "";
    if (
      !force &&
      have &&
      have.stamp === stamp &&
      have.alt === (item.image_alt ?? "") &&
      (have.credit ?? null) === (item.image_credit ?? null) &&
      existsSync(join(ROOT, "public", have.src))
    ) {
      continue;
    }

    const bytes = await fetchBytes(`${NEWS_API}/${item.slug}/image`);
    const written = await writeImages("news", item.slug, bytes);
    registry[key] = {
      ...written,
      alt: item.image_alt ?? "",
      credit: item.image_credit ?? null,
      stamp,
      updated: new Date().toISOString().slice(0, 10),
    };
    added++;
    console.log(`✓ ${key} → ${written.src}`);
  }

  writeRegistry(registry);
  console.log(
    added || removed
      ? `${added} image(s) written, ${removed} removed.`
      : "Every article image is already up to date.",
  );
}

async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Insights — a local file, same treatment

async function fromFile(target, { file, alt, credit }) {
  if (!target || !file || !alt) {
    die(
      'Needs all three:\n  node scripts/article-image.mjs insights <category>/<slug> --file photo.jpg --alt "what it shows"',
    );
  }
  const [category, slug] = target.split("/");
  if (!slug) die('Give the category too, as "<category>/<slug>".');

  const { insights } = await import("../src/lib/data/insights.ts");
  const found = insights.find((i) => i.slug === slug && i.category === category);
  if (!found) die(`No entry in src/lib/data/insights.ts for "${target}".`);

  const path = resolve(file);
  if (!existsSync(path)) die(`No file at ${path}.`);

  const written = await writeImages("insights", `${category}-${slug}`, readFileSync(path));
  const registry = readRegistry();
  registry[`insights/${category}/${slug}`] = {
    ...written,
    alt,
    credit: credit ?? null,
    stamp: "",
    updated: new Date().toISOString().slice(0, 10),
  };
  writeRegistry(registry);
  console.log(`✓ insights/${category}/${slug} → ${written.src}`);
}

// ---------------------------------------------------------------------------

/** Resize once into both sizes, and return the paths as the registry wants them. */
async function writeImages(section, name, input) {
  const dir = join(ROOT, "public/images", section);
  mkdirSync(dir, { recursive: true });
  const sharp = (await import("sharp")).default;

  await sharp(input)
    .resize(HERO.width, HERO.height, { fit: "cover" })
    .webp({ quality: 76 })
    .toFile(join(dir, `${name}.webp`));
  await sharp(input)
    .resize(OG.width, OG.height, { fit: "cover" })
    .jpeg({ quality: 82 })
    .toFile(join(dir, `${name}-og.jpg`));

  return {
    src: `/images/${section}/${name}.webp`,
    og: `/images/${section}/${name}-og.jpg`,
  };
}

function dropFiles(entry) {
  for (const p of [entry.src, entry.og]) {
    if (p) rmSync(join(ROOT, "public", p), { force: true });
  }
}

function readRegistry() {
  if (!existsSync(REGISTRY)) return {};
  return JSON.parse(readFileSync(REGISTRY, "utf8"));
}

function writeRegistry(data) {
  // Sorted so a changed entry shows as a one-key diff rather than a reorder.
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(REGISTRY, `${JSON.stringify(sorted, null, 2)}\n`);
}

function argValue(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 ? undefined : argv[i + 1];
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

main().catch((err) => {
  console.error(`\n${err.message ?? err}`);
  process.exit(1);
});
