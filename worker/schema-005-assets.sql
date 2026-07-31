-- Migration 005 — images move out of D1 and into R2.
--
-- WHY, AND WHY NOW. Migration 004 put the hero image in `news_items.image_data`
-- as base64, and said so in its own comment: one image per article, capped near a
-- megabyte, dead weight the moment the file is committed. That reasoning held for
-- exactly as long as an article had one picture. The block editor gives an
-- article five figures, and D1's 2,000,000-byte limit is on the WHOLE ROW —
-- shared with `body` and with up to 12,000 characters of pasted `source_text`.
-- Two figures and a long story is a row D1 refuses to write back, and the failure
-- lands on a save the author thought had worked.
--
-- So the bytes go to R2 and this table holds what the bytes cannot: what the
-- picture shows, who took it, where it came from. R2 has no queryable metadata;
-- D1 does. Splitting them that way is the whole design.
--
-- WHAT IS NOT HERE. No `data` column of any kind. If an image ever needs to be
-- read out of D1 again, this migration was wrong.
--
-- Run: wrangler d1 execute mvg-news --remote --file=./schema-005-assets.sql

CREATE TABLE IF NOT EXISTS assets (
  -- A UUID minted by the browser before the first byte is uploaded, so all
  -- three R2 objects can be written under their final keys and the commit that
  -- follows is a pure metadata write. An upload that dies half way leaves
  -- orphaned objects and no row — which is the harmless direction to fail in.
  id TEXT PRIMARY KEY,

  -- The canonical slot this image fills, or NULL.
  --
  -- 'site/pvip', 'news/<slug>', 'insights/<category>/<slug>'. It is the key the
  -- site's article-images.json is written under, which is why it looks like a
  -- path rather than an id.
  --
  -- NULLABLE ON PURPOSE, and this is the distinction the whole table turns on: a
  -- `figure` block inside an article references an asset BY ID, so the same
  -- photograph can appear twice in one piece and in two different pieces. `slot`
  -- answers the different question "which single image is THE image for this
  -- thing" — a page hero, a programme card — and there can only ever be one.
  slot TEXT,

  -- The three R2 keys. `hero` is 1440x810 webp, `og` is 1200x630 jpeg, `orig` is
  -- the file exactly as it was uploaded.
  --
  -- Stored rather than derived from the id, because the extension on `orig`
  -- depends on what was uploaded and because a key that is written down can be
  -- changed later without rewriting the code that reads it.
  --
  -- `og_key` is nullable: a programme card has no social card and generating one
  -- it will never serve is waste. `hero_key` and `orig_key` are not — an asset
  -- with nothing to render is not an asset.
  hero_key TEXT NOT NULL,
  og_key TEXT,
  orig_key TEXT NOT NULL,

  -- The mime type of the ORIGINAL. The derivatives are always image/webp and
  -- image/jpeg respectively, so recording those would be recording a constant.
  mime TEXT NOT NULL,

  -- Pixel dimensions of the original, as the browser measured them before
  -- cropping. Kept for the dashboard, which can then warn that a 600px-wide
  -- upload is about to be enlarged into a 1440px hero.
  width INTEGER,
  height INTEGER,

  -- NOT NULL, and enforced again in the upload endpoint. A hero image with no
  -- alt fails WCAG 1.1.1 on every page it appears on, and the upload is the only
  -- moment anybody knows what the picture shows. Asking later means never — the
  -- same rule migration 004 set for image_alt, now backed by the schema.
  alt TEXT NOT NULL,

  -- The caption rendered under the photograph. NULL renders none.
  credit TEXT,

  -- Provenance: the URL it was fetched from, or the filename it was uploaded as.
  -- Same discipline as provenance for a figure — see /editorial-policy/.
  source TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One asset per slot — but only where a slot is set.
--
-- A plain UNIQUE constraint would not do: SQLite treats every NULL as distinct,
-- so plain UNIQUE happens to allow many NULLs, but a PARTIAL index says it on
-- purpose and keeps the NULL rows out of the index entirely. There will be far
-- more unslotted figures than slotted heroes, so that is most of the table.
--
-- The uniqueness is what makes "replace the picture for this slot" a single
-- INSERT ... ON CONFLICT rather than a read-modify-write that can race.
CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_slot
  ON assets (slot) WHERE slot IS NOT NULL;

-- The manifest at GET /api/images is ordered by slot; the build machine reads it
-- once per deploy and nothing else does. Cheap index, and it keeps that one query
-- off a table scan as the figure count grows.
CREATE INDEX IF NOT EXISTS idx_assets_updated ON assets (updated_at);
