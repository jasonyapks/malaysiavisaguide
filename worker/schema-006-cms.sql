-- Migration 006 — the CMS document store.
--
-- WHY. Everything the site publishes today is either a news row (migration 002)
-- or a .tsx file in the repo. The second half is the problem: an /insights/
-- article is 500 lines of hand-written JSX, so writing one needs an editor, a
-- terminal and a deploy. This table is where an article lives instead.
--
-- ONE TABLE, NOT ONE PER CONTENT TYPE. `kind` discriminates. Phase 6 puts the
-- marketing pages here as kind='page' and gets GET /api/cms/pages for free;
-- splitting later is a rename, splitting now is two of everything for no reader
-- benefit. The columns that are genuinely article-shaped (published, reviewed,
-- reading_minutes) are nullable so a page row does not have to invent them.
--
-- THE BODY IS JSON, AND IT IS AN AST — NEVER HTML. `blocks` holds the typed
-- union in shared/blocks.ts. That is not a storage detail: a `html` column would
-- put the dashboard one paste away from a <script> on every reader's page, and
-- would make the design system optional the first time somebody typed a style
-- attribute. shared/validate.ts is run by the Worker on save AND by the site at
-- build, so a document that cannot render fails where it can be fixed rather
-- than on a live publish.
--
-- WHY JSON RATHER THAN A blocks TABLE. A block has no identity outside its
-- article, is never queried across articles, and is always read and written as a
-- whole document. A child table would buy referential integrity nobody needs and
-- cost a join plus an ordering column on every read. D1's 2MB row limit is the
-- real constraint, and it is not close: the longest hand-written article is
-- ~26KB of prose. Images are the thing that would blow it, and they went to R2
-- in migration 005 precisely so they never touch a row.
--
-- Run: wrangler d1 execute mvg-news --remote --file=./schema-006-cms.sql
--
-- APPLIED TO PRODUCTION 2026-08-01 — table plus both indexes, zero rows. Phase 4
-- ships the read path against an empty table on purpose; the first row arrives
-- with the editor in Phase 5.

CREATE TABLE IF NOT EXISTS cms_documents (
  -- A UUID, not the path. The path is the URL and the URL can be corrected once,
  -- before first publish; a primary key that moves takes every foreign reference
  -- with it. Identity and address are different questions and this table answers
  -- them with different columns.
  id TEXT PRIMARY KEY,

  -- 'insight' today. 'page' in Phase 6 for home/about/contact/privacy.
  kind TEXT NOT NULL,

  -- Address. For an insight: /insights/<category>/<slug>/.
  --
  -- NOT NULL DEFAULT '' rather than nullable, and that is deliberate: a page row
  -- has no category, and SQLite treats every NULL in a UNIQUE index as distinct
  -- — so a nullable column here would silently allow two rows at kind='page',
  -- slug='home'. The empty string collides properly.
  category TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL,

  title TEXT NOT NULL,
  dek TEXT NOT NULL DEFAULT '',

  -- ISO dates (YYYY-MM-DD). `reviewed` drives the byline and is the figure
  -- provenance the whole site's credibility rests on, so it is stored on the
  -- document rather than derived from updated_at — fixing a typo is not a review.
  published TEXT,
  reviewed TEXT,
  reading_minutes INTEGER,

  -- JSON. Shapes in shared/insight.ts; all four validated on save.
  related_guides TEXT NOT NULL DEFAULT '[]',
  blocks TEXT NOT NULL DEFAULT '[]',
  faq TEXT NOT NULL DEFAULT '[]',
  sources TEXT NOT NULL DEFAULT '[]',

  -- 1 until it is deliberately published. Defaulting to draft is the only safe
  -- direction: a half-written article that is accidentally live is a worse
  -- outcome than a finished one that needs a second click.
  --
  -- A draft still gets a real prerendered page at its real URL, noindex, absent
  -- from every listing and from the sitemap — that is how it gets reviewed.
  draft INTEGER NOT NULL DEFAULT 1,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One document per address. The constraint that makes "save" an upsert on the
-- path and makes a duplicate slug impossible rather than merely unlikely.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_path
  ON cms_documents (kind, category, slug);

-- The index query is `WHERE kind = ? ORDER BY published DESC`, run once per
-- build. Cheap now, and it stays a range scan rather than a sort as the article
-- count grows.
CREATE INDEX IF NOT EXISTS idx_cms_kind_published
  ON cms_documents (kind, published DESC);
