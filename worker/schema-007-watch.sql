-- Migration 007 — the official-source watcher.
--
-- WHY. Every figure the site publishes traces to an official page: the PVIP FAQ
-- PDF, the MOTAC MM2H guide, the ESD salary announcement. Nothing watched them.
-- When PVIP's terms changed in March 2026 the site served the 2022 numbers as
-- fact for four months, across /visas/pvip/, /compare/, the quiz and the
-- calculator — and it was never a news story, so the news sweep could not have
-- caught it. The source document was the only thing that moved. These two tables
-- are what watches the source documents.
--
-- THE WATCH LIST IS NOT MAINTAINED HERE. Rows are upserted by URL from the
-- `sources` array in the site's public/figures.json, which is emitted from
-- src/lib/data/programmes.ts at build. That means the watched set is exactly the
-- set of URLs the site's own figures cite, by construction. A second hand-kept
-- list would drift the moment somebody added a programme, and the drift would be
-- invisible — a page nobody watches looks identical to a page that never changes.
--
-- TWO TABLES, NOT ONE. The row is the page and its current state; the event is a
-- change that happened. Folding them together would mean either losing the
-- previous change when the next one lands, or a `changes` JSON blob that cannot
-- be queried. An event is also the thing that gets acknowledged or promoted to a
-- news item, so it needs its own identity.
--
-- Run: wrangler d1 execute mvg-news --remote --file=./schema-007-watch.sql

CREATE TABLE IF NOT EXISTS source_watch (
  id TEXT PRIMARY KEY,

  -- The official page. UNIQUE because it is the upsert key from figures.json —
  -- the same URL cited by two programmes is one page to watch, not two.
  url TEXT NOT NULL UNIQUE,

  -- What to call it in the dashboard, e.g. "PVIP — Immigration FAQ (PDF)".
  label TEXT NOT NULL,

  -- Which programme's figures rest on this page. Free text, matching the ids in
  -- programmes.ts. NULL for a page that is watched but not cited.
  programme TEXT,

  -- 'html' — hash the extracted prose, and diff it on change.
  -- 'binary' — hash the raw bytes. For PDFs, where there is no prose to extract
  -- in a Worker and so no diff to show. Detection still works; only the
  -- "what changed" half is unavailable, which is why the mode is recorded
  -- rather than inferred at read time.
  --
  -- A binary hash prefixed 'v:' is of the cache validators (etag, last-modified)
  -- rather than of the bytes, which is how a document too large to pull through
  -- a Worker is still watched — MOTAC's MM2H guide is 37 MB. Validators are the
  -- fallback and never the first choice: Sarawak's guide is generated per
  -- request and stamps Last-Modified with the time you asked, so a validator
  -- fingerprint there would report a change every morning. See watch.ts.
  mode TEXT NOT NULL DEFAULT 'html',

  -- SHA-256 of the normalised content. NULL before the first successful read:
  -- that is what makes the first run a baseline rather than a change event for
  -- every page at once.
  content_hash TEXT,

  -- The last good read, capped. Model input and diff material ONLY — never
  -- rendered, never in the public API, the same rule as news_items.source_text.
  -- See the header of schema-002-articles.sql.
  snapshot TEXT,

  last_checked_at TEXT,
  last_changed_at TEXT,

  -- 'ok' | 'unreachable'. Paired with consecutive_failures so the dashboard can
  -- say "this page has not been readable for three days" instead of showing a
  -- stale green tick. A watcher that has quietly stopped watching is worse than
  -- no watcher, because it is trusted.
  status TEXT NOT NULL DEFAULT 'ok',
  consecutive_failures INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS source_watch_events (
  id TEXT PRIMARY KEY,
  watch_id TEXT NOT NULL REFERENCES source_watch (id) ON DELETE CASCADE,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- What the model made of the before/after. Advisory: the diff below is the
  -- evidence, this is the reading of it.
  summary TEXT NOT NULL DEFAULT '',

  -- The word-level diff, capped. Empty for mode='binary'.
  diff TEXT NOT NULL DEFAULT '',

  -- Set when Jason has seen it. The row's snapshot is re-baselined at the same
  -- time, so an unacknowledged event is exactly "a change you have not looked
  -- at" rather than "a change since some arbitrary time".
  acknowledged_at TEXT,

  -- Set when the change was pushed into the news queue as a story. NULL is the
  -- common case: most changes need programmes.ts edited, not an article written.
  promoted_item_id TEXT
);

-- The dashboard's only event query: unacknowledged first, newest first.
CREATE INDEX IF NOT EXISTS idx_watch_events_open
  ON source_watch_events (acknowledged_at, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_watch_events_watch
  ON source_watch_events (watch_id, detected_at DESC);
