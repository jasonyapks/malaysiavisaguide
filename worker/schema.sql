-- D1 schema for the Malaysia Visa Guide news pipeline.
-- One row per candidate news item. The cron fetch inserts items as 'pending';
-- Jason approves in the dashboard, which flips status to 'approved' and only
-- then does the public /news page show it.
--
-- Copyright-safe by design: we store a short AI summary + the source name and
-- link, never the reproduced article body. The public page links out.

CREATE TABLE IF NOT EXISTS news_items (
  id           TEXT PRIMARY KEY,           -- uuid
  title        TEXT NOT NULL,              -- headline (from the source)
  summary      TEXT NOT NULL,              -- our own 2-sentence AI summary
  category     TEXT NOT NULL,              -- programme slug or 'general'
  source_name  TEXT NOT NULL,              -- e.g. "The Star"
  source_url   TEXT NOT NULL UNIQUE,       -- link out; UNIQUE de-dupes the feed
  published_at TEXT,                       -- ISO date from the source, if any
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at   TEXT                        -- when Jason approved/rejected
);

CREATE INDEX IF NOT EXISTS idx_news_status  ON news_items (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_pubdate ON news_items (published_at DESC);
