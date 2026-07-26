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

/**
 * Two sectors. `malaysia` is the site's own subject; `world` is other countries'
 * long-stay visa news, which readers weigh Malaysia against. They are summarised
 * under different editorial briefs and hold separate per-run budgets, so a busy
 * week in one cannot crowd the other out of the queue.
 */
type Sector = "malaysia" | "world";

// Each query maps to the programme it most likely concerns; the AI can override.
const FEEDS: { query: string; category: string; sector: Sector }[] = [
  { query: "Malaysia MM2H visa", category: "mm2h", sector: "malaysia" },
  { query: "Malaysia Premium Visa Programme PVIP", category: "pvip", sector: "malaysia" },
  { query: "Sarawak MM2H visa", category: "sarawak-mm2h", sector: "malaysia" },
  { query: "Malaysia DE Rantau nomad pass", category: "de-rantau", sector: "malaysia" },
  {
    query: "Malaysia expatriate employment pass immigration",
    category: "general",
    sector: "malaysia",
  },

  // Other countries. Chosen as the programmes this audience actually compares
  // Malaysia against — regional long-stay routes first, then the investor and
  // retirement visas an HNW reader shortlists alongside PVIP and MM2H.
  { query: "Thailand long term resident visa policy", category: "world", sector: "world" },
  { query: "Indonesia KITAS visa foreigners rules", category: "world", sector: "world" },
  { query: "Philippines SRRV retirement visa change", category: "world", sector: "world" },
  { query: "Vietnam Cambodia long stay visa rules foreigners", category: "world", sector: "world" },
  { query: "Singapore employment pass ONE pass criteria", category: "world", sector: "world" },
  { query: "UAE golden visa residency rule change", category: "world", sector: "world" },
  { query: "Portugal Spain Greece golden visa programme change", category: "world", sector: "world" },
  { query: "Japan Korea Taiwan digital nomad visa", category: "world", sector: "world" },
  { query: "digital nomad visa launched country requirements", category: "world", sector: "world" },
];

const VALID_CATEGORIES = new Set([
  "pvip",
  "mm2h",
  "sarawak-mm2h",
  "de-rantau",
  "employment-pass",
  "student-pass",
  "general",
  "world",
]);

// Cap AI calls + inserts per sweep, per sector. Malaysia keeps the larger share:
// it is the site's subject, and world items are context, not the main event.
const PER_RUN_LIMIT: Record<Sector, number> = { malaysia: 20, world: 8 };

/**
 * Nothing published before the current calendar year enters the queue, in
 * either sector.
 *
 * A January 2022 article once reached approval looking identical to current
 * news, and its figures contradicted the site's own PVIP guide — the queue
 * shows no publication date, so age is invisible at review time. Filtering at
 * ingest is the only reliable place to catch it.
 *
 * The year, rather than a tighter rolling window, because visa news ages by
 * policy rather than by clock: a fee or salary threshold announced in January
 * is still that programme's live state in July. Measured against the live
 * feeds on 2026-07-26, the year rule admits 4 more Malaysia items and 8 more
 * world items than a 92-day window, while still excluding 26 pre-2026 Malaysia
 * items — including the 2022 articles that caused the original problem.
 */

interface RawItem {
  title: string;
  link: string;
  sourceName: string;
  pubDate: string | null;
  description: string;
  fallbackCategory: string;
  sector: Sector;
}

/**
 * True only for a parseable date inside the window. An item with no usable date
 * is treated as failing: unknown age is exactly the case that caused the
 * problem, and Bing supplies a pubDate on effectively every item, so dropping
 * the undated ones costs almost nothing. Counted separately in the log so a
 * feed that silently stops sending dates is visible rather than just quiet.
 */
function isRecent(pubDate: string | null): boolean {
  if (!pubDate) return false;
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return false;
  if (t > Date.now()) return false; // a future date is a bad date, not fresh news
  return new Date(t).getUTCFullYear() === new Date().getUTCFullYear();
}

/** Fetch every feed, summarise new items, insert as pending. Returns count added. */
export async function runNewsSweep(env: Env): Promise<number> {
  const seen = new Set<string>();
  const candidates: RawItem[] = [];
  let stale = 0;
  let undated = 0;

  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed.query, feed.category, feed.sector);
      for (const it of items) {
        if (seen.has(it.link)) continue;
        seen.add(it.link);
        // Age gate, before any AI spend — a stale item costs nothing to drop
        // here and costs a wrong published figure if it reaches approval.
        if (!it.pubDate) {
          undated++;
          continue;
        }
        if (!isRecent(it.pubDate)) {
          stale++;
          continue;
        }
        candidates.push(it);
      }
    } catch (err) {
      console.log(`[news] feed failed: ${feed.query} — ${String(err)}`);
    }
  }

  // Skip anything already stored (by source_url), and spend each sector's
  // budget separately so the world feed always gets a look in.
  const used: Record<Sector, number> = { malaysia: 0, world: 0 };
  const fresh: RawItem[] = [];
  for (const c of candidates) {
    if (used[c.sector] >= PER_RUN_LIMIT[c.sector]) continue;
    const existing = await env.DB.prepare(
      "SELECT 1 FROM news_items WHERE source_url = ?",
    )
      .bind(c.link)
      .first();
    if (existing) continue;
    fresh.push(c);
    used[c.sector]++;
  }
  console.log(
    `[news] ${candidates.length} published in ${new Date().getUTCFullYear()}, ` +
      `${stale} older, ${undated} undated; ` +
      `taking ${used.malaysia} malaysia + ${used.world} world`,
  );

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

/**
 * Hosts that can never be read, whatever we do. MSN and Yahoo syndicate other
 * outlets' stories into a client-rendered shell — the fetched HTML carries
 * about three characters of body text, so extraction cannot work and never
 * will. They are excluded from *alternates* only, never from ingest: an MSN
 * item is a perfectly good pointer to a story some readable outlet also ran,
 * and findAlternateSources is what turns it into one.
 */
const UNREADABLE_HOSTS = ["msn.com", "news.yahoo.com", "flipboard.com"];

function isUnreadableHost(url: string): boolean {
  const h = hostOf(url);
  return UNREADABLE_HOSTS.some((bad) => h === bad || h.endsWith(`.${bad}`));
}

/** Words too common to prove two headlines describe the same story. */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "as", "at", "by", "from", "is", "are", "was", "were", "be", "been", "it",
  "its", "this", "that", "these", "those", "will", "new", "says", "said",
  "after", "over", "more", "amid", "how", "what", "why",
]);

function keyWords(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  );
}

/**
 * How much two headlines overlap, as a fraction of the shorter one's
 * significant words. Measured against the shorter side deliberately: outlets
 * pad headlines with their own framing, and a story is still the same story
 * when one paper adds four words of editorialising.
 */
function headlineOverlap(a: string, b: string): number {
  const x = keyWords(a);
  const y = keyWords(b);
  if (x.size === 0 || y.size === 0) return 0;
  let hits = 0;
  for (const w of x) if (y.has(w)) hits++;
  return hits / Math.min(x.size, y.size);
}

/**
 * The same story, somewhere readable.
 *
 * When a source is paywalled, bot-blocked or client-rendered, the story itself
 * is usually not exclusive — wire copy and government announcements get run by
 * several outlets. This searches the headline and returns other outlets
 * carrying what looks like the same story, best match first.
 *
 * The overlap threshold is the whole safety mechanism. Writing an article about
 * a *different* story than the one approved would be worse than publishing
 * nothing, so this is deliberately strict and returns few or no candidates
 * rather than a loose match.
 */
export async function findAlternateSources(
  headline: string,
  originalUrl: string,
): Promise<{ url: string; sourceName: string }[]> {
  const originalHost = hostOf(originalUrl);
  let items: RawItem[];
  try {
    items = await fetchFeed(headline, "general", "malaysia");
  } catch (err) {
    console.log(`[alt] search failed for "${headline}" — ${String(err)}`);
    return [];
  }

  const scored = items
    .filter((i) => hostOf(i.link) !== originalHost)
    .filter((i) => !isUnreadableHost(i.link))
    .map((i) => ({ item: i, score: headlineOverlap(headline, i.title) }))
    .filter((s) => s.score >= MIN_HEADLINE_OVERLAP)
    .sort((a, b) => b.score - a.score);

  // Dedupe by host — three URLs from one paper is one chance, not three.
  const seenHosts = new Set<string>();
  const out: { url: string; sourceName: string }[] = [];
  for (const { item } of scored) {
    const h = hostOf(item.link);
    if (seenHosts.has(h)) continue;
    seenHosts.add(h);
    out.push({ url: item.link, sourceName: item.sourceName });
    if (out.length >= MAX_ALTERNATES) break;
  }
  return out;
}

/** Fraction of significant words two headlines must share to count as one story. */
const MIN_HEADLINE_OVERLAP = 0.55;

/** How many alternates to try. Each one is a fetch; the tail rarely pays. */
const MAX_ALTERNATES = 3;

/** Fetch and summarise a single pasted URL (dashboard manual submit). */
export async function submitUrl(env: Env, url: string): Promise<boolean> {
  const existing = await env.DB.prepare(
    "SELECT 1 FROM news_items WHERE source_url = ?",
  )
    .bind(url)
    .first();
  if (existing) return false;

  const res = await fetch(url, { headers: { "user-agent": BROWSER_UA } });
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
    // Manual paste is deliberate, so it bypasses both the age gate and the
    // per-sector budget — this path never runs through the sweep.
    sector: "malaysia",
  };
  const enriched = await summarise(env, item);
  if (!enriched) return false;
  await insertPending(env, item, enriched);
  return true;
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchFeed(
  query: string,
  fallbackCategory: string,
  sector: Sector,
): Promise<RawItem[]> {
  // Bing News RSS — query-based and reachable from Cloudflare Workers (Google
  // News blocks Worker egress IPs). Each item carries a <News:Source> outlet
  // name and a redirect link wrapping the real article URL.
  //
  // Market matters: en-MY surfaces Malaysian outlets, which is right for the
  // malaysia sector and actively wrong for the world one, where it would bias
  // results back towards Malaysian coverage of other countries.
  const market = sector === "world" ? "en-US" : "en-MY";
  const url =
    "https://www.bing.com/news/search?q=" +
    encodeURIComponent(query) +
    `&format=rss&setmkt=${market}`;
  const res = await fetch(url, { headers: { "user-agent": BROWSER_UA } });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const xml = await res.text();
  return parseRss(xml, fallbackCategory, sector);
}

/** Minimal RSS parser for Bing News output (item-per-<item>). */
function parseRss(xml: string, fallbackCategory: string, sector: Sector): RawItem[] {
  const out: RawItem[] = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const block of items) {
    const title = decode(stripCdata(match(block, /<title>([\s\S]*?)<\/title>/)));
    const rawLink = decode(stripCdata(match(block, /<link>([\s\S]*?)<\/link>/))).trim();
    const link = realUrl(rawLink);
    const pubDate = match(block, /<pubDate>([\s\S]*?)<\/pubDate>/).trim();
    const description = stripTags(
      decode(stripCdata(match(block, /<description>([\s\S]*?)<\/description>/))),
    );
    // Bing News: <News:Source>The Star</News:Source>
    const sourceName =
      decode(stripCdata(match(block, /<News:Source>([\s\S]*?)<\/News:Source>/))).trim() ||
      hostOf(link);
    if (!title || !link) continue;
    out.push({
      title: stripSourceSuffix(title, sourceName),
      link,
      sourceName,
      pubDate: pubDate ? new Date(pubDate).toISOString() : null,
      description,
      fallbackCategory,
      sector,
    });
  }
  return out;
}

interface Enriched {
  summary: string;
  category: string;
}

/** Workers AI responses vary by model — chat models return `response`, some
 *  return an OpenAI-style `choices[]`. Read whichever is present. */
type AiResponse = {
  response?: unknown;
  choices?: { message?: { content?: string } }[];
};
function extractText(r: AiResponse): string {
  if (typeof r?.response === "string") return r.response;
  const c = r?.choices?.[0]?.message?.content;
  return typeof c === "string" ? c : "";
}

/**
 * The two sectors need different relevance tests. The Malaysia brief asks
 * "is this about our programmes"; the world brief has to be much stricter,
 * because international visa search results are dominated by "best places to
 * retire" listicles and relocation-agency marketing. Only an actual policy
 * change is worth a reader's time here.
 */
const SECTOR_BRIEF: Record<Sector, string> = {
  malaysia: `Decide if it is genuinely relevant to Malaysia's long-stay visa or
immigration programmes (PVIP, MM2H, Sarawak MM2H, DE Rantau, Employment Pass,
Student Pass, or Malaysian immigration policy for foreigners).

- category: one of pvip, mm2h, sarawak-mm2h, de-rantau, employment-pass, student-pass, general.`,

  world: `This item is about a country OTHER than Malaysia. Your readers are
weighing Malaysia against other long-stay options, so they want real programme
news: a launch, closure, suspension, fee or threshold change, eligibility or
quota shift, or a firm government announcement.

Set relevant=false for: "best places to retire" roundups, listicles, rankings,
relocation-agency or law-firm marketing, opinion pieces, and anything with no
identifiable policy change. Being merely interesting is not enough.

- Name the country in the first sentence of the summary.
- category: always "world".`,
};

/** Ask Workers AI for a neutral 2-sentence summary + a category. */
async function summarise(env: Env, item: RawItem): Promise<Enriched | null> {
  const prompt = `You are the editor of an independent Malaysia long-stay visa guide.
Given a news headline and snippet, ${SECTOR_BRIEF[item.sector]}

Respond with ONLY a JSON object, no prose:
{"relevant": boolean, "summary": string, "category": string}

- summary: your own neutral 2-sentence summary. Do NOT copy the snippet verbatim.
- If not relevant, set relevant=false and leave summary/category empty.

HEADLINE: ${item.title}
SNIPPET: ${item.description.slice(0, 600)}
SOURCE: ${item.sourceName}`;

  try {
    const resp = (await env.AI.run(env.SUMMARY_MODEL as keyof AiModels, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    } as never)) as AiResponse;

    const raw = extractText(resp);
    const parsed = extractJson(raw);
    if (!parsed || parsed.relevant !== true) return null;

    const summary = String(parsed.summary ?? "").trim();
    if (summary.length < 20) return null;

    let category = String(parsed.category ?? "").trim();
    if (!VALID_CATEGORIES.has(category)) category = item.fallbackCategory;
    // A world item is never a Malaysia programme, whatever the model returns —
    // misfiling one under `mm2h` would link it to the wrong guide.
    if (item.sector === "world") category = "world";

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
/** Bing wraps links as .../apiclick.aspx?...&url=<real>. Unwrap to the source. */
function realUrl(bingLink: string): string {
  try {
    const real = new URL(bingLink).searchParams.get("url");
    return real ?? bingLink;
  } catch {
    return bingLink;
  }
}
function hostOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "News source";
  }
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
