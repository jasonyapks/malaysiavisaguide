-- Migration 003 — manual article intake, and the humanizer queue.
--
-- WHY. The pipeline can only publish a story it can READ. A paywall, a 403 on
-- Worker egress (The Star does this), or a JavaScript-only page all end the same
-- way: generateAndStore returns 422 and the item sits in the queue forever. The
-- error it returns already tells Jason to paste a readable version of the story
-- in — this migration is what gives that instruction somewhere to land.
--
-- The copyright position from 002 is unchanged. `source_text` is the publisher's
-- wording and is INPUT TO THE MODEL AND NOTHING ELSE, exactly like the text
-- extract.ts pulls off a page. It is never rendered, never in INDEX_COLUMNS, and
-- never leaves the Access-gated admin API. The only publisher wording that
-- reaches a reader is still the one attributed `source_excerpt`.
--
-- Run: wrangler d1 execute mvg-news --remote --file=./schema-003-manual.sql

-- The pasted article body. Unlike extracted text this one IS stored, because a
-- regeneration and the Claude polish pass both need to re-read the source, and
-- the alternative is asking Jason to paste 8,000 characters again.
ALTER TABLE news_items ADD COLUMN source_text TEXT;

-- 'sweep' | 'manual'. Defaulted rather than backfilled: every row that existed
-- before this migration came from the daily sweep, so the default is already the
-- correct answer for all of them.
ALTER TABLE news_items ADD COLUMN origin TEXT NOT NULL DEFAULT 'sweep';

-- NULL (not queued) | 'needs-claude' | 'claude-polished'.
--
-- The Worker's humanize pass is a condensed version of the /humanizer skill
-- running on gpt-oss-120b — good enough that a draft is readable the moment it
-- is written, not good enough to be the last word. This column is the handover:
-- it marks what the real 412-line skill should be run over in a Claude session
-- before the deploy that publishes it.
ALTER TABLE news_items ADD COLUMN polish_state TEXT;

-- When the real skill last ran over this row.
ALTER TABLE news_items ADD COLUMN polished_at TEXT;

-- Partial — the queue is a handful of rows against a table where the column is
-- overwhelmingly NULL, so indexing the NULLs would be all cost and no benefit.
CREATE INDEX IF NOT EXISTS idx_news_polish
  ON news_items (polish_state) WHERE polish_state IS NOT NULL;
