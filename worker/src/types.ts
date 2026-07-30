export interface Env {
  DB: D1Database;
  AI: Ai;
  /** Headless Chrome — the fallback reader in extract.ts. Metered; see wrangler.jsonc. */
  BROWSER: BrowserRun;
  SITE_ORIGIN: string;
  /** This Worker's own workers.dev origin — see SITE_API in dashboard.ts. */
  NEWS_API_ORIGIN: string;
  TEAM_DOMAIN: string;
  POLICY_AUD: string;
  CF_ACCOUNT_ID: string;
  WEB_ANALYTICS_SITE_TAG: string;
  /** Small, fast model — triage and the 2-sentence blurb, ~20 calls a sweep. */
  SUMMARY_MODEL: string;
  /** Large model — writes the full article, once per approved item. */
  ARTICLE_MODEL: string;
  /** Secret — Cloudflare API token with Account Analytics: Read. */
  CF_ANALYTICS_TOKEN: string;
  /**
   * Secret — Cloudflare API token with Cloudflare Pages: Edit. Starts a build and
   * reads its status; see publish.ts. Absent, publishing degrades to a message
   * rather than breaking the dashboard.
   */
  CF_PAGES_TOKEN: string;
  /** The NUMERIC GA4 property id — not the G-XXXX measurement tag. See ga4.ts. */
  GA_PROPERTY_ID: string;
  /** The GA4 service account's client_email. Must be a Viewer on the property. */
  GA_SA_EMAIL: string;
  /** Secret — the service account's private_key PEM (PKCS#8). */
  GA_SA_PRIVATE_KEY: string;
}

export interface NewsItem {
  id: string;
  /** The publisher's headline, kept for reference in the dashboard. */
  title: string;
  summary: string;
  category: string;
  source_name: string;
  source_url: string;
  published_at: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;

  // --- Added by migration 002. NULL until the article is written on approval. ---
  /** URL slug — the article lives at /news/<slug>/. */
  slug: string | null;
  /** Our own headline, written for our readers rather than the publisher's. */
  headline: string | null;
  /** Standfirst; doubles as the page's meta description. */
  dek: string | null;
  /** JSON-encoded ArticleBody — see worker/src/article.ts. */
  body: string | null;
  /** One short attributed quote from the source. */
  source_excerpt: string | null;
  reading_minutes: number | null;
  article_model: string | null;
  updated_at: string | null;

  // --- Added by migration 003. Manual intake and the humanizer queue. ---
  /**
   * Pasted publisher text for a manually keyed-in story. Model input only —
   * never rendered, never in the public API. See schema-003-manual.sql.
   */
  source_text: string | null;
  /** 'sweep' (the daily cron) or 'manual' (keyed in via the dashboard). */
  origin: "sweep" | "manual";
  /** NULL | 'needs-claude' | 'claude-polished' — the /humanizer handover. */
  polish_state: string | null;
  polished_at: string | null;

  // --- Added by migration 004. The hero image Jason attaches by hand. ---
  /**
   * The image, base64. Never in INDEX_COLUMNS or ADMIN_COLUMNS — a list query
   * returning 200 of these would be hundreds of megabytes. Read one at a time
   * through GET /api/news/<slug>/image.
   */
  image_data: string | null;
  image_mime: string | null;
  /** Required whenever image_data is set. See schema-004-images.sql. */
  image_alt: string | null;
  /** Caption under the photo — a photographer or agency. NULL renders none. */
  image_credit: string | null;
  /** The URL it was fetched from, or the filename it was uploaded as. */
  image_source: string | null;
  image_updated_at: string | null;
}
