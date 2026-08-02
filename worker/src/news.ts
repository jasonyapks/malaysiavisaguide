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

/**
 * Where in the world an item is about.
 *
 * A second axis under `sector`, and an ingest-side one only: every non-Malaysian
 * item is still `category: "world"` to a reader, so nothing here reaches the
 * public API or the "Other countries" label. It exists to stop one busy region
 * taking the whole world budget — Europe's golden-visa churn alone would, most
 * weeks — and to make "which regions did this sweep actually cover" a fact in
 * the log rather than a guess.
 */
type Region =
  | "malaysia"
  | "thailand"
  | "europe"
  | "uk"
  | "north-america"
  | "south-america"
  | "anz"
  | "gulf"
  | "asia";

/**
 * The coverage map. Two halves, and they are there for different reasons.
 *
 * DESTINATIONS the reader is choosing between — Malaysia, Thailand, Schengen
 * Europe, the Americas, Australia and New Zealand. SOURCE MARKETS the reader is
 * leaving — the UK, the Gulf, Hong Kong, India, Singapore, Japan/Korea/Taiwan —
 * because a route closing where somebody lives now is what starts the search.
 *
 * Subject matter is long-stay, residency and investor routes ONLY: golden visas,
 * retirement and rentista visas, nomad passes, investor residency, citizenship by
 * investment. Not work permits, student visas, asylum, or border enforcement.
 *
 * Queries lead with a policy verb or a programme's actual name rather than
 * "<country> visa", which is the phrasing that returns relocation-agency
 * listicles by the dozen. Each maps to the programme it most likely concerns;
 * the AI can override the category, never the sector or the region.
 */
const FEEDS: { query: string; category: string; sector: Sector; region: Region }[] = [
  // --- Malaysia: the site's own subject -------------------------------------
  { query: "Malaysia MM2H visa", category: "mm2h", sector: "malaysia", region: "malaysia" },
  { query: "MM2H tier threshold change ministry tourism", category: "mm2h", sector: "malaysia", region: "malaysia" },
  { query: "Malaysia Premium Visa Programme PVIP", category: "pvip", sector: "malaysia", region: "malaysia" },
  { query: "Sarawak MM2H visa", category: "sarawak-mm2h", sector: "malaysia", region: "malaysia" },
  { query: "Malaysia DE Rantau nomad pass", category: "de-rantau", sector: "malaysia", region: "malaysia" },
  { query: "Malaysia expatriate employment pass immigration", category: "general", sector: "malaysia", region: "malaysia" },
  { query: "Malaysia immigration department announcement foreigners", category: "general", sector: "malaysia", region: "malaysia" },

  // --- Thailand: the closest substitute, and the one readers name unprompted -
  { query: "Thailand long term resident visa LTR change", category: "world", sector: "world", region: "thailand" },
  { query: "Thailand elite privilege visa rules change", category: "world", sector: "world", region: "thailand" },

  // --- Schengen Europe: the noisiest region on the map ----------------------
  { query: "Portugal golden visa D7 residency change", category: "world", sector: "world", region: "europe" },
  { query: "Spain Italy Greece golden visa programme change", category: "world", sector: "world", region: "europe" },
  { query: "Malta Cyprus residence by investment change", category: "world", sector: "world", region: "europe" },
  { query: "Europe digital nomad visa launch requirements", category: "world", sector: "world", region: "europe" },

  // --- The UK, on its own: not Schengen, and its rules move independently ----
  { query: "UK investor visa settlement rules change", category: "world", sector: "world", region: "uk" },

  { query: "US EB-5 investor visa residency rule change", category: "world", sector: "world", region: "north-america" },
  { query: "Canada start-up investor visa immigration change", category: "world", sector: "world", region: "north-america" },

  { query: "Brazil Argentina Uruguay retirement rentista visa", category: "world", sector: "world", region: "south-america" },
  { query: "Panama Paraguay Ecuador residency visa investors", category: "world", sector: "world", region: "south-america" },

  { query: "Australia significant investor visa change", category: "world", sector: "world", region: "anz" },
  { query: "New Zealand active investor plus visa change", category: "world", sector: "world", region: "anz" },

  { query: "UAE golden visa residency rule change", category: "world", sector: "world", region: "gulf" },

  { query: "Hong Kong capital investment entrant scheme", category: "world", sector: "world", region: "asia" },
  { query: "India investor emigration residency programme", category: "world", sector: "world", region: "asia" },
  { query: "Singapore global investor programme employment pass", category: "world", sector: "world", region: "asia" },
  { query: "Japan Korea Taiwan digital nomad investor visa", category: "world", sector: "world", region: "asia" },
];

export const VALID_CATEGORIES = new Set([
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
const PER_RUN_LIMIT: Record<Sector, number> = { malaysia: 20, world: 12 };

/**
 * And a second cap, per region, inside the world budget.
 *
 * Nine regions competing for 12 slots on a first-come basis is not coverage —
 * Europe files more golden-visa copy in a week than South America does in a
 * quarter, so the un-capped queue is a European one with a rounding error
 * attached. Two apiece means every region has to be crowded out by itself.
 * Malaysia is exempt: it is the site's subject, not one region among nine.
 */
const PER_REGION_LIMIT = 2;

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
  region: Region;
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

/**
 * Headline shapes that are never a policy change.
 *
 * The world brief already tells the model to reject these, and the model lets
 * about half of them through anyway — it is being asked for an editorial
 * judgement a 3B parameter model cannot hold. A regex holds it perfectly, for
 * free, before any AI call: nothing titled "Top 10 places to retire in 2026" has
 * ever been a fee change, in any country, in any year.
 *
 * Deliberately matched on shape rather than on topic words. "Guide" and "best"
 * appear in perfectly good headlines; "The 12 best…" and "…: everything you need
 * to know" do not.
 */
const JUNK_TITLE = [
  /^(the\s+)?(top|best|worst)\s+\d+\b/i,
  /\b\d+\s+(best|cheapest|safest|top)\s+(countries|places|cities|destinations)\b/i,
  /\bbest\s+(places|countries|cities)\s+to\s+(retire|live|move|relocate)\b/i,
  /\b(ranked|ranking|rankings)\b/i,
  /\beverything\s+you\s+need\s+to\s+know\b/i,
  /\b(ultimate|complete|comprehensive)\s+guide\b/i,
  /\bvisa\s+guide\s+\d{4}\b/i,
  /\bhow\s+to\s+(get|apply\s+for)\b/i,
];

function isJunkTitle(title: string): boolean {
  return JUNK_TITLE.some((re) => re.test(title));
}

/** Fetch every feed, summarise new items, insert as pending. Returns count added. */
export async function runNewsSweep(env: Env): Promise<number> {
  const seen = new Set<string>();
  const candidates: RawItem[] = [];
  let stale = 0;
  let undated = 0;
  let junk = 0;

  for (const feed of FEEDS) {
    try {
      const items = await fetchFeed(feed.query, feed.category, feed.sector, feed.region);
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
        // Shape gate, also before any AI spend. Malaysia items are exempt: the
        // listicle problem is a world-search problem, and a Malaysian headline
        // matching one of these is likelier to be a story we want.
        if (it.sector === "world" && isJunkTitle(it.title)) {
          junk++;
          continue;
        }
        candidates.push(it);
      }
    } catch (err) {
      console.log(`[news] feed failed: ${feed.query} — ${String(err)}`);
    }
  }

  // Skip anything already stored (by source_url), and spend each sector's
  // budget separately so the world feed always gets a look in. Within the world
  // budget, spend each region's separately too — see PER_REGION_LIMIT.
  const used: Record<Sector, number> = { malaysia: 0, world: 0 };
  const byRegion: Partial<Record<Region, number>> = {};
  const fresh: RawItem[] = [];
  for (const c of candidates) {
    if (used[c.sector] >= PER_RUN_LIMIT[c.sector]) continue;
    if (c.sector === "world" && (byRegion[c.region] ?? 0) >= PER_REGION_LIMIT) continue;
    const existing = await env.DB.prepare(
      "SELECT 1 FROM news_items WHERE source_url = ?",
    )
      .bind(c.link)
      .first();
    if (existing) continue;
    fresh.push(c);
    used[c.sector]++;
    byRegion[c.region] = (byRegion[c.region] ?? 0) + 1;
  }
  const regionTally = Object.entries(byRegion)
    .filter(([r]) => r !== "malaysia")
    .map(([r, n]) => `${r} ${n}`)
    .join(", ");
  console.log(
    `[news] ${candidates.length} published in ${new Date().getUTCFullYear()}, ` +
      `${stale} older, ${undated} undated, ${junk} junk-shaped; ` +
      `taking ${used.malaysia} malaysia + ${used.world} world (${regionTally || "none"})`,
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
    items = await fetchFeed(headline, "general", "malaysia", "malaysia");
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
    // Manual paste is deliberate, so it bypasses the age gate, the shape gate
    // and both budgets — this path never runs through the sweep.
    sector: "malaysia",
    region: "malaysia",
  };
  const enriched = await summarise(env, item);
  if (!enriched) return false;
  await insertPending(env, item, enriched);
  return true;
}

/** Below this the paste is a headline and a sentence, not a story to write from. */
const MIN_PASTED_CHARS = 400;

/**
 * Manual intake — Jason has pasted the story's text in himself.
 *
 * This exists because submitUrl above cannot always do its job: The Star 403s
 * Worker egress, some pages are paywalled, some are JavaScript shells. Those
 * stories are often the most worth having. Pasting the text is the escape hatch,
 * and it is a better one than it sounds — a human has read the source, which is
 * a stronger guarantee than any extractor gives.
 *
 * It only inserts. The article is written by the ordinary approve path, so there
 * is exactly one route from a row to a page and no manual-only publish logic to
 * drift out of step.
 */
export async function submitManual(
  env: Env,
  input: {
    url?: string;
    sourceName?: string;
    title?: string;
    category?: string;
    text?: string;
    publishedAt?: string;
  },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const text = (input.text ?? "").trim();
  const title = (input.title ?? "").trim();
  if (!title) return { ok: false, error: "Give the story a headline." };
  if (text.length < MIN_PASTED_CHARS) {
    return {
      ok: false,
      error: `That is ${text.length} characters. Paste at least ${MIN_PASTED_CHARS} — below that there is not enough story to write from.`,
    };
  }

  let url: URL;
  try {
    url = new URL((input.url ?? "").trim());
  } catch {
    return { ok: false, error: "A valid source URL is required — the page has to cite it." };
  }

  const category =
    input.category && VALID_CATEGORIES.has(input.category) ? input.category : "general";

  const existing = await env.DB.prepare(
    "SELECT id, status, slug FROM news_items WHERE source_url = ?",
  )
    .bind(url.href)
    .first<{ id: string; status: string; slug: string | null }>();

  if (existing) {
    // The common case, and the one worth handling properly: the sweep already
    // filed this story but could not read the page, so it is sitting in the
    // queue with no article. That is precisely when Jason pastes the text — so
    // attach it to the row he already has instead of making him delete it and
    // key everything in again. The caller then approves that id as usual.
    if (!existing.slug) {
      await env.DB.prepare(
        `UPDATE news_items
            SET source_text = ?, origin = 'manual',
                title = COALESCE(NULLIF(?, ''), title),
                updated_at = datetime('now')
          WHERE id = ?`,
      )
        .bind(text.slice(0, 12000), title.slice(0, 300), existing.id)
        .run();
      return { ok: true, id: existing.id };
    }
    return {
      ok: false,
      error:
        `Already have that URL and it is already written — /news/${existing.slug}/. ` +
        "Use Rewrite on it in the Approved tab, or delete it there first if you want to start over.",
    };
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO news_items
       (id, title, summary, category, source_name, source_url, published_at,
        status, origin, source_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'manual', ?)`,
  )
    .bind(
      id,
      title.slice(0, 300),
      firstSentences(text),
      category,
      (input.sourceName?.trim() || url.hostname.replace(/^www\./, "")).slice(0, 120),
      url.href,
      // The publisher's date if Jason gave one. Falling back to now is right:
      // he is pasting it because he just read it.
      input.publishedAt?.trim() || new Date().toISOString(),
      // Capped at the same 12k the extractor hands the model. Anything past that
      // would be truncated in the prompt anyway.
      text.slice(0, 12000),
    )
    .run();

  return { ok: true, id };
}

/** A holding blurb for the queue card. The written dek replaces it on approval. */
function firstSentences(text: string): string {
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g);
  const blurb = sentences ? sentences.slice(0, 2).join(" ").trim() : text.slice(0, 300);
  return blurb.slice(0, 800);
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchFeed(
  query: string,
  fallbackCategory: string,
  sector: Sector,
  region: Region,
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
  return parseRss(xml, fallbackCategory, sector, region);
}

/** Minimal RSS parser for Bing News output (item-per-<item>). */
function parseRss(
  xml: string,
  fallbackCategory: string,
  sector: Sector,
  region: Region,
): RawItem[] {
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
      region,
    });
  }
  return out;
}

interface Enriched {
  summary: string;
  category: string;
}

/**
 * The three shapes Workers AI answers in, depending on the model.
 *
 * `output` is the Responses API, which is what the gpt-oss line returns through
 * the binding; `response` is Workers AI's own older shape; `choices` is Chat
 * Completions. A model swap can change which one arrives, so read all three —
 * both the summary path and the article path go through here.
 */
export type AiResponse = {
  output?: { type?: string; content?: { type?: string; text?: string }[] }[];
  response?: unknown;
  choices?: { message?: { content?: string } }[];
};

/**
 * Pull the assistant's text out, whichever shape it came in.
 *
 * Every candidate is checked for actual content, not merely for existing: a
 * reasoning model returns an EMPTY `response` alongside a populated `output`,
 * so taking the first field that is present silently yields "".
 */
export function extractText(r: AiResponse): string {
  // Responses API — drop the reasoning items, keep the message text.
  const fromOutput = (r?.output ?? [])
    .filter((o) => o.type !== "reasoning")
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type !== "reasoning_text")
    .map((c) => c.text ?? "")
    .join("");
  if (fromOutput.trim()) return fromOutput;

  if (typeof r?.response === "string" && r.response.trim()) return r.response;

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
weighing Malaysia against other long-stay options, or leaving a country whose own
rules have just moved. Either way they want real programme news about long-stay,
residency and investor routes — golden visas, retirement and rentista visas,
digital nomad passes, investor residency, citizenship by investment: a launch,
closure, suspension, fee or threshold change, eligibility or quota shift, or a
firm government announcement.

Set relevant=false for: "best places to retire" roundups, listicles, rankings,
relocation-agency or law-firm marketing, opinion pieces, and anything with no
identifiable policy change. Being merely interesting is not enough. Work permits,
student visas, asylum, tourist entry and border enforcement are out of scope even
when a government announces them.

WORKED EXAMPLES.

  "Portugal raises golden visa investment floor to EUR 500,000 from January"
  -> relevant=true, change="minimum investment raised to EUR 500,000 from January"
  A named programme, a named number, a named date.

  "The 10 best countries for retirees in 2026, according to a new index"
  -> relevant=false, change=""
  A ranking. No government has done anything. This is the single most common
  thing in these search results and it is never news.

  "Why Thailand is losing digital nomads to its neighbours"
  -> relevant=false, change=""
  Opinion. Interesting, and still not a policy change.

- Name the country in the first sentence of the summary.
- change: the specific policy movement, in a few words, quoting the number or
  date where there is one. If you cannot name one, the item is not relevant.
- category: always "world".`,
};

/**
 * Vague enough to be a non-answer. The model reaches for these when it has
 * decided an item is relevant and cannot say what actually changed, which is the
 * exact failure the `change` field exists to catch.
 */
const EMPTY_CHANGE = /^(n\/?a|none|unknown|unclear|not specified|various|general|no change)\b/i;

/** Ask Workers AI for a neutral 2-sentence summary + a category. */
async function summarise(env: Env, item: RawItem): Promise<Enriched | null> {
  const prompt = `You are the editor of an independent Malaysia long-stay visa guide.
Given a news headline and snippet, ${SECTOR_BRIEF[item.sector]}

Respond with ONLY a JSON object, no prose:
{"relevant": boolean, "summary": string, "category": string, "change": string}

- summary: your own neutral 2-sentence summary. Do NOT copy the snippet verbatim.
- change: the specific policy movement this reports, in a few words. Empty if none.
- If not relevant, set relevant=false and leave the other fields empty.

HEADLINE: ${item.title}
SNIPPET: ${item.description.slice(0, 600)}
SOURCE: ${item.sourceName}`;

  // World items get the larger model. It is the harder judgement — "is this a
  // policy change or an SEO listicle" rather than "is this about Malaysia" — and
  // it runs at most PER_RUN_LIMIT.world times a day, so the per-call cost that
  // rules a bigger model out of the Malaysia sweep is affordable here.
  const model = item.sector === "world" ? env.TRIAGE_MODEL_WORLD : env.SUMMARY_MODEL;

  try {
    const resp = (await env.AI.run(model as keyof AiModels, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    } as never)) as AiResponse;

    const raw = extractText(resp);
    const parsed = extractJson(raw);
    if (!parsed || parsed.relevant !== true) return null;

    const summary = String(parsed.summary ?? "").trim();
    if (summary.length < 20) return null;

    // The guard the `change` field is for. A world item that cannot be described
    // as a specific policy movement is rejected in code, whatever the model
    // claimed one line earlier — asking for the field and then not checking it
    // would leave the judgement exactly where it already fails.
    if (item.sector === "world") {
      const change = String(parsed.change ?? "").trim();
      if (change.length < 8 || EMPTY_CHANGE.test(change)) {
        console.log(`[news] world item names no policy change — "${item.title}"`);
        return null;
      }
    }

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
