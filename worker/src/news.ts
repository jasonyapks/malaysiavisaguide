import type { Env } from "./types";

/**
 * News sourcing — SPEC "curated feeds + AI summary" path.
 *
 * We query Google News RSS with a curated set of Malaysia long-stay-visa
 * searches. Google News aggregates reputable outlets and hands us, per item, a
 * headline, a link, a publish date and the *source outlet name* — everything a
 * citation needs. For each new item we ask Workers AI for a short, neutral
 * summary + a category, and store it as 'pending'. Nothing is reproduced: we
 * keep a summary + link, and the public page cites and links out.
 */

// Each query maps to the programme it most likely concerns; the AI can override.
const FEEDS: { query: string; category: string }[] = [
  { query: "Malaysia MM2H visa", category: "mm2h" },
  { query: "Malaysia Premium Visa Programme PVIP", category: "pvip" },
  { query: "Sarawak MM2H visa", category: "sarawak-mm2h" },
  { query: "Malaysia DE Rantau nomad pass", category: "de-rantau" },
  { query: "Malaysia expatriate employment pass immigration", category: "general" },
];

const VALID_CATEGORIES = new Set([
  "pvip",
  "mm2h",
  "sarawak-mm2h",
  "de-rantau",
  "employment-pass",
  "student-pass",
  "general",
]);

const PER_RUN_LIMIT = 20; // cap AI calls + inserts per sweep

interface RawItem {
  title: string;
  link: string;
  sourceName: string;
  pubDate: string | null;
  description: string;
  fallbackCategory: string;
}

/** Fetch every feed, summarise new items, insert as pending. Returns count added. */
export async function runNewsSweep(env: Env): Promise<number> {
  const seen = new Set<string>();
  const candidates: RawItem[] = [];

  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed.query, feed.category);
      for (const it of items) {
        if (seen.has(it.link)) continue;
        seen.add(it.link);
        candidates.push(it);
      }
    } catch (err) {
      console.log(`[news] feed failed: ${feed.query} — ${String(err)}`);
    }
  }

  // Skip anything already stored (by source_url).
  const fresh: RawItem[] = [];
  for (const c of candidates) {
    const existing = await env.DB.prepare(
      "SELECT 1 FROM news_items WHERE source_url = ?",
    )
      .bind(c.link)
      .first();
    if (!existing) fresh.push(c);
    if (fresh.length >= PER_RUN_LIMIT) break;
  }

  let added = 0;
  for (const item of fresh) {
    const enriched = await summarise(env, item);
    if (!enriched) continue; // AI judged it irrelevant
    await insertPending(env, item, enriched);
    added++;
  }
  console.log(`[news] sweep complete — ${added} new pending items`);
  return added;
}

/** Fetch and summarise a single pasted URL (dashboard manual submit). */
export async function submitUrl(env: Env, url: string): Promise<boolean> {
  const existing = await env.DB.prepare(
    "SELECT 1 FROM news_items WHERE source_url = ?",
  )
    .bind(url)
    .first();
  if (existing) return false;

  const res = await fetch(url, { headers: { "user-agent": "mvg-news/1.0" } });
  const html = await res.text();
  const title = stripTags(match(html, /<title[^>]*>([\s\S]*?)<\/title>/i)) || url;
  const desc =
    stripTags(match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)) ||
    stripTags(match(html, /<p[^>]*>([\s\S]*?)<\/p>/i));

  const item: RawItem = {
    title,
    link: url,
    sourceName: new URL(url).hostname.replace(/^www\./, ""),
    pubDate: new Date().toISOString(),
    description: desc,
    fallbackCategory: "general",
  };
  const enriched = await summarise(env, item);
  if (!enriched) return false;
  await insertPending(env, item, enriched);
  return true;
}

async function fetchFeed(query: string, fallbackCategory: string): Promise<RawItem[]> {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=en-MY&gl=MY&ceid=MY:en";
  const res = await fetch(url, { headers: { "user-agent": "mvg-news/1.0" } });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const xml = await res.text();
  return parseRss(xml, fallbackCategory);
}

/** Minimal RSS parser for Google News output (consistent, item-per-<item>). */
function parseRss(xml: string, fallbackCategory: string): RawItem[] {
  const out: RawItem[] = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const block of items) {
    const title = decode(stripCdata(match(block, /<title>([\s\S]*?)<\/title>/)));
    const link = decode(stripCdata(match(block, /<link>([\s\S]*?)<\/link>/))).trim();
    const pubDate = match(block, /<pubDate>([\s\S]*?)<\/pubDate>/).trim();
    const description = stripTags(
      decode(stripCdata(match(block, /<description>([\s\S]*?)<\/description>/))),
    );
    // Google News: <source url="...">The Star</source>
    const sourceName =
      decode(stripCdata(match(block, /<source[^>]*>([\s\S]*?)<\/source>/))).trim() ||
      "News source";
    if (!title || !link) continue;
    out.push({
      title: stripSourceSuffix(title, sourceName),
      link,
      sourceName,
      pubDate: pubDate ? new Date(pubDate).toISOString() : null,
      description,
      fallbackCategory,
    });
  }
  return out;
}

interface Enriched {
  summary: string;
  category: string;
}

/** Ask Workers AI for a neutral 2-sentence summary + a category. */
async function summarise(env: Env, item: RawItem): Promise<Enriched | null> {
  const prompt = `You are the editor of an independent Malaysia long-stay visa guide.
Given a news headline and snippet, decide if it is genuinely relevant to Malaysia's
long-stay visa or immigration programmes (PVIP, MM2H, Sarawak MM2H, DE Rantau,
Employment Pass, Student Pass, or Malaysian immigration policy for foreigners).

Respond with ONLY a JSON object, no prose:
{"relevant": boolean, "summary": string, "category": string}

- summary: your own neutral 2-sentence summary. Do NOT copy the snippet verbatim.
- category: one of pvip, mm2h, sarawak-mm2h, de-rantau, employment-pass, student-pass, general.
- If not relevant, set relevant=false and leave summary/category empty.

HEADLINE: ${item.title}
SNIPPET: ${item.description.slice(0, 600)}
SOURCE: ${item.sourceName}`;

  try {
    const resp = (await env.AI.run(env.SUMMARY_MODEL as keyof AiModels, {
      messages: [{ role: "user", content: prompt }],
      // Ask for compact, deterministic output.
      max_tokens: 300,
    } as never)) as { response?: string };

    const raw = typeof resp?.response === "string" ? resp.response : "";
    const parsed = extractJson(raw);
    if (!parsed || parsed.relevant !== true) return null;

    const summary = String(parsed.summary ?? "").trim();
    if (summary.length < 20) return null;

    let category = String(parsed.category ?? "").trim();
    if (!VALID_CATEGORIES.has(category)) category = item.fallbackCategory;

    return { summary, category };
  } catch (err) {
    console.log(`[news] summarise failed — ${String(err)}`);
    return null;
  }
}

async function insertPending(env: Env, item: RawItem, e: Enriched): Promise<void> {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO news_items
       (id, title, summary, category, source_name, source_url, published_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
  )
    .bind(
      crypto.randomUUID(),
      item.title.slice(0, 300),
      e.summary.slice(0, 800),
      e.category,
      item.sourceName.slice(0, 120),
      item.link,
      item.pubDate,
    )
    .run();
}

// --- tiny string helpers (no XML lib in Workers) ---

function match(s: string, re: RegExp): string {
  const m = s.match(re);
  return m ? m[1] : "";
}
function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}
function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
/** Google News appends " - Source Name" to titles; drop it for a clean headline. */
function stripSourceSuffix(title: string, source: string): string {
  if (source && title.endsWith(` - ${source}`)) {
    return title.slice(0, -(source.length + 3)).trim();
  }
  return title.replace(/\s+-\s+[^-]+$/, "").trim() || title;
}
/** Pull the first {...} JSON object out of a model response. */
function extractJson(s: string): Record<string, unknown> | null {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
