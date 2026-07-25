export interface Env {
  DB: D1Database;
  AI: Ai;
  SITE_ORIGIN: string;
  TEAM_DOMAIN: string;
  POLICY_AUD: string;
  CF_ACCOUNT_ID: string;
  WEB_ANALYTICS_SITE_TAG: string;
  SUMMARY_MODEL: string;
  /** Secret — Cloudflare API token with Account Analytics: Read. */
  CF_ANALYTICS_TOKEN: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source_name: string;
  source_url: string;
  published_at: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
}
