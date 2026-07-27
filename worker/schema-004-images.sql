-- Migration 004 — a hero image per article, attached by hand.
--
-- WHY IT LIVES IN D1 AT ALL. The site is a static export, so the file a reader
-- eventually loads is a .webp committed to the repo under public/images/news/.
-- This is not that copy. This is the holding pen between the dashboard, where
-- Jason picks the picture, and the build machine, which is the only place that
-- can resize it and put it in the repo. `scripts/article-image.mjs` empties the
-- pen on the way to a deploy.
--
-- WHY NOT R2. It would be the right home for a large or long-lived object. These
-- are neither: one image per article, capped at about a megabyte by the upload
-- path, and dead weight the moment the file is committed. A second binding and a
-- second place to look for the truth is not worth it for that.
--
-- SIZE. `image_data` is base64, so it is a third larger than the file. The
-- dashboard downscales anything it uploads to 1800px wide before sending, and
-- the URL fetch refuses anything over the cap in index.ts rather than storing a
-- row that D1 will later refuse to read back.
--
-- Run: wrangler d1 execute mvg-news --remote --file=./schema-004-images.sql

-- The image itself, base64-encoded, and its type. NULL means no image, which is
-- the normal state of an article and renders as a page without a picture.
ALTER TABLE news_items ADD COLUMN image_data TEXT;
ALTER TABLE news_items ADD COLUMN image_mime TEXT;

-- Alt text. Not optional in the dashboard: a hero image with no alt is a
-- failure against WCAG 1.1.1 on every article page it appears on, and this is
-- the only moment anyone knows what the picture shows.
ALTER TABLE news_items ADD COLUMN image_alt TEXT;

-- The credit line rendered under the photograph, e.g. "Bernama" or
-- "Jason Yap". NULL renders no caption at all.
ALTER TABLE news_items ADD COLUMN image_credit TEXT;

-- Where it came from: a URL if it was fetched, or the original filename if it
-- was uploaded. Provenance for a picture is the same discipline as provenance
-- for a figure — see /editorial-policy/.
ALTER TABLE news_items ADD COLUMN image_source TEXT;

ALTER TABLE news_items ADD COLUMN image_updated_at TEXT;
