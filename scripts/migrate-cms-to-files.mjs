#!/usr/bin/env node
/**
 * One-off: move the CMS out of D1 and into files under content/.
 *
 * Kept in scripts/ afterwards as the record of what was done, not because it
 * will be run twice. Read it as the answer to "where did content/ come from".
 *
 *   npm run migrate:cms -- --dry-run     build and verify, write nothing
 *   npm run migrate:cms                  build, verify, then write
 *
 * ## Nothing is written until everything verifies
 *
 * Every file is built in memory, parsed straight back, and deep-equalled
 * against the document it came from. One failure anywhere and the script exits
 * having touched no files at all.
 *
 * That ordering is the whole point. A partial migration is the expensive
 * failure mode here: half the articles on disk and half still in D1, with the
 * build reading one source and the dashboard writing the other, and no obvious
 * signal which article is which. Refusing to start is cheap.
 *
 * ## What it deliberately does not carry over
 *
 * **Images.** Hero images are resolved through `src/lib/data/article-images.json`
 * and `public/images/cms/`, written by `scripts/pull-images.mjs` from R2. That
 * path is unchanged by this migration and the image columns on the row
 * (`image_alt`, `image_credit`, `has_image`) are read by nothing in the site.
 *
 * **`id`.** The D1 primary key. The file's identity is its path — slug from the
 * filename, category from the folder — which is the point of the move.
 *
 * ## Two collapsed pairs, on the news side
 *
 * A news row carries `headline`/`title` and `dek`/`summary`: ours and the
 * publisher's, with `toArticle()` in src/lib/news.ts falling back one to the
 * other. A file has one field, so the fallback is resolved here, once, and the
 * resolved value is written. Same output, one fewer thing to know.
 *
 * Dates get the same treatment: `updated_at` is SQLite's `datetime('now')`
 * — "2026-07-25 09:41:02", which is not a valid `<time datetime>` value — and
 * is normalised to real ISO on the way out rather than on every read.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { parseBody, writeBody } from "../shared/markdown.ts";
import { splitContentFile, writeContentFile } from "../shared/frontmatter.ts";
import { parseNewsSections, writeNewsSections } from "../shared/newsbody.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");

const INSIGHTS_API =
  process.env.INSIGHTS_API_URL ??
  "https://mvg-news.jason-6bf.workers.dev/api/cms/insights";
const NEWS_API =
  process.env.NEWS_API_URL ?? "https://mvg-news.jason-6bf.workers.dev/api/news";

const dryRun = process.argv.includes("--dry-run");

// --- Helpers ----------------------------------------------------------------

async function getJson(url, what) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${what} answered ${res.status} (${url})`);
  return res.json();
}

/** Strict deep equality — key presence counts, not just values. */
function equal(a, b, at = "") {
  if (a === b) return null;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return `${at}: one is an array, the other is not`;
    }
    if (a.length !== b.length) {
      return `${at}: length ${a.length} became ${b.length}`;
    }
    for (let i = 0; i < a.length; i++) {
      const err = equal(a[i], b[i], `${at}[${i}]`);
      if (err) return err;
    }
    return null;
  }

  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.join(",") !== kb.join(",")) {
      const lost = ka.filter((k) => !kb.includes(k));
      const gained = kb.filter((k) => !ka.includes(k));
      return (
        `${at}: keys differ` +
        (lost.length ? ` — lost ${lost.join(", ")}` : "") +
        (gained.length ? ` — gained ${gained.join(", ")}` : "")
      );
    }
    for (const k of ka) {
      const err = equal(a[k], b[k], `${at}.${k}`);
      if (err) return err;
    }
    return null;
  }

  return `${at}: ${JSON.stringify(a)} became ${JSON.stringify(b)}`;
}

/** Copy of `toIso` in src/lib/news.ts. See the header for why it runs here. */
function toIso(v) {
  if (!v) return null;
  const normalised = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)
    ? v.replace(" ", "T") + "Z"
    : v;
  const d = new Date(normalised);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Drop keys whose value is null or undefined — frontmatter has no null. */
function defined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined),
  );
}

// --- Insights ---------------------------------------------------------------

function insightFile(doc) {
  const data = defined({
    title: doc.title,
    dek: doc.dek,
    published: doc.published,
    reviewed: doc.reviewed,
    readingMinutes: doc.readingMinutes,
    draft: doc.draft === true,
    relatedGuides: doc.relatedGuides ?? [],
    faq: doc.faq ?? [],
    sources: doc.sources ?? [],
  });
  return writeContentFile(data, writeBody(doc.blocks));
}

/** What we expect to read back out of the file we just wrote. */
function insightExpectation(doc) {
  return {
    fields: defined({
      title: doc.title,
      dek: doc.dek,
      published: doc.published,
      reviewed: doc.reviewed,
      readingMinutes: doc.readingMinutes,
      draft: doc.draft === true,
      relatedGuides: doc.relatedGuides ?? [],
      faq: doc.faq ?? [],
      sources: doc.sources ?? [],
    }),
    blocks: doc.blocks,
  };
}

function verifyInsight(text, doc) {
  const { data, body } = splitContentFile(text);
  const want = insightExpectation(doc);
  return (
    equal(want.fields, data, "frontmatter") ??
    equal(want.blocks, parseBody(body), "body")
  );
}

// --- News -------------------------------------------------------------------

function newsFile(item, body) {
  const data = defined({
    headline: item.headline?.trim() || item.title,
    dek: item.dek?.trim() || item.summary,
    category: item.category,
    sourceName: item.source_name,
    sourceUrl: item.source_url,
    publishedAt: toIso(item.published_at),
    updatedAt: toIso(item.updated_at),
    readingMinutes: item.reading_minutes ?? 3,
    keyPoints: body.keyPoints ?? [],
    whatItMeans: body.whatItMeans ?? [],
    sourceExcerpt: item.source_excerpt ?? null,
  });
  return writeContentFile(data, writeNewsSections(body.sections));
}

function verifyNews(text, item, body) {
  const { data, body: md } = splitContentFile(text);
  const want = defined({
    headline: item.headline?.trim() || item.title,
    dek: item.dek?.trim() || item.summary,
    category: item.category,
    sourceName: item.source_name,
    sourceUrl: item.source_url,
    publishedAt: toIso(item.published_at),
    updatedAt: toIso(item.updated_at),
    readingMinutes: item.reading_minutes ?? 3,
    keyPoints: body.keyPoints ?? [],
    whatItMeans: body.whatItMeans ?? [],
    sourceExcerpt: item.source_excerpt ?? null,
  });
  return (
    equal(want, data, "frontmatter") ??
    equal(body.sections, parseNewsSections(md), "sections")
  );
}

// --- Build everything, verify everything, then write ------------------------

const files = [];
const failures = [];

console.log(`insights: reading ${INSIGHTS_API}`);
const insightIndex = await getJson(INSIGHTS_API, "the insights index");

for (const summary of insightIndex.items ?? []) {
  const url = `${INSIGHTS_API}/${encodeURIComponent(summary.category)}/${encodeURIComponent(summary.slug)}`;
  const { item: doc } = await getJson(url, `insight ${summary.slug}`);
  const rel = path.join("content", "insights", doc.category, `${doc.slug}.md`);

  const text = insightFile(doc);
  const err = verifyInsight(text, doc);
  if (err) failures.push({ rel, err });
  else files.push({ rel, text });
}

console.log(`news:     reading ${NEWS_API}`);
const newsIndex = await getJson(NEWS_API, "the news index");

for (const summary of newsIndex.items ?? []) {
  const { item } = await getJson(
    `${NEWS_API}/${encodeURIComponent(summary.slug)}`,
    `article ${summary.slug}`,
  );
  const rel = path.join("content", "news", `${item.slug}.md`);

  let body;
  try {
    body = JSON.parse(item.body ?? "");
  } catch {
    failures.push({ rel, err: "the stored body is not JSON" });
    continue;
  }
  if (!Array.isArray(body?.sections) || body.sections.length === 0) {
    // Matches fetchArticle(): a row with no sections is not a page today, so
    // migrating it would publish something the site has never shown.
    console.log(`  skipped ${item.slug} — no sections, not a live page`);
    continue;
  }

  const text = newsFile(item, body);
  const err = verifyNews(text, item, body);
  if (err) failures.push({ rel, err });
  else files.push({ rel, text });
}

if (failures.length > 0) {
  console.error(`\n${failures.length} document(s) failed to round-trip:\n`);
  for (const f of failures) console.error(`  ✗ ${f.rel}\n    ${f.err}`);
  console.error(
    `\nNothing was written. Every document has to survive the trip before any ` +
      `of them\nmoves, because a half-migrated CMS is far worse than an ` +
      `unmigrated one.`,
  );
  process.exit(1);
}

console.log(`\n${files.length} file(s) built and verified.`);

if (dryRun) {
  for (const f of files) console.log(`  would write ${f.rel}`);
  console.log("\n--dry-run: nothing written.");
  process.exit(0);
}

for (const f of files) {
  const abs = path.join(ROOT, f.rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, f.text, "utf8");
  console.log(`  wrote ${f.rel}`);
}

console.log(
  `\nDone. ${files.length} file(s) under ${path.relative(ROOT, CONTENT)}/.\n` +
    `The build still reads the API — that is the next step. Nothing a reader ` +
    `sees has changed yet.`,
);
