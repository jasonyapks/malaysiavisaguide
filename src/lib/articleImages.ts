import registry from "@/lib/data/article-images.json";
import type { SiteImage } from "@/lib/images";

/**
 * Hero images for /news/ and /insights/ articles.
 *
 * Separate from `images.ts` because nothing here is written by hand.
 * `scripts/article-image.mjs` pulls the picture Jason attached in the dashboard,
 * writes the file under public/ and the entry here in one pass, and is the only
 * thing that edits this JSON. Editing it yourself will be undone by the next
 * pull.
 *
 * An article with no entry renders exactly as it did before any of this existed:
 * no slot, no placeholder box. That is deliberate. The news feed fills from a
 * cron and an approval click, and a story published before anyone has chosen a
 * picture should look like a story without one, not like a broken page.
 */

type Entry = {
  src: string;
  /** 1200×630 JPEG for the social card; JPEG because webp OG cards still lose. */
  og: string;
  alt: string;
  /** Photographer or agency, rendered as a caption. null renders none. */
  credit: string | null;
  /** The source's image_updated_at, so the pull can tell what has changed. */
  stamp: string;
  updated: string;
};

const entries = registry as Record<string, Entry>;

/** Key for a news story. */
export function newsImageKey(slug: string): string {
  return `news/${slug}`;
}

/** Key for an insights article — category included, as the URL has it. */
export function insightImageKey(category: string, slug: string): string {
  return `insights/${category}/${slug}`;
}

/**
 * The image for an article, in the shape `<Figure>` takes, or null.
 *
 * `ready` is always true: an entry only exists once the file has been written.
 */
export function articleImage(key: string): SiteImage | null {
  const entry = entries[key];
  if (!entry) return null;
  return {
    src: entry.src,
    alt: entry.alt,
    brief: entry.alt,
    ready: true,
    ...(entry.credit && { credit: { name: entry.credit } }),
  };
}

/** The absolute URL of an article's social card, for OG/Twitter metadata. */
export function articleOgImage(key: string): string | null {
  return entries[key]?.og ?? null;
}
