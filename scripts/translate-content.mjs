#!/usr/bin/env node
/**
 * Keep the translated content trees in sync with the English ones.
 *
 * English is the source of truth and every other locale is derived, the same
 * relationship `gen-zh-hant.mjs` already gives Traditional over Simplified.
 * This script is the reconciler for the step above it: English → a translated
 * locale, through a model.
 *
 * ## Why a reconciler and not a hook on publish
 *
 * Two different producers write content into this repo. News arrives as a
 * commit from the mvg-news Worker (`worker/src/publish-file.ts`); insights
 * arrive as a commit from Sveltia CMS, which the Worker is not part of at all
 * — its insight write endpoints answer 410 now. A translation step bolted to
 * either one would cover half the content.
 *
 * The commit is the one thing both producers have in common, so the trigger is
 * a push: `.github/workflows/translate-content.yml` runs this, and it works out
 * for itself what is missing, what has gone stale and what should no longer
 * exist. That also covers the third producer nobody plans for — a file edited
 * by hand.
 *
 * ## What "stale" means, exactly
 *
 * Every translated file records `sourceHash`: a digest of the *translatable
 * strings* of its English source, in traversal order. Not of the file — a
 * corrected `updatedAt` or a reordered key would otherwise burn a model call
 * and rewrite 30 files for no reader-visible reason.
 *
 *   no file          → translate
 *   hash differs     → the English prose moved; retranslate
 *   hash matches     → nothing to do
 *   English deleted  → delete the translation
 *   translationLocked: true → never touch it again (a human corrected it)
 *
 * ## The model never sees structure
 *
 * A file is parsed with the same readers the build uses, the leaf strings are
 * pulled out into a flat array, and only that array is sent. Figure tokens
 * (`{{programme:field:fmt}}`), link hrefs, asset ids and block types are
 * separate nodes in `shared/blocks.ts` and never reach the model, so they
 * cannot be damaged by it. The reply is checked, put back in the same slots,
 * and serialised with the repo's own writers — `writeContentFile`,
 * `writeNewsSections`, `writeBody`. A model that returns the wrong number of
 * strings, drops a figure, or hands back English is a failure that writes
 * nothing, never a file that is 90% right.
 *
 * ## Usage
 *
 *   node scripts/translate-content.mjs                  everything missing or stale
 *   node scripts/translate-content.mjs --check          report only, exit 0
 *   node scripts/translate-content.mjs --only <slug>    one article
 *   node scripts/translate-content.mjs --locale zh-hans one target
 *   node scripts/translate-content.mjs --force          ignore the hash, retranslate
 *
 * Run it through the TS resolve hook — it imports shared/ and src/lib:
 * `npm run i18n:translate`.
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { splitContentFile, writeContentFile } from "../shared/frontmatter.ts";
import { parseNewsSections, writeNewsSections } from "../shared/newsbody.ts";
import { parseBody, writeBody } from "../shared/markdown.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * What each non-English locale is made of.
 *
 * `translate` costs a model call per article; `opencc` is free and lossless
 * within one language, which is why Traditional is derived from Simplified and
 * not from English. A fourth locale is one row here plus a glossary below —
 * Korean and Japanese would both be `translate` from `en`, because no
 * conversion shortcut exists between languages the way it does between scripts.
 *
 * `zh-hant` is deliberately absent: `gen-zh-hant.mjs` owns it, and one file
 * owning one derivation is what keeps them from disagreeing.
 */
const TARGETS = {
  "zh-hans": { from: "en", via: "translate", language: "Simplified Chinese" },
};

/**
 * Terms the site has already settled on, so a translation does not invent a
 * second name for a programme the guides have called something else for a year.
 * Lifted from `src/locales/ui/zh-hans.ts` and
 * `src/locales/programmes/zh-hans.ts`, which remain the source of truth.
 */
const GLOSSARY = {
  "zh-hans": [
    ["PVIP / Premium Visa Programme", "高端签证计划（PVIP）"],
    ["MM2H / Malaysia My Second Home", "MM2H 第二家园计划"],
    ["MM2H Silver / Gold / Platinum tier", "MM2H 白银级 / 黄金级 / 白金级"],
    ["Sarawak MM2H / S-MM2H", "砂拉越 MM2H（S-MM2H）"],
    ["DE Rantau", "DE Rantau 数字游民准证"],
    ["Employment Pass", "工作准证（Employment Pass）"],
    ["Student Pass", "学生准证（Student Pass）"],
    ["fixed deposit", "定期存款"],
    ["participation fee", "参与费"],
    ["Immigration Department of Malaysia", "马来西亚移民局"],
    ["Ministry of Tourism, Arts and Culture (MOTAC)", "旅游、艺术及文化部（MOTAC）"],
    ["applicant / dependant", "申请人 / 受养人"],
    ["visa / pass", "签证 / 准证"],
    ["golden visa", "黄金签证"],
    ["digital nomad", "数字游民"],
    ["expat / expatriate", "外籍人士"],
  ],
};

// --- CLI --------------------------------------------------------------------

const ARGV = process.argv.slice(2);
const CHECK = ARGV.includes("--check");
const FORCE = ARGV.includes("--force");
const ONLY = flag("--only");
const ONE_LOCALE = flag("--locale");

function flag(name) {
  const i = ARGV.indexOf(name);
  return i === -1 ? null : (ARGV[i + 1] ?? null);
}

// --- Inline + block traversal ----------------------------------------------

/**
 * Visit every translatable string in an inline tree, in document order.
 *
 * One traversal, used twice: `visit` returns the string unchanged on the
 * collect pass and the translated one on the apply pass. Two traversals that
 * had to agree about order would be the obvious way to write this and the
 * obvious way to put a paragraph in the wrong slot.
 *
 * `fig` nodes carry no text and are skipped, which is why a live figure cannot
 * be translated into a literal number. `link` keeps its href and translates
 * only its label.
 */
function walkInline(nodes, visit) {
  if (!Array.isArray(nodes)) return nodes;
  return nodes.map((n) => {
    if (n.t === "text") return { ...n, v: visit(n.v) };
    if (n.t === "fig") return n;
    if (Array.isArray(n.c)) return { ...n, c: walkInline(n.c, visit) };
    return n;
  });
}

/** The same, for a `Block[]` body. Block types and asset ids never move. */
function walkBlocks(blocks, visit) {
  return blocks.map((b) => {
    switch (b.t) {
      case "heading":
      case "paragraph":
      case "pullquote":
      case "cta":
        return { ...b, c: walkInline(b.c, visit) };
      case "list":
        return { ...b, items: b.items.map((i) => walkInline(i, visit)) };
      case "callout":
        return {
          ...b,
          ...(b.title !== undefined && { title: visit(b.title) }),
          body: b.body.map((p) => walkInline(p, visit)),
        };
      case "figure":
        return b.caption === undefined ? b : { ...b, caption: visit(b.caption) };
      case "tierTable":
        return b.caption === undefined ? b : { ...b, caption: visit(b.caption) };
      case "table":
        return {
          ...b,
          ...(b.caption !== undefined && { caption: visit(b.caption) }),
          // A blank corner cell stays blank rather than being sent as an empty
          // string the model would fill in with something.
          head: b.head.map((h) => (h === "" ? h : visit(h))),
          rows: b.rows.map((r) => ({
            ...r,
            label: walkInline(r.label, visit),
            cells: r.cells.map((c) => ({ ...c, value: walkInline(c.value, visit) })),
          })),
          ...(b.notes !== undefined && {
            notes: b.notes.map((n) => walkInline(n, visit)),
          }),
        };
      default:
        // keyFacts, programmeNotice — every string they render is read from
        // programmes.ts at build time, in the reader's own locale already.
        return b;
    }
  });
}

// --- The two content kinds --------------------------------------------------

/**
 * A translation unit: what to send, and how to put the answer back.
 *
 * `strings` is the payload and the hash input. `rebuild(translated)` returns
 * the finished file text — frontmatter in the source file's own key order,
 * because the order is the reading order and a reordered file is a diff nobody
 * asked for.
 */
function newsUnit(raw) {
  const { data, body } = splitContentFile(raw);
  const sections = parseNewsSections(body);

  const strings = [];
  const take = (v) => {
    strings.push(v);
    return v;
  };

  // Order is the contract between this pass and the rebuild below.
  const shape = {
    headline: String(data.headline ?? ""),
    dek: String(data.dek ?? ""),
    keyPoints: (data.keyPoints ?? []).map(String),
    whatItMeans: (data.whatItMeans ?? []).map(String),
    sourceExcerpt:
      typeof data.sourceExcerpt === "string" ? data.sourceExcerpt : null,
    sections,
  };

  take(shape.headline);
  take(shape.dek);
  shape.keyPoints.forEach(take);
  shape.whatItMeans.forEach(take);
  if (shape.sourceExcerpt !== null) take(shape.sourceExcerpt);
  for (const s of shape.sections) {
    if (s.heading) take(s.heading);
    s.paragraphs.forEach(take);
  }

  function rebuild(t) {
    let i = 0;
    const next = () => t[i++];

    const out = { ...data };
    out.headline = next();
    out.dek = next();
    out.keyPoints = shape.keyPoints.map(next);
    out.whatItMeans = shape.whatItMeans.map(next);
    if (shape.sourceExcerpt !== null) out.sourceExcerpt = next();

    const translatedSections = shape.sections.map((s) => ({
      heading: s.heading ? next() : "",
      paragraphs: s.paragraphs.map(next),
    }));

    return { data: out, body: writeNewsSections(translatedSections) };
  }

  return { strings, rebuild };
}

function insightUnit(raw) {
  const { data, body } = splitContentFile(raw);
  const blocks = parseBody(body);

  const strings = [];
  const collect = (v) => {
    strings.push(v);
    return v;
  };

  const faq = Array.isArray(data.faq) ? data.faq : [];
  const guides = Array.isArray(data.relatedGuides) ? data.relatedGuides : [];

  collect(String(data.title ?? ""));
  collect(String(data.dek ?? ""));
  for (const g of guides) collect(String(g.title ?? ""));
  for (const f of faq) {
    collect(String(f.q ?? ""));
    collect(String(f.a ?? ""));
  }
  walkBlocks(blocks, collect);

  function rebuild(t) {
    let i = 0;
    const next = () => t[i++];

    const out = { ...data };
    out.title = next();
    out.dek = next();
    // `path` is a URL and stays; only the label a reader clicks is translated.
    out.relatedGuides = guides.map((g) => ({ ...g, title: next() }));
    out.faq = faq.map((f) => ({ ...f, q: next(), a: next() }));
    // `sources` is deliberately untouched: the label names an English-language
    // government document, and a reader following the link has to recognise it
    // on the page it lands on.

    return { data: out, body: writeBody(walkBlocks(blocks, next)) };
  }

  return { strings, rebuild };
}

/** Every English document, with where its translation belongs. */
async function sources() {
  const items = [];

  const newsDir = path.join(ROOT, "content", "news");
  for (const file of (await readdir(newsDir)).filter((f) => f.endsWith(".md")).sort()) {
    items.push({
      kind: "news",
      slug: file.replace(/\.md$/, ""),
      src: path.join(newsDir, file),
      rel: path.posix.join("news", file),
      unit: newsUnit,
    });
  }

  const insightsDir = path.join(ROOT, "content", "insights");
  const entries = await readdir(insightsDir, { withFileTypes: true });
  for (const dir of entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    const files = (await readdir(path.join(insightsDir, dir)))
      .filter((f) => f.endsWith(".md"))
      .sort();
    for (const file of files) {
      items.push({
        kind: "insight",
        slug: file.replace(/\.md$/, ""),
        src: path.join(insightsDir, dir, file),
        rel: path.posix.join("insights", dir, file),
        unit: insightUnit,
      });
    }
  }

  return items;
}

// --- Guards -----------------------------------------------------------------

/**
 * Digit runs with their separators, so 200,000 and 176.9 each match as one
 * token and a reformat reads as a change. Lifted from `numericFidelity()` in
 * worker/src/humanize.ts, which guards the humanize pass the same way.
 */
function figures(strings) {
  return new Set(strings.join(" ").match(/\d[\d,.]*\d|\d/g) ?? []);
}

const HAN = /[一-鿿㐀-䶿]/;

/**
 * A month name in the source is a digit in the translation.
 *
 * "27 August" becomes 8月27日, which introduces an 8 that was never in the
 * English. Without this the invented-figure check fires on every article that
 * dates itself in prose — a false positive that would send perfectly good
 * translations round the retry loop until they gave up.
 */
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function monthDigits(strings) {
  const text = strings.join(" ").toLowerCase();
  const out = new Set();
  MONTHS.forEach((m, i) => {
    if (text.includes(m)) out.add(String(i + 1));
  });
  return out;
}

/**
 * Reasons this reply cannot be written. Empty array means it can.
 *
 * The script check is the one that matters in practice: a model under load
 * returns the input verbatim often enough that without this the site would
 * quietly grow English pages on a Chinese host, which is worse than having no
 * Chinese page at all — Google sees a duplicate, and the reader sees a broken
 * promise from the language switcher.
 */
function reject(before, after, locale) {
  const problems = [];

  if (!Array.isArray(after)) return ["the reply was not a JSON array"];
  if (after.length !== before.length) {
    return [`expected ${before.length} strings, got ${after.length}`];
  }

  const empty = after.filter((s, i) => before[i].trim() !== "" && String(s).trim() === "");
  if (empty.length) problems.push(`${empty.length} string(s) came back empty`);

  const had = figures(before);
  const got = figures(after);
  const fromMonths = monthDigits(before);

  const lost = [...had].filter((n) => !got.has(n));
  const invented = [...got].filter((n) => !had.has(n) && !fromMonths.has(n));
  if (lost.length) problems.push(`figures lost: ${lost.join(", ")}`);
  if (invented.length) problems.push(`figures invented: ${invented.join(", ")}`);

  if (locale.startsWith("zh")) {
    // A short string can legitimately survive as-is ("MM2H", "PVIP", a name).
    // A sentence cannot.
    const untranslated = after.filter(
      (s, i) => before[i].replace(/[^A-Za-z]/g, "").length >= 24 && !HAN.test(String(s)),
    );
    if (untranslated.length) {
      problems.push(`${untranslated.length} string(s) came back untranslated`);
    }
  }

  return problems;
}

// --- The model --------------------------------------------------------------

/**
 * Provider and models.
 *
 * ## Why Workers AI and not Gemini, despite Gemini being better at this
 *
 * A frontier flash model writes measurably better Chinese than an open 27B one,
 * and on quality alone Gemini would win. It cannot be the default because the
 * free tier is metered at **20 requests per day, per model** — measured
 * 2026-09-01, `GenerateRequestsPerDayPerProjectPerModel-FreeTier` — and a
 * single backfill of this repo is around fifty. It answers 429 halfway through
 * and the failure is per-article, so half the site translates and half does
 * not. Workers AI is on the account this project already bills to, has no daily
 * cap, and is where the rest of the pipeline's inference already runs.
 *
 * `TRANSLATE_PROVIDER=gemini` remains a complete second implementation, and is
 * the right choice for a handful of articles on a paid Gemini key. Set
 * `TRANSLATE_MODEL` to spread a backfill across models if you are on the free
 * tier — the daily quota is per model, so a second model buys 20 more.
 *
 * Cloudflare needs `CLOUDFLARE_API_TOKEN` with **Workers AI: Read**. A wrangler
 * OAuth session is NOT enough: api.cloudflare.com answers 10000 Authentication
 * error to it on this endpoint, so the token has to be minted in the dashboard.
 */
const PROVIDER = process.env.TRANSLATE_PROVIDER ?? "cloudflare";
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? "d6bfff8a6a949401fc1ccb437e40a3ea";
const MODELS = {
  gemini: {
    first: process.env.TRANSLATE_MODEL ?? "gemini-3.6-flash",
    // A different model rather than a bigger one. On the free tier the pro
    // models' quota is small enough that a retry there answers 429 more often
    // than it answers at all, turning a recoverable failure into a dead end —
    // and a second flash model brings its own 20-a-day allowance with it.
    retry: process.env.TRANSLATE_MODEL_RETRY ?? "gemini-3.7-flash",
  },
  cloudflare: {
    first: process.env.TRANSLATE_MODEL ?? "@cf/qwen/qwen3.8-27b",
    retry: process.env.TRANSLATE_MODEL_RETRY ?? "@cf/deepseek-ai/deepseek-v4-flash-0731",
  },
};

/** Which model string ends up in the file's `translationModel` field. */
function modelName(retry) {
  const m = MODELS[PROVIDER] ?? MODELS.gemini;
  return retry ? m.retry : m.first;
}

function systemPrompt(locale) {
  const target = TARGETS[locale].language;
  const glossary = (GLOSSARY[locale] ?? [])
    .map(([en, zh]) => `  ${en} → ${zh}`)
    .join("\n");

  return `You translate editorial content for malaysiavisaguide.com, an independent reference on Malaysia's long-stay visa programmes, from English into ${target}.

The reader is a prospective applicant — a retiree, a high-net-worth individual or an expatriate — reading in ${target}. Write the register a serious newspaper would use: plain, precise, formal without being stiff. Translate the meaning, not the word order.

RULES, all of them absolute:
1. Every number, currency code and date stays exactly as written. USD 150,000 stays "USD 150,000" and never becomes 15万美元. RM 200,000 stays "RM 200,000". Years, percentages and tier thresholds are copied character for character.
2. Names of people, publications and organisations keep their English form. Give the ${target} name first with the English in brackets on first mention where the site already does so.
3. Use these established terms:
${glossary}
4. Translate each string independently and completely. Do not merge, split, reorder, summarise or explain. Do not add a sentence that was not there.
5. Never output markdown, HTML, quotation marks around the whole string, or a translator's note.
6. A string that is only a proper noun or a code may come back unchanged.
7. A date written as prose takes the ${target} convention — "27 August" becomes 8月27日, "27 August 2026" becomes 2026年8月27日 — keeping the same digits. Never leave an English month name sitting inside a ${target} sentence.

You are given a JSON object {"t": [...]} of strings. You reply with a JSON object {"t": [...]} holding exactly the same number of strings, in the same order, translated. You output only JSON.`;
}

/**
 * The object out of whatever the model wrapped it in.
 *
 * Two things have to survive: a ```json fence, and the `<think>` block a
 * reasoning model emits before its answer. The think block can itself contain
 * braces, so this tries each `{` in turn rather than assuming the first one
 * opens the JSON — the assumption that turns a good reply into "unparseable".
 */
function parseReply(raw) {
  const text = String(raw ?? "")
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/```(?:json)?/g, "")
    .trim();

  const end = text.lastIndexOf("}");
  if (end === -1) return null;

  for (let i = text.indexOf("{"); i !== -1 && i < end; i = text.indexOf("{", i + 1)) {
    try {
      const parsed = JSON.parse(text.slice(i, end + 1));
      if (Array.isArray(parsed?.t)) return parsed.t.map((s) => String(s));
    } catch {
      // Not the opening brace of the answer — try the next one.
    }
  }
  return null;
}

/**
 * One request, with the transient failures waited out.
 *
 * Both providers answer 503 when a model is busy and 429 when a quota window
 * is full, and both clear on their own. Treating either as a translation
 * failure would burn the two real attempts on a queue, and then report a
 * content problem that does not exist.
 */
async function fetchRetrying(url, init, label) {
  const waits = [2000, 6000, 15000, 30000];
  for (let i = 0; ; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;

    const transient = res.status === 429 || res.status >= 500;
    if (!transient || i >= waits.length) {
      throw new Error(`${label} answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    await new Promise((r) => setTimeout(r, waits[i]));
  }
}

async function callCloudflare(system, user, retry) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN is not set. Mint a token with Workers AI: Read, " +
        "or run with TRANSLATE_PROVIDER=gemini.",
    );
  }

  const res = await fetchRetrying(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${modelName(retry)}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        // Generous: a reasoning model bills its thinking against the same
        // budget as its answer, and too small a cap returns an empty message
        // that reads like a parse bug. See worker/src/article.ts.
        max_tokens: 16000,
        temperature: 0.2,
      }),
    },
    "Workers AI",
  );

  const body = await res.json();
  return body?.result?.response ?? "";
}

async function callGemini(system, user, retry) {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set.");

  const res = await fetchRetrying(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName(retry)}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          // Translation is not a reasoning task, and the thinking is billed
          // against the same budget as the answer. Low, not off: the models
          // spend a few hundred tokens regardless.
          thinkingConfig: { thinkingLevel: "low" },
          maxOutputTokens: 32768,
        },
      }),
    },
    "Gemini",
  );

  const body = await res.json();
  return body?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
}

async function ask(system, user, retry) {
  return PROVIDER === "gemini"
    ? await callGemini(system, user, retry)
    : await callCloudflare(system, user, retry);
}

/**
 * Batch so one long article cannot run into the output cap.
 *
 * Batches are cut on string boundaries and reassembled in order, so a batch
 * boundary can never move a paragraph — the failure a naive character split
 * would produce.
 */
function batches(strings, maxChars = 5000, maxItems = 30) {
  const out = [];
  let cur = [];
  let size = 0;
  for (const s of strings) {
    if (cur.length && (size + s.length > maxChars || cur.length >= maxItems)) {
      out.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(s);
    size += s.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

/**
 * Three attempts, and the second is the one that earns its place.
 *
 * The characteristic failure is not a malformed reply, it is a good
 * translation that rewrote "USD 150,000" as 15万美元 — idiomatic Chinese, and
 * wrong for this site, because the figure has to match the government document
 * it cites. Handing the model its own violation back fixes that far more often
 * than a different model would, so the escalation order is: ask, ask again with
 * the specific problem named, then ask a stronger model with the same.
 */
async function translate(strings, locale) {
  const system = systemPrompt(locale);
  const chunks = batches(strings);
  const done = [];

  for (const chunk of chunks) {
    const payload = JSON.stringify({ t: chunk });
    const log = [];
    let accepted = null;

    for (const attempt of [0, 1, 2]) {
      const retry = attempt === 2;
      const user =
        attempt === 0
          ? payload
          : `${payload}\n\nYour previous reply was rejected: ${log[log.length - 1]}. ` +
            `Translate again, fixing exactly that. Every digit must appear in your ` +
            `reply exactly as it appears in the input.`;

      let reply;
      try {
        reply = parseReply(await ask(system, user, retry));
      } catch (err) {
        log.push(String(err));
        continue;
      }

      const problems = reply === null ? ["the reply was not JSON"] : reject(chunk, reply, locale);
      if (problems.length === 0) {
        accepted = reply;
        break;
      }
      log.push(problems.join("; "));
    }

    if (!accepted) return { ok: false, problems: log };
    done.push(...accepted);
  }

  return { ok: true, strings: done };
}

// --- Reconcile --------------------------------------------------------------

function hashOf(strings) {
  return `sha256:${createHash("sha256").update(JSON.stringify(strings)).digest("hex").slice(0, 32)}`;
}

async function readIfPresent(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

/** Translated files that no longer have an English source behind them. */
async function orphans(locale, expected) {
  const base = path.join(ROOT, "content", locale);
  const found = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.endsWith(".md")) {
        const rel = path.posix.normalize(path.relative(base, full).split(path.sep).join("/"));
        if (!expected.has(rel)) found.push(full);
      }
    }
  }
  await walk(base);
  return found;
}

async function main() {
  const targets = Object.keys(TARGETS).filter((l) => !ONE_LOCALE || l === ONE_LOCALE);
  if (targets.length === 0) {
    console.error(`translate-content: no such target locale — ${ONE_LOCALE}`);
    process.exit(1);
  }

  const docs = (await sources()).filter((d) => !ONLY || d.slug === ONLY);
  if (ONLY && docs.length === 0) {
    console.error(`translate-content: no English document with slug "${ONLY}".`);
    process.exit(1);
  }

  let written = 0;
  let current = 0;
  let removed = 0;
  const stale = [];
  const failed = [];

  for (const locale of targets) {
    const expected = new Set(docs.map((d) => d.rel));

    for (const doc of docs) {
      const raw = await readFile(doc.src, "utf8");
      const unit = doc.unit(raw);
      const hash = hashOf(unit.strings);

      const out = path.join(ROOT, "content", locale, doc.rel);
      const existing = await readIfPresent(out);

      if (existing) {
        const { data } = splitContentFile(existing);
        if (data.translationLocked === true) {
          current += 1;
          continue;
        }
        if (data.sourceHash === hash && !FORCE) {
          current += 1;
          continue;
        }
      }

      const what = existing ? "stale" : "missing";
      stale.push(`${locale}/${doc.rel} (${what})`);
      if (CHECK) continue;

      process.stdout.write(`translate-content: ${locale}/${doc.rel} … `);
      const result = await translate(unit.strings, locale);
      if (!result.ok) {
        console.log("failed");
        failed.push(
          `${locale}/${doc.rel}\n` +
            result.problems.map((p, i) => `      attempt ${i + 1}: ${p}`).join("\n"),
        );
        continue;
      }

      const { data, body } = unit.rebuild(result.strings);
      const file = writeContentFile(
        {
          ...data,
          sourceHash: hash,
          translatedAt: new Date().toISOString(),
          translationModel: modelName(false),
        },
        body,
      );

      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, file);
      written += 1;
      console.log(`${unit.strings.length} strings`);
    }

    // Only safe to prune when the full corpus was considered.
    if (!ONLY) {
      for (const file of await orphans(locale, expected)) {
        const rel = path.relative(ROOT, file);
        if (CHECK) {
          stale.push(`${rel} (orphaned)`);
          continue;
        }
        await rm(file);
        removed += 1;
        console.log(`translate-content: removed ${rel} — no English source`);
      }
    }
  }

  if (CHECK) {
    console.log(
      stale.length === 0
        ? `translate-content: ${current} translation(s) up to date.`
        : `translate-content: ${current} up to date, ${stale.length} to do:\n` +
            stale.map((s) => `  ${s}`).join("\n"),
    );
    // Advisory on purpose. The build immediately after an English publish
    // legitimately has no translation yet, and failing here would stop the
    // English article going live over a Chinese page nobody has yet.
    process.exit(0);
  }

  console.log(
    `translate-content: ${written} written, ${current} already current` +
      (removed ? `, ${removed} removed` : "") +
      (failed.length ? `, ${failed.length} FAILED` : "") +
      ".",
  );

  if (failed.length) {
    console.error(
      `\ntranslate-content: these were left untranslated rather than written half-right:\n` +
        failed.map((f) => `  ${f}`).join("\n"),
    );
    process.exit(1);
  }
}

await main();
