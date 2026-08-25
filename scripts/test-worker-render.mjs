#!/usr/bin/env node
/**
 * The Worker and the migration must render a news article identically.
 *
 * Two pieces of code turn a `news_items` row into `content/news/<slug>.md`:
 * `scripts/migrate-cms-to-files.mjs`, which produced the files already in the
 * repo, and `worker/src/publish-file.ts`, which writes every one from now on.
 * If they disagree by a byte, the first re-approval of an existing article
 * lands as a whole-file diff and `git log` stops being readable — which is one
 * of the two reasons the content moved into git at all.
 *
 * They share `shared/frontmatter.ts` and `shared/newsbody.ts`, so the risk is
 * not the serialisers. It is the field list and the order: a key added on one
 * side, or the headline/title fallback resolved differently.
 *
 *   npm run test:worker-render
 */
import { readFileSync } from "node:fs";
import process from "node:process";

import { renderNewsFile } from "../worker/src/publish-file.ts";

const NEWS_API =
  process.env.NEWS_API_URL ?? "https://mvg-news.jason-6bf.workers.dev/api/news";

const index = await fetch(NEWS_API, { headers: { accept: "application/json" } })
  .then((r) => {
    if (!r.ok) throw new Error(`the news index answered ${r.status}`);
    return r.json();
  });

let same = 0;
let skipped = 0;
const differ = [];

for (const summary of index.items ?? []) {
  const { item } = await fetch(`${NEWS_API}/${summary.slug}`, {
    headers: { accept: "application/json" },
  }).then((r) => r.json());

  const body = JSON.parse(item.body ?? "{}");
  if (!Array.isArray(body.sections) || body.sections.length === 0) {
    skipped++;
    continue;
  }

  const rendered = renderNewsFile(item, body);

  let onDisk;
  try {
    onDisk = readFileSync(`content/news/${item.slug}.md`, "utf8");
  } catch {
    differ.push({ slug: item.slug, why: "no file on disk for this article" });
    continue;
  }

  if (rendered === onDisk) {
    same++;
    continue;
  }

  let i = 0;
  while (i < rendered.length && i < onDisk.length && rendered[i] === onDisk[i]) i++;
  differ.push({
    slug: item.slug,
    why: `first difference at char ${i}`,
    disk: JSON.stringify(onDisk.slice(Math.max(0, i - 60), i + 80)),
    worker: JSON.stringify(rendered.slice(Math.max(0, i - 60), i + 80)),
  });
}

console.log(
  `${same} article(s) render identically` +
    (skipped ? `, ${skipped} skipped (no sections)` : "") +
    `, ${differ.length} differ`,
);

if (differ.length > 0) {
  for (const d of differ) {
    console.error(`\n  ✗ ${d.slug} — ${d.why}`);
    if (d.disk) {
      console.error(`      on disk: ${d.disk}`);
      console.error(`      worker:  ${d.worker}`);
    }
  }
  console.error(
    `\nThe Worker would rewrite these files on the next approval. Reconcile ` +
      `renderNewsFile()\nin worker/src/publish-file.ts with newsFile() in ` +
      `scripts/migrate-cms-to-files.mjs before deploying.`,
  );
  process.exit(1);
}
