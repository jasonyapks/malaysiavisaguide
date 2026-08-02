/**
 * The official-source watcher.
 *
 * The news sweep waits for a journalist. This does not: it reads the government
 * pages the site's own figures cite, hashes what it read, and raises an event
 * when one of them moves. PVIP's 2026 terms were live for four months before the
 * site caught up, and no newspaper ever covered the change — the FAQ PDF was the
 * only thing that moved. This is the thing that would have noticed.
 *
 * What it is NOT is a news source. A changed fee table usually means
 * programmes.ts needs an edit, not that an article needs writing. The default
 * outcome is an alert Jason acknowledges; promoting one into the news queue is a
 * deliberate second action. See dashboard.ts.
 */

import type { Env } from "./types";
import { readPage } from "./extract";
import { extractText, type AiResponse } from "./news";

/** One watched page, as the dashboard sees it. */
export interface WatchRow {
  id: string;
  url: string;
  label: string;
  programme: string | null;
  mode: "html" | "binary";
  content_hash: string | null;
  /** JSON array of every fingerprint this URL has served. See migration 008. */
  seen_hashes: string;
  last_checked_at: string | null;
  last_changed_at: string | null;
  status: "ok" | "unreachable";
  consecutive_failures: number;
}

export interface WatchEvent {
  id: string;
  watch_id: string;
  detected_at: string;
  summary: string;
  diff: string;
  acknowledged_at: string | null;
  promoted_item_id: string | null;
}

/**
 * The seed, used only when figures.json cannot be read.
 *
 * The real list comes from the site's own `sources` — see loadWatchList — and
 * this exists so that a failed site build, a bad SITE_ORIGIN or a first run
 * before the emitter ships does not leave the watcher watching nothing at all.
 * Silence is the one failure mode a watcher must not have.
 */
const SEED: { url: string; label: string; programme: string | null }[] = [
  {
    url: "https://imigresen-online.imi.gov.my/eservices/doc/FAQ_PVIP.pdf",
    label: "PVIP — Immigration FAQ (PDF)",
    programme: "pvip",
  },
  {
    url: "https://www.motac.gov.my/wp-content/uploads/2025/12/Guide-Malaysia-My-Second-Home.pdf",
    label: "MM2H — MOTAC programme guide (PDF)",
    programme: "mm2h",
  },
];

/** Browser reads allowed per run. Shared 10-minute daily allowance; see extract.ts. */
const BROWSER_BUDGET = 3;

/** Below this many changed characters, a difference is formatting, not news. */
const MIN_CHANGE_CHARS = 40;

/** Snapshot and diff are model input, and both are capped before storage. */
const MAX_SNAPSHOT = 40000;
const MAX_DIFF = 8000;

/** Three failed runs in a row is a broken watcher, and the dashboard says so. */
const FAILURES_BEFORE_RED = 3;

/**
 * Refresh the watch list from the site's figures.json, then check every row.
 * Returns the number of change events raised. Called by the cron after the news
 * sweep, and by POST /api/admin/watch/run.
 */
export async function runWatch(env: Env): Promise<number> {
  await loadWatchList(env);

  const rows = await listWatchRows(env);
  let browserLeft = BROWSER_BUDGET;
  let changed = 0;
  let failed = 0;

  for (const row of rows) {
    const allowBrowser = row.mode === "html" && browserLeft > 0;
    const read = await readSource(env, row, allowBrowser);

    if (read === null) {
      // A page that briefly 500s is not a page that has stopped existing, so
      // failures accumulate on the row rather than raising an alert on the first
      // one. The snapshot and hash are left exactly as they were: the next good
      // read must still be compared against the last good read, not against
      // nothing.
      failed++;
      await env.DB.prepare(
        `UPDATE source_watch
            SET last_checked_at = datetime('now'),
                consecutive_failures = consecutive_failures + 1,
                status = CASE WHEN consecutive_failures + 1 >= ?
                              THEN 'unreachable' ELSE status END
          WHERE id = ?`,
      )
        .bind(FAILURES_BEFORE_RED, row.id)
        .run();
      continue;
    }

    if (read.usedBrowser) browserLeft--;

    // First successful read of a page is a baseline, never a change. Otherwise
    // adding a URL would alert on it immediately, and an alert that always fires
    // on arrival is an alert nobody reads.
    if (row.content_hash === null) {
      await baseline(env, row.id, read.hash, read.text, false, row.seen_hashes);
      console.log(`[watch] ${row.label} — baseline recorded`);
      continue;
    }

    // Seen before, just not last time. That is a server alternating between
    // editions it already showed us, not news — see schema-008-watch-seen.sql.
    // The row's current hash follows what was actually read, so the diff on the
    // next genuine change is against the copy we last looked at.
    if (read.hash !== row.content_hash && seenBefore(row.seen_hashes, read.hash)) {
      await baseline(env, row.id, read.hash, read.text, false, row.seen_hashes);
      console.log(`[watch] ${row.label} — a previously seen edition, not a change`);
      continue;
    }

    if (read.hash === row.content_hash) {
      await env.DB.prepare(
        `UPDATE source_watch
            SET last_checked_at = datetime('now'),
                consecutive_failures = 0, status = 'ok'
          WHERE id = ?`,
      )
        .bind(row.id)
        .run();
      continue;
    }

    // The hash moved. For prose, check the move is big enough to be worth an
    // alert before spending a model call on describing it — a page that renders
    // one word of boilerplate differently is not a policy change.
    // Follows whether there IS text, not whether the row is html: a PDF that
    // converted cleanly diffs exactly like a page, which is the whole reason for
    // running the conversion.
    const previous = await snapshotOf(env, row.id);
    const diff = read.text ? diffProse(previous ?? "", read.text) : "";

    if (read.text && diff.length > 0 && changedChars(diff) < MIN_CHANGE_CHARS) {
      await baseline(env, row.id, read.hash, read.text, false, row.seen_hashes);
      console.log(`[watch] ${row.label} — hash moved, ${changedChars(diff)} chars, ignored`);
      continue;
    }

    const summary = read.text
      ? await describeChange(env, row.label, diff)
      : "The document was replaced. Its text could not be read here — either it is too " +
        "large to convert or the conversion came back empty — so open it and compare " +
        "against the figures in programmes.ts.";

    await env.DB.prepare(
      `INSERT INTO source_watch_events (id, watch_id, summary, diff)
       VALUES (?, ?, ?, ?)`,
    )
      .bind(crypto.randomUUID(), row.id, summary.slice(0, 2000), diff.slice(0, MAX_DIFF))
      .run();

    // The new content becomes the baseline immediately. The event holds the
    // diff, so nothing is lost — and not re-baselining would mean re-raising the
    // same change every single day until it was acknowledged.
    await baseline(env, row.id, read.hash, read.text, true, row.seen_hashes);
    changed++;
    console.log(`[watch] ${row.label} — CHANGED`);
  }

  console.log(
    `[watch] ${rows.length} sources checked — ${changed} changed, ${failed} unreadable`,
  );
  return changed;
}

/** Read one source, in whichever mode its row says. */
async function readSource(
  env: Env,
  row: WatchRow,
  allowBrowser: boolean,
): Promise<{ hash: string; text: string; usedBrowser: boolean } | null> {
  if (row.mode === "binary") {
    const doc = await readDocument(env, row.url);
    if (!doc) return null;
    return { ...doc, usedBrowser: false };
  }

  const read = await readPage(row.url, env, { allowBrowser });
  if (!read) return null;
  const text = normalise(read.text).slice(0, MAX_SNAPSHOT);
  return {
    hash: await sha256Hex(new TextEncoder().encode(text)),
    text,
    // Approximate, and only used to spend the budget: a direct read that
    // succeeded never reaches the browser rung, so counting an allowed browser
    // read as spent is wrong only in the cheap direction.
    usedBrowser: allowBrowser,
  };
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36";

/**
 * Above this, a document is fingerprinted by its cache validators instead of
 * being downloaded. MOTAC's MM2H guide is 37 MB — pulling that into a Worker
 * daily would be 37 MB of egress and most of the 128 MB memory ceiling, to
 * compute a hash whose only job is to be compared for equality.
 */
const MAX_BINARY_BYTES = 8_000_000;

/**
 * Read a PDF the way the html rows read a page: as text.
 *
 * env.AI.toMarkdown converts the bytes to markdown, so a document watch produces
 * a real diff and a real "what changed" sentence rather than "something moved,
 * go and look". For the PVIP FAQ — a PDF, and the single document whose going
 * stale cost this site four months of wrong figures — that difference is the
 * whole point of the panel.
 *
 * Falls back to a fingerprint when the text cannot be had: MOTAC's guide is
 * 37 MB, far past what is sensible to pull into a Worker and convert, so it is
 * watched by its cache validators and reports only that it moved.
 */
async function readDocument(
  env: Env,
  url: string,
): Promise<{ hash: string; text: string } | null> {
  const doc = await hashDocument(url);
  if (!doc) return null;

  const { hash: fingerprint, bytes } = doc;
  // A validator fingerprint means the file was never downloaded, so there are no
  // bytes to convert. Nothing more to do.
  if (!bytes) return { hash: fingerprint, text: "" };

  try {
    const [converted] = await env.AI.toMarkdown([
      {
        // The mime type is not decoration: without it the conversion service
        // rejects the call outright ("Too small: expected string to have >=1
        // characters"), which reads like a problem with the file and is not.
        name: decodeURIComponent(url.split("/").pop() || "document.pdf"),
        blob: new Blob([bytes], { type: "application/pdf" }),
      },
    ], {
      conversionOptions: {
        // Metadata off. It carries PDFFormatVersion, the producing version of
        // Word and a creation timestamp, so a document re-exported with no
        // editorial change at all would diff — and on the first live run the
        // model summarising the change led with "new PDF format version (1.7),
        // creator software Microsoft Word 2019" instead of the eligibility rule
        // that actually moved.
        //
        // (`output: { format: "text" }` would also help and the runtime supports
        // it, but the installed @cloudflare/workers-types predates the option
        // and rejects it. Markdown syntax is stable between editions, so it
        // costs nothing to leave.)
        pdf: { metadata: false },
      },
    });
    // The union has an error variant with no `data`, so narrow rather than
    // reaching for the field — a failed conversion must fall back, not throw.
    const markdown = converted && "data" in converted ? converted.data : "";
    const text = normalise(markdown).slice(0, MAX_SNAPSHOT);
    // Hash the TEXT, not the bytes, once we have it: two renderings of the same
    // document differ byte for byte and say the same thing, and it is what they
    // say that this panel is about.
    if (text.length > 200) {
      return { hash: await sha256Hex(new TextEncoder().encode(text)), text };
    }
    console.log(`[watch] ${url} — conversion returned ${text.length} chars; using byte hash`);
  } catch (err) {
    console.log(`[watch] ${url} — toMarkdown failed: ${String(err)}`);
  }
  return { hash: fingerprint, text: "" };
}

/**
 * Fingerprint a document, and hand back the bytes if it downloaded any.
 *
 * The bytes are returned rather than re-fetched by the caller, because on a
 * server that alternates between two editions a second fetch is a different
 * document — we would hash one and show the other.
 *
 * Bytes where we can, validators where we must.
 *
 * BYTES ARE PREFERRED, and not out of purity: Sarawak's guide is served by a
 * file-manager script that stamps Last-Modified with the time of the request, so
 * a validator fingerprint for that URL would report a change every single day
 * and the panel would train Jason to ignore it inside a week. Hashing what came
 * back is immune to that.
 *
 * HEAD IS BEST-EFFORT, NOT A PRECONDITION. Immigration's server answers HEAD on
 * the PVIP FAQ with a 500 and an HTML error page, then serves the same URL
 * perfectly over GET. So a failed HEAD means "no size known", never "the
 * document is gone" — the only thing it decides is whether we already know the
 * file is too big to fetch.
 */
async function hashDocument(
  url: string,
): Promise<{ hash: string; bytes: Uint8Array | null } | null> {
  const head = await headSafely(url);

  if (head && head.length !== null && head.length > MAX_BINARY_BYTES) {
    const validators = [head.etag, head.lastModified].filter(Boolean).join("|");
    if (validators) {
      console.log(`[watch] ${url} — ${head.length} bytes, fingerprinted by validators`);
      return { hash: `v:${await sha256Hex(new TextEncoder().encode(validators))}`, bytes: null };
    }
    // Too big to hash and nothing to hash it by. Better to record a failure than
    // to pull 37 MB through a Worker every morning.
    console.log(`[watch] ${url} — ${head.length} bytes and no validators; skipped`);
    return null;
  }

  try {
    const res = await fetch(url, {
      headers: { "user-agent": BROWSER_UA },
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`[watch] ${url} — status ${res.status}`);
      return null;
    }
    const declared = Number(res.headers.get("content-length") ?? "0");
    if (declared > MAX_BINARY_BYTES) {
      // HEAD did not warn us. Drop the body unread rather than buffering it.
      await res.body?.cancel();
      const validators = [res.headers.get("etag"), res.headers.get("last-modified")]
        .filter(Boolean)
        .join("|");
      if (!validators) return null;
      return { hash: `v:${await sha256Hex(new TextEncoder().encode(validators))}`, bytes: null };
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (!isDocument(bytes, res.headers.get("content-type"))) {
      // A 200 carrying an HTML bot-check instead of the file. Caught on the very
      // first live run: Immigration served the real PDF once and an interstitial
      // minutes later, and without this the panel would have reported the PVIP
      // FAQ as "changed" — twice a week, at random, for ever. An alert that
      // cries wolf is worse than no alert, because it trains you to close it.
      console.log(`[watch] ${url} — 200 but not a document; treating as unread`);
      return null;
    }
    return { hash: await sha256Hex(bytes), bytes };
  } catch (err) {
    console.log(`[watch] ${url} — fetch failed: ${String(err)}`);
    return null;
  }
}

/**
 * Is this the file, or a page pretending to be one?
 *
 * Content-type is checked first and trusted least — the servers that serve an
 * interstitial usually label it text/html, but not always. The magic bytes are
 * the real test: every PDF begins "%PDF", and nothing that begins "<" is one.
 */
function isDocument(bytes: Uint8Array, contentType: string | null): boolean {
  if (contentType && contentType.toLowerCase().includes("html")) return false;
  if (bytes.length < 8) return false;
  const head = new TextDecoder().decode(bytes.slice(0, 5));
  if (head.startsWith("%PDF")) return true;
  return !head.trimStart().startsWith("<");
}

async function headSafely(
  url: string,
): Promise<{ length: number | null; etag: string | null; lastModified: string | null } | null> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "user-agent": BROWSER_UA },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const len = res.headers.get("content-length");
    return {
      length: len ? Number(len) : null,
      etag: res.headers.get("etag"),
      lastModified: res.headers.get("last-modified"),
    };
  } catch {
    return null;
  }
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Strip what changes on every render.
 *
 * Deliberately narrow. Stripping all dates would be easy and wrong: an effective
 * date IS the change on a government page more often than not. Only the page
 * furniture that moves by itself is removed — a "last updated" stamp, a visitor
 * counter, a session id in a query string.
 */
function normalise(text: string): string {
  return text
    .replace(/\b(last\s+(updated|modified|reviewed)|page\s+last\s+reviewed)\b[^.]{0,60}/gi, " ")
    .replace(/\b(visitors?|hits|views)\s*[:#]?\s*[\d,]{3,}/gi, " ")
    .replace(/[?&](sid|sessionid|token|_t|cb)=[^\s&]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * What text appeared and what disappeared, sentence by sentence.
 *
 * Not a real LCS diff, and it does not need to be: the question a reader of this
 * panel has is "what does the page say now that it did not say yesterday", and
 * set difference over sentences answers exactly that. A reordered paragraph
 * shows as nothing, which is the correct answer.
 */
function diffProse(before: string, after: string): string {
  const split = (s: string) =>
    s
      .split(/(?<=[.!?])\s+/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

  const oldSet = new Set(split(before));
  const newSet = new Set(split(after));

  const added = split(after).filter((s) => !oldSet.has(s));
  const removed = split(before).filter((s) => !newSet.has(s));

  const lines = [
    ...removed.map((s) => `- ${s}`),
    ...added.map((s) => `+ ${s}`),
  ];
  return lines.join("\n");
}

/** Characters of actual difference, ignoring the +/- markers. */
function changedChars(diff: string): number {
  return diff
    .split("\n")
    .reduce((n, line) => n + Math.max(0, line.length - 2), 0);
}

/** One sentence on what moved. Advisory — the diff underneath is the evidence. */
async function describeChange(env: Env, label: string, diff: string): Promise<string> {
  if (!diff.trim()) {
    return "The page changed, but no added or removed sentences could be isolated.";
  }
  const prompt = `An official government page for a visa programme has changed.
Below is a diff: lines starting with "-" were removed, lines starting with "+" were added.

Say in ONE sentence what changed, quoting any figure, fee, threshold or date that
moved. If the change is only wording, navigation or formatting, say exactly that.
Do not speculate about why. Output the sentence and nothing else.

PAGE: ${label}

${diff.slice(0, 4000)}`;

  try {
    const resp = (await env.AI.run(env.SUMMARY_MODEL as keyof AiModels, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 256,
    } as never)) as AiResponse;
    const text = extractText(resp).trim();
    return text || "The page changed. Read the diff below.";
  } catch (err) {
    console.log(`[watch] summary failed — ${String(err)}`);
    return "The page changed. Read the diff below.";
  }
}

/** How many editions of one URL to remember. Enough for a round-robin, not a log. */
const MAX_SEEN = 6;

function seenBefore(seen: string, hash: string): boolean {
  return parseSeen(seen).includes(hash);
}

function parseSeen(seen: string): string[] {
  try {
    const v = JSON.parse(seen || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function baseline(
  env: Env,
  id: string,
  hash: string,
  text: string,
  stampChange = false,
  seen = "[]",
): Promise<void> {
  const next = [hash, ...parseSeen(seen).filter((h) => h !== hash)].slice(0, MAX_SEEN);
  await env.DB.prepare(
    `UPDATE source_watch
        SET content_hash = ?, snapshot = ?, seen_hashes = ?,
            last_checked_at = datetime('now'),
            last_changed_at = CASE WHEN ? THEN datetime('now') ELSE last_changed_at END,
            consecutive_failures = 0, status = 'ok'
      WHERE id = ?`,
  )
    .bind(hash, text.slice(0, MAX_SNAPSHOT), JSON.stringify(next), stampChange ? 1 : 0, id)
    .run();
}

async function snapshotOf(env: Env, id: string): Promise<string | null> {
  const row = await env.DB.prepare("SELECT snapshot FROM source_watch WHERE id = ?")
    .bind(id)
    .first<{ snapshot: string | null }>();
  return row?.snapshot ?? null;
}

/**
 * Upsert the watch list from the site's own figures.json.
 *
 * The site emits `sources` from programmes.ts at build, so the watched set is
 * the cited set by construction — add a programme and its official URL is
 * watched from the next deploy, with no second list to keep in step. The
 * catalogue can be one deploy stale (see scripts/emit-figures.mjs), which for a
 * daily check is not a problem worth solving.
 *
 * Rows are only ever added or relabelled here. A URL that disappears from
 * figures.json is left in place: it was cited once, it may be cited again, and
 * deleting it would throw away its snapshot and its event history.
 */
async function loadWatchList(env: Env): Promise<void> {
  let sources: { programme?: string; url?: string; label?: string }[] = [];
  try {
    const res = await fetch(`${env.SITE_ORIGIN}/figures.json`, {
      headers: { accept: "application/json" },
    });
    if (res.ok) {
      const body = (await res.json()) as { sources?: typeof sources };
      sources = body.sources ?? [];
    } else {
      console.log(`[watch] figures.json — status ${res.status}`);
    }
  } catch (err) {
    console.log(`[watch] figures.json unreadable — ${String(err)}`);
  }

  const list = sources.length
    ? sources
        .filter((s) => typeof s.url === "string" && /^https?:\/\//.test(s.url))
        .map((s) => ({
          url: s.url as string,
          label: s.label ?? `${s.programme ?? "site"} — official source`,
          programme: s.programme ?? null,
        }))
    : SEED;

  if (!sources.length) console.log("[watch] falling back to the seeded watch list");

  for (const s of list) {
    await env.DB.prepare(
      `INSERT INTO source_watch (id, url, label, programme, mode)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (url) DO UPDATE SET label = excluded.label,
                                       programme = excluded.programme`,
    )
      .bind(crypto.randomUUID(), s.url, s.label.slice(0, 200), s.programme, modeFor(s.url))
      .run();
  }
}

/**
 * A PDF has no prose a Worker can extract, so it is hashed whole.
 *
 * By extension, which misses a PDF served from an extensionless URL. That case
 * degrades safely: the html read finds no usable prose, the row goes
 * `unreachable`, and the dashboard shows it in red rather than pretending.
 */
function modeFor(url: string): "html" | "binary" {
  return /\.(pdf|docx?|xlsx?)(\?|$)/i.test(url) ? "binary" : "html";
}

async function listWatchRows(env: Env): Promise<WatchRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, url, label, programme, mode, content_hash, seen_hashes,
            last_checked_at, last_changed_at, status, consecutive_failures
       FROM source_watch ORDER BY programme, label`,
  ).all<WatchRow>();
  return results ?? [];
}

/** The dashboard's view: every source, plus any change not yet acknowledged. */
export async function listWatch(
  env: Env,
): Promise<{ sources: WatchRow[]; events: (WatchEvent & { label: string })[] }> {
  const sources = await listWatchRows(env);
  const { results } = await env.DB.prepare(
    `SELECT e.id, e.watch_id, e.detected_at, e.summary, e.diff,
            e.acknowledged_at, e.promoted_item_id, w.label
       FROM source_watch_events e
       JOIN source_watch w ON w.id = e.watch_id
      WHERE e.acknowledged_at IS NULL
      ORDER BY e.detected_at DESC
      LIMIT 50`,
  ).all<WatchEvent & { label: string }>();
  return { sources, events: results ?? [] };
}

/** Seen it. The snapshot was already re-baselined when the event was raised. */
export async function acknowledgeEvent(env: Env, eventId: string): Promise<boolean> {
  const res = await env.DB.prepare(
    `UPDATE source_watch_events
        SET acknowledged_at = datetime('now')
      WHERE id = ? AND acknowledged_at IS NULL`,
  )
    .bind(eventId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

/**
 * Push a change into the news queue as a pending story.
 *
 * The interesting column is `source_text`. writeArticle passes it straight
 * through as its `override` (article.ts), which skips the extractor and the
 * alternate-source hunt entirely — so a change detected in a PDF that no
 * extractor could ever read still writes cleanly, from the diff and the snapshot
 * we already hold. Nothing in the approve → write → publish path changes.
 */
export async function promoteEvent(
  env: Env,
  eventId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string; status: number }> {
  const row = await env.DB.prepare(
    `SELECT e.id, e.summary, e.diff, e.promoted_item_id,
            w.url, w.label, w.programme, w.snapshot
       FROM source_watch_events e
       JOIN source_watch w ON w.id = e.watch_id
      WHERE e.id = ?`,
  )
    .bind(eventId)
    .first<{
      id: string;
      summary: string;
      diff: string;
      promoted_item_id: string | null;
      url: string;
      label: string;
      programme: string | null;
      snapshot: string | null;
    }>();

  if (!row) return { ok: false, error: "No such event", status: 404 };
  if (row.promoted_item_id) {
    return { ok: false, error: "Already queued", status: 409 };
  }

  // What the writer is given to work from: the change itself first, because that
  // is the story, then the page as it now stands for context. Never the old
  // copy — an article written from superseded text is the exact failure this
  // whole watcher exists to prevent.
  const sourceText = [
    `OFFICIAL SOURCE: ${row.label} (${row.url})`,
    `WHAT CHANGED: ${row.summary}`,
    row.diff ? `DIFF:\n${row.diff}` : "",
    row.snapshot ? `THE PAGE NOW READS:\n${row.snapshot.slice(0, 8000)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO news_items
       (id, title, summary, category, source_name, source_url, published_at,
        status, origin, source_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'watch', ?)`,
  )
    .bind(
      id,
      `${row.label}: official page updated`.slice(0, 300),
      row.summary.slice(0, 800),
      newsCategoryFor(row.programme),
      officialSourceName(row.url),
      row.url,
      new Date().toISOString(),
      sourceText.slice(0, 12000),
    )
    .run();

  await env.DB.prepare(
    `UPDATE source_watch_events
        SET promoted_item_id = ?, acknowledged_at = datetime('now')
      WHERE id = ?`,
  )
    .bind(id, eventId)
    .run();

  return { ok: true, id };
}

/**
 * A programme slug is not a news category, and the two disagree in exactly the
 * places that matter: the three MM2H tiers are one category, and Sarawak's slug
 * is `smm2h` while its category is `sarawak-mm2h`. Anything unrecognised files
 * as general rather than throwing — a promoted item with an odd category is a
 * tidying problem, a 500 in the dashboard is not.
 */
function newsCategoryFor(programme: string | null): string {
  if (!programme) return "general";
  if (programme.startsWith("mm2h")) return "mm2h";
  if (programme === "smm2h") return "sarawak-mm2h";
  const known = ["pvip", "de-rantau", "employment-pass", "student-pass", "general"];
  return known.includes(programme) ? programme : "general";
}

/** The citation is the ministry, not "imigresen-online.imi.gov.my". */
function officialSourceName(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host.endsWith("imi.gov.my")) return "Immigration Department of Malaysia";
  if (host.endsWith("motac.gov.my")) return "Ministry of Tourism, Arts and Culture";
  if (host.endsWith("sarawak.gov.my")) return "Sarawak Government";
  if (host.endsWith("mdec.my")) return "MDEC";
  return host;
}
