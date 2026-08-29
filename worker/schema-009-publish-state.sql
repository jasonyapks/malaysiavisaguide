-- Migration 009 — whether an approved article actually reached the repo.
--
-- WHY. Publishing is committing content/news/<slug>.md to main (migration of
-- 2026-08-25). But the commit can fail — most often because GITHUB_TOKEN is
-- unset or expired — and the approve endpoint reports that only in a `warning`
-- field of an otherwise-200 response. On 2026-08-29 the first approval after the
-- migration was stranded exactly this way: approved in D1, never in the repo,
-- and the dashboard still showed a green /news/ link that 404s. The row carried
-- no signal that the commit had not happened, so nothing could flag it.
--
-- Two columns, because "not in the repo" has two very different causes that must
-- not be conflated:
--
--   committed_at  The last time the file was successfully committed. NULL means
--                 it has never been committed — an approve whose commit failed.
--                 This is the loud case: an article that is supposed to be live
--                 and is not.
--
--   retired_at    When the file was deliberately taken down (the Retire button,
--                 which deletes content/news/<slug>.md but keeps the row). A
--                 retired article is ALSO absent from the repo, but on purpose —
--                 it must never show as a failure. Set here, cleared whenever the
--                 article is committed again.
--
-- Stranded (the banner's target) is therefore precisely:
--   status='approved' AND slug IS NOT NULL AND committed_at IS NULL
--                                            AND retired_at IS NULL
--
-- BACKFILL. Every approved article with a slug is live in the repo right now —
-- the migration script committed all twenty, and the one stranded row was
-- committed by hand the same day. So stamp them committed, or the banner would
-- open crying wolf over the entire existing catalogue on first deploy. A genuine
-- future failure starts from NULL and is caught.
ALTER TABLE news_items ADD COLUMN committed_at TEXT;
ALTER TABLE news_items ADD COLUMN retired_at TEXT;

UPDATE news_items
   SET committed_at = COALESCE(decided_at, updated_at, created_at)
 WHERE status = 'approved' AND slug IS NOT NULL;
