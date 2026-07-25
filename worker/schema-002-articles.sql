-- Migration 002 — turn the news feed into a blog.
--
-- Before this, a news_item was a headline + a 2-sentence summary + a link out,
-- and /news was a list of links. Now each approved item also carries an
-- ORIGINAL article written on this site, so a visitor reads it here instead of
-- bouncing to the publisher.
--
-- The copyright position is unchanged and matters as much as ever: `body` is
-- our own writing about the news, generated from the source and reviewed by
-- Jason before publish. It is NOT the source article's text. The one piece of
-- the publisher's own wording we keep is `source_excerpt` — a single short
-- quote, attributed on the page, next to a link to the original.
--
-- Run: wrangler d1 execute mvg-news --remote --file=./schema-002-articles.sql

-- URL slug for /news/<slug>/. NULL until the article is written, which is why
-- it can be added to a populated table. UNIQUE via the index below rather than
-- a column constraint, because SQLite cannot add a UNIQUE column with ALTER.
ALTER TABLE news_items ADD COLUMN slug TEXT;

-- Our own headline. `title` keeps the publisher's, which stays visible in the
-- dashboard as the reference point for review — so nothing is lost when our
-- headline is written for our own readers and our own keywords instead.
ALTER TABLE news_items ADD COLUMN headline TEXT;

-- One-sentence standfirst under the headline. Longer and more specific than
-- `summary`, which stays as the index-card blurb.
ALTER TABLE news_items ADD COLUMN dek TEXT;

-- The article itself, as JSON: { keyPoints: string[], sections: [{heading, paragraphs: string[]}], whatItMeans: string[] }
-- Stored structured rather than as markdown so the site renders it into its own
-- components with no markdown parser in the bundle, and so a malformed
-- generation fails loudly at parse time instead of publishing mush.
ALTER TABLE news_items ADD COLUMN body TEXT;

-- One short quote from the source, attributed on the page. Kept separate from
-- `body` so it can never be mistaken for our own writing.
ALTER TABLE news_items ADD COLUMN source_excerpt TEXT;

-- Estimated read time in minutes, computed at write time from the body.
ALTER TABLE news_items ADD COLUMN reading_minutes INTEGER;

-- Which model wrote it. When a model is deprecated or output quality shifts,
-- this is how we find everything written by the old one.
ALTER TABLE news_items ADD COLUMN article_model TEXT;

-- Last edit — either a regeneration or one of Jason's manual corrections.
-- Feeds dateModified in the page's NewsArticle schema.
ALTER TABLE news_items ADD COLUMN updated_at TEXT;

-- Slugs are URLs, so collisions are page collisions. Partial index so the many
-- pending rows with slug IS NULL do not collide with each other.
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug
  ON news_items (slug) WHERE slug IS NOT NULL;
