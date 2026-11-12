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
 * It works out for itself what is missing, what has gone stale and what should
 * no longer exist, so it covers both producers and a file edited by hand.
 *
 * Since 2026-11-12 it is run automatically by a launchd job on Jason's Mac
 * (`~/Claude/mvg-translate/translate.sh`, every 5 minutes, on its own clone):
 * when origin/main has English that is missing or stale in Chinese, it runs
 * this with `TRANSLATE_PROVIDER=claude` and pushes `content/zh-hans/`. It
 * replaced a GitHub Action, removed the same day: Workers AI failed on almost
 * every real translation, Gemini's free tier ran out mid-backfill, and the
 * `claude` CLI cannot run on a GitHub runner. The Mac must be awake; a run
 * missed while it sleeps happens on wake.
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
 *   node scripts/translate-content.mjs --adopt --only <slug>
 *       the translation was corrected by hand to match an English edit: record
 *       the current source hash without calling a model. For when both
 *       providers are down and the change is a sentence or two.
 *
 * Run it through the TS resolve hook — it imports shared/ and src/lib:
 * `npm run i18n:translate`.
 */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);

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
    ["PVIP / Premium Visa Programme (full name)", "PVIP高级签证计划"],
    ["PVIP (short form, after the full name)", "PVIP"],
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
    ["Anwar Ibrahim", "安华·依布拉欣"],
    ["Penang", "槟城"],
    ["Budget speech", "预算案演词"],
    ["Category I / II / III (Employment Pass)", "第一类 / 第二类 / 第三类"],
  ],
};

// --- CLI --------------------------------------------------------------------

const ARGV = process.argv.slice(2);
const CHECK = ARGV.includes("--check");
const FORCE = ARGV.includes("--force");
// Only ever with --only: adopting everything at once would silently mark every
// stale translation as current.
const ADOPT = ARGV.includes("--adopt") && Boolean(flag("--only"));
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
    // The Register button on an event story. Appended after sourceExcerpt and
    // only when present, so an article without one keeps its sourceHash.
    ctaLabel: typeof data.ctaLabel === "string" ? data.ctaLabel : null,
    ctaNote: typeof data.ctaNote === "string" ? data.ctaNote : null,
    sections,
  };

  take(shape.headline);
  take(shape.dek);
  shape.keyPoints.forEach(take);
  shape.whatItMeans.forEach(take);
  if (shape.sourceExcerpt !== null) take(shape.sourceExcerpt);
  if (shape.ctaLabel !== null) take(shape.ctaLabel);
  if (shape.ctaNote !== null) take(shape.ctaNote);
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
    if (shape.ctaLabel !== null) out.ctaLabel = next();
    if (shape.ctaNote !== null) out.ctaNote = next();

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
      // A draft is noindex and unlisted, so it needs no Chinese yet — and the
      // long drafts of the set-up series timed out on Workers AI on every push
      // (10–15 Oct 2026), failing the run each time. It is picked up the push
      // after `draft: true` is removed. `--only` still translates one on demand.
      if (!ONLY) {
        const { data } = splitContentFile(await readFile(path.join(insightsDir, dir, file), "utf8"));
        if (data.draft === true) continue;
      }
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
 * `claude` (the default) is the local Claude Code CLI and is the one that
 * works. `cloudflare` (Workers AI) is kept as a fallback but has failed on most
 * real articles. The Gemini provider was removed on 2026-11-12: its free tier
 * allows 20 requests per day per model, and a backfill needs around fifty.
 *
 * Cloudflare needs `CLOUDFLARE_API_TOKEN` with **Workers AI: Read**. A wrangler
 * OAuth session is NOT enough: api.cloudflare.com answers 10000 Authentication
 * error to it on this endpoint, so the token has to be minted in the dashboard.
 */
const PROVIDER = process.env.TRANSLATE_PROVIDER ?? "claude";
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? "d6bfff8a6a949401fc1ccb437e40a3ea";
const MODELS = {
  cloudflare: {
    first: process.env.TRANSLATE_MODEL ?? "@cf/qwen/qwen3.8-27b",
    // NOT deepseek-v4-flash: it is listed in `wrangler ai models` but answers
    // 403 "not available on the Workers Free plan", so the escalation attempt
    // died on billing rather than on the content — and only ever on the third
    // attempt, which is the hardest failure to reproduce. Checked 2026-09-16.
    retry: process.env.TRANSLATE_MODEL_RETRY ?? "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  },
  claude: {
    first: process.env.TRANSLATE_MODEL ?? "claude-sonnet-5-5",
    retry: process.env.TRANSLATE_MODEL_RETRY ?? "claude-sonnet-5-5",
  },
};

/** Which model string ends up in the file's `translationModel` field. */
function modelName(retry) {
  const m = MODELS[PROVIDER];
  if (!m) throw new Error(`Unknown TRANSLATE_PROVIDER "${PROVIDER}" — use claude or cloudflare.`);
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
8. A number written as a word in English stays a word. "ten years" is 十年, never 10年; "five tiers" is 五档, never 5档; "one of the two" is 两者之一, never 2者之一. Arabic digits belong in your reply only where Arabic digits stand in the input. This is rule 1 in the other direction and just as absolute.
9. Use full-width ${target} punctuation (，。：；“”（）) in every string, from the first to the last. Malaysian people and places take the names the Malaysian Chinese press uses (Penang is 槟城, Anwar Ibrahim is 安华·依布拉欣).

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
      const body = (await res.text()).slice(0, 300);
      if (res.status === 429) throw new QuotaExhausted(`${label}: ${body}`);
      throw new Error(`${label} answered ${res.status}: ${body}`);
    }
    await new Promise((r) => setTimeout(r, waits[i]));
  }
}

/**
 * The provider's allowance is gone, as opposed to this article being hard to
 * translate.
 *
 * Told apart because the responses are: a run that keeps going after a quota
 * wall spends nine failed requests per remaining article discovering the same
 * wall, and reports a page of translation failures for a problem that is not
 * about the content at all. Stopping is also safe, which is the point of a
 * reconciler — whatever was written stands, and the next run picks up the rest.
 */
class QuotaExhausted extends Error {}

async function callCloudflare(system, user, retry) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN is not set. Mint a token with Workers AI: Read, " +
        "or run with TRANSLATE_PROVIDER=claude.",
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

/**
 * Claude, through the locally installed `claude` CLI.
 *
 * ## Why the CLI and not the Anthropic SDK
 *
 * The SDK wants a credential this machine does not have: no `ANTHROPIC_API_KEY`
 * and no `ant auth login` profile. The `claude` binary is already authenticated
 * — it is what Jason runs every day — so this provider needs nothing minted and
 * nothing stored. The cost is that it is local-only: it cannot run on a GitHub
 * runner, which is one reason translation is now run by hand.
 *
 * `-p` prints one reply and exits, `--output-format text` keeps it plain rather
 * than a stream-json envelope, and `--system-prompt` replaces the CLI's own
 * system prompt with ours rather than appending to it — `--append-system-prompt`
 * would leave Claude Code's agent instructions in front of the translation
 * rules, which is a different and much longer prompt than Workers AI is given.
 *
 * The payload goes as an argv string, which caps at roughly 1MB on macOS. A
 * batch is 5000 characters (`batches()`), so there is three orders of magnitude
 * of headroom and no need for stdin plumbing.
 */
async function callClaude(system, user, retry) {
  try {
    const { stdout } = await run(
      "claude",
      ["-p", user, "--model", modelName(retry), "--system-prompt", system, "--output-format", "text"],
      { maxBuffer: 32 * 1024 * 1024, timeout: 10 * 60 * 1000 },
    );
    return stdout;
  } catch (err) {
    if (err?.code === "ENOENT") {
      throw new Error(
        "the `claude` CLI is not on PATH. Install Claude Code, or run with " +
          "TRANSLATE_PROVIDER=cloudflare and CLOUDFLARE_API_TOKEN set.",
      );
    }
    throw new Error(`claude CLI failed: ${err?.stderr?.trim() || err?.message || err}`);
  }
}

async function ask(system, user, retry) {
  return PROVIDER === "claude"
    ? await callClaude(system, user, retry)
    : await callCloudflare(system, user, retry);
}

/**
 * Batch so one long article cannot run into the output cap.
 *
 * Batches are cut on string boundaries and reassembled in order, so a batch
 * boundary can never move a paragraph — the failure a naive character split
 * would produce.
 *
 * Small enough that a reasoning model finishes inside Workers AI's request
 * timeout: at 5000 chars / 30 strings, four ~2,000-word insights answered 408
 * on every attempt (2026-10-02), and Gemini dropped a string from a 30-string
 * batch. Batch size does not enter the sourceHash, so nothing re-translates.
 */
function batches(strings, maxChars = 2000, maxItems = 12) {
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
            `reply exactly as it appears in the input, and your reply must contain ` +
            `no digit the input does not: an English number word becomes a number ` +
            `word in the target language, never an Arabic digit.`;

      let reply;
      try {
        reply = parseReply(await ask(system, user, retry));
      } catch (err) {
        if (err instanceof QuotaExhausted) throw err;
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
    done.push(...accepted.map((s) => fixup(s, locale)));
  }

  return { ok: true, strings: done };
}

/**
 * Deterministic repair of the mistakes the model keeps making, applied to every
 * accepted string. Each entry came out of a hand review of a published
 * translation (2026-09/10); the glossary asks for the right form, this makes
 * sure of it. Nothing here touches a digit, so it cannot trip `reject()`.
 */
const FIXUPS = {
  "zh-hans": [
    [/安瓦尔·易卜拉欣|安华·易卜拉欣|安瓦尔·依布拉欣/g, "安华·依布拉欣"],
    [/槛城/g, "槟城"],
    // Jason's ruling 2026-11-12: the Chinese name is PVIP高级签证计划, nothing else.
    [/(?:高端|尊贵|高级|优质)签证计划（PVIP）(?:签证)?|尊贵签证（PVIP）|(?<![A-Za-z])PVIP\s?(?:高端|尊贵)签证(?:计划)?|(?<!PVIP)(?:高端|尊贵)签证计划/g, "PVIP高级签证计划"],
    // Half-width punctuation between Chinese characters → full-width.
    [/(\p{Script=Han})\s*,\s*(?=\p{Script=Han})/gu, "$1，"],
    [/(\p{Script=Han})\s*;\s*(?=\p{Script=Han})/gu, "$1；"],
    [/(\p{Script=Han})\s*:\s*(?=\p{Script=Han})/gu, "$1："],
    [/"([^"\n]*\p{Script=Han}[^"\n]*)"/gu, "“$1”"],
  ],
};

function fixup(s, locale) {
  let out = s;
  for (const [re, to] of FIXUPS[locale] ?? []) out = out.replace(re, to);
  return out;
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

/**
 * Translated files that no longer have an English source behind them.
 *
 * A file marked `chineseOnly: true` was written in Chinese and never had one —
 * a Mandarin-only webinar, say. It is not an orphan and is never removed.
 */
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
        if (expected.has(rel)) continue;
        const { data } = splitContentFile(await readFile(full, "utf8"));
        if (data.chineseOnly !== true) found.push(full);
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
  let quotaWall = null;
  const stale = [];
  const failed = [];

  for (const locale of targets) {
    if (quotaWall) break;
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
        if (ADOPT) {
          await writeFile(
            out,
            existing.replace(/^sourceHash: .*$/m, `sourceHash: "${hash}"`),
          );
          console.log(`translate-content: ${locale}/${doc.rel} … adopted by hand`);
          current += 1;
          continue;
        }
      }

      const what = existing ? "stale" : "missing";
      stale.push(`${locale}/${doc.rel} (${what})`);
      if (CHECK) continue;

      process.stdout.write(`translate-content: ${locale}/${doc.rel} … `);
      let result;
      try {
        result = await translate(unit.strings, locale);
      } catch (err) {
        if (!(err instanceof QuotaExhausted)) throw err;
        console.log("quota exhausted");
        quotaWall = String(err.message);
        break;
      }
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

    // Only safe to prune when the full corpus was actually considered — a run
    // cut short by a quota wall has not seen the rest of it.
    if (!ONLY && !quotaWall) {
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

  // The per-file reasons come FIRST, before the quota note, and print whether
  // or not the run later hit the wall.
  //
  // They used to print only in the branch below, which the quota wall returned
  // past. So a file that failed for a real reason — a lost figure, a reply that
  // came back in English — had its diagnosis thrown away every time the run
  // subsequently ran out of allowance, and the summary line said "1 FAILED"
  // with nothing to act on. That hid the same article's failure twice across
  // two sessions before anyone noticed the branch order was the cause.
  //
  // `failed` and the quota wall are different things: a file that stopped
  // because the allowance ran out is never in here, so everything below is a
  // genuine failure worth reading.
  if (failed.length) {
    console.error(
      `\ntranslate-content: these were left untranslated rather than written half-right:\n` +
        failed.map((f) => `  ${f}`).join("\n"),
    );
  }

  if (quotaWall) {
    // Exit 0 even when something above genuinely failed. Nothing is wrong with
    // the content and nothing was half-written; the provider is simply out of
    // allowance, and the next run continues from here. Failing the job would
    // turn a deferral into a red build. The genuine failures are printed above
    // and the next run will report them again with a non-zero exit.
    console.log(
      `\ntranslate-content: stopped early — the provider's quota is exhausted.\n` +
        `  ${quotaWall}\n` +
        `What was translated is written. Re-run to continue; ` +
        `\`--check\` lists what is outstanding.`,
    );
    process.exit(0);
  }

  if (failed.length) process.exit(1);
}

await main();
