export interface Env {
  DB: D1Database;
  AI: Ai;
  /** Headless Chrome — the fallback reader in extract.ts. Metered; see wrangler.jsonc. */
  BROWSER: BrowserRun;
  SITE_ORIGIN: string;
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
}
