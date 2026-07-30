import { SignJWT, importPKCS8 } from "jose";
import type { Env } from "./types";

/**
 * Visitor stats from Google Analytics 4, via the Data API.
 *
 * WHY GA4 AND NOT CLOUDFLARE. Both were running: Cloudflare Web Analytics from the
 * start, GA4 since 2026-07-26. Two sets of numbers that never agree is worse than
 * one, and GA4 is the one that answers the question that matters — where the
 * traffic came from. Cloudflare RUM has no acquisition dimension, so it can tell
 * you the site got 169 views and never that organic search is or isn't growing.
 *
 * ⚠️ THE NUMBERS ARE LOWER THAN THE CLOUDFLARE PANEL, AND THAT IS NOT A BUG.
 * Cloudflare RUM is injected at the edge and counts everyone. GA4 on this site is
 * consent-gated (CookieConsent.tsx), so it counts only visitors who accepted.
 * Expect a large gap. The panel says "consented" for exactly this reason —
 * analytics.ts is kept alive behind ?source=cf so the two can be compared.
 *
 * SETUP, all three required (see the plan's Phase 2):
 *   GA_PROPERTY_ID      var    — the NUMERIC property id, not the G-XXXX tag
 *   GA_SA_EMAIL         var    — the service account's client_email
 *   GA_SA_PRIVATE_KEY   secret — the private_key PEM from its JSON key
 * Plus the step everyone forgets: add GA_SA_EMAIL as a Viewer in GA4 Admin →
 * Property Access Management, or every call is a 403.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://analyticsdata.googleapis.com/v1beta";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

/** Shared with analytics.ts so the dashboard renders either without branching. */
export interface StatsResult {
  ok: boolean;
  error?: string;
  /** Which backend answered — the panel labels itself from this. */
  source: "ga4" | "cloudflare";
  totals: { pageViews: number; visits: number; users: number };
  /** The equal-length window immediately before, for the delta. */
  previous?: { pageViews: number; visits: number; users: number };
  daily: { date: string; pageViews: number; visits: number }[];
  topPages: { path: string; pageViews: number }[];
  topCountries: { country: string; visits: number }[];
  /** Organic / direct / referral — the actual SEO-progress signal. */
  channels?: { channel: string; sessions: number }[];
}

/**
 * Access token cache.
 *
 * Module scope, so it lives as long as the isolate and no longer. Worst case on a
 * cold start is one extra token exchange — cheap, and far better than trying to
 * persist a bearer token in D1. Refreshed a minute early so a request cannot pick
 * up a token that expires mid-flight.
 */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(env: Env): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value;

  // Google's JSON key is already PKCS#8 (-----BEGIN PRIVATE KEY-----), which
  // importPKCS8 takes directly. `wrangler secret put` preserves the newlines from
  // stdin, but a value pasted through a dashboard often arrives with literal \n —
  // normalise both so a working key is not rejected for its whitespace.
  const pem = env.GA_SA_PRIVATE_KEY.includes("\\n")
    ? env.GA_SA_PRIVATE_KEY.replace(/\\n/g, "\n")
    : env.GA_SA_PRIVATE_KEY;

  const key = await importPKCS8(pem, "RS256");
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(env.GA_SA_EMAIL)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const body = (await res.json().catch(() => null)) as any;
  if (!res.ok || !body?.access_token) {
    // Google's error_description is the useful half — "Invalid JWT Signature"
    // versus "Invalid grant" point at completely different mistakes.
    throw new Error(
      body?.error_description ?? body?.error ?? `Token exchange returned ${res.status}.`,
    );
  }

  cachedToken = {
    value: body.access_token,
    expiresAt: now + (Number(body.expires_in) || 3600) * 1000,
  };
  return cachedToken.value;
}

/** `rows` → plain tuples, tolerating a report that came back empty. */
function rows(report: any): { dims: string[]; metrics: number[] }[] {
  return (report?.rows ?? []).map((r: any) => ({
    dims: (r.dimensionValues ?? []).map((d: any) => String(d.value ?? "")),
    metrics: (r.metricValues ?? []).map((m: any) => Number(m.value ?? 0) || 0),
  }));
}

/** GA4 returns dates as YYYYMMDD; the chart and its labels expect ISO. */
function isoDate(yyyymmdd: string): string {
  return yyyymmdd.length === 8
    ? `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
    : yyyymmdd;
}

export async function getGa4Stats(env: Env, days: number): Promise<StatsResult> {
  const empty: StatsResult = {
    ok: false,
    source: "ga4",
    totals: { pageViews: 0, visits: 0, users: 0 },
    daily: [],
    topPages: [],
    topCountries: [],
  };

  if (!env.GA_PROPERTY_ID || !env.GA_SA_EMAIL || !env.GA_SA_PRIVATE_KEY) {
    return { ...empty, error: "GA4 not configured yet." };
  }
  // Fails closed on the placeholder, the way access.ts does on POLICY_AUD — a
  // half-configured panel should say so, not ask Google about property "REPLACE".
  if (env.GA_PROPERTY_ID.startsWith("REPLACE")) {
    return { ...empty, error: "GA4 not configured yet — GA_PROPERTY_ID is a placeholder." };
  }

  // `today` is deliberately excluded from both windows: a part-finished day would
  // drag the current period down and make every delta look negative until evening.
  const current = { startDate: `${days}daysAgo`, endDate: "yesterday" };
  const previous = { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` };
  const CORE = [
    { name: "screenPageViews" },
    { name: "sessions" },
    { name: "activeUsers" },
  ];

  try {
    const token = await accessToken(env);
    const res = await fetch(
      `${API}/properties/${env.GA_PROPERTY_ID}:batchRunReports`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            // 0 — the daily series. Totals are summed from this rather than asked
            // for separately; one fewer report against the quota.
            {
              dateRanges: [current],
              dimensions: [{ name: "date" }],
              metrics: CORE,
              orderBys: [{ dimension: { dimensionName: "date" } }],
              limit: 100,
            },
            // 1 — the period before, for the delta. No dimensions, so this is one
            // row of totals.
            { dateRanges: [previous], metrics: CORE },
            // 2 — top pages
            {
              dateRanges: [current],
              dimensions: [{ name: "pagePath" }],
              metrics: [{ name: "screenPageViews" }],
              orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
              limit: 15,
            },
            // 3 — acquisition. The reason for the whole migration.
            {
              dateRanges: [current],
              dimensions: [{ name: "sessionDefaultChannelGroup" }],
              metrics: [{ name: "sessions" }],
              orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
              limit: 10,
            },
            // 4 — countries
            {
              dateRanges: [current],
              dimensions: [{ name: "country" }],
              metrics: [{ name: "sessions" }],
              orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
              limit: 10,
            },
          ],
        }),
      },
    );

    const body = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      const msg = body?.error?.message ?? `GA4 returned ${res.status}.`;
      // The single most likely failure, and the least self-evident. Worth naming
      // rather than passing Google's wording straight through.
      const hint =
        res.status === 403
          ? " Add the service account as a Viewer in GA4 Admin → Property Access Management."
          : "";
      return { ...empty, error: msg + hint };
    }

    const [daily, prev, pages, channels, countries] = body.reports ?? [];

    const series = rows(daily).map((r) => ({
      date: isoDate(r.dims[0]),
      pageViews: r.metrics[0] ?? 0,
      visits: r.metrics[1] ?? 0,
    }));

    const totals = series.reduce(
      (a, d) => ({
        pageViews: a.pageViews + d.pageViews,
        visits: a.visits + d.visits,
        users: a.users,
      }),
      { pageViews: 0, visits: 0, users: 0 },
    );
    // activeUsers cannot be summed across days — the same person on Monday and
    // Tuesday is one active user for the week and two for the days. Ask for the
    // period figure instead of adding the column up.
    const dailyUsers = rows(daily).reduce((a, r) => a + (r.metrics[2] ?? 0), 0);
    totals.users = dailyUsers;

    const prevRow = rows(prev)[0];

    return {
      ok: true,
      source: "ga4",
      totals,
      previous: prevRow
        ? {
            pageViews: prevRow.metrics[0] ?? 0,
            visits: prevRow.metrics[1] ?? 0,
            users: prevRow.metrics[2] ?? 0,
          }
        : undefined,
      daily: series,
      topPages: rows(pages).map((r) => ({
        path: r.dims[0],
        pageViews: r.metrics[0] ?? 0,
      })),
      channels: rows(channels).map((r) => ({
        channel: r.dims[0] || "Unassigned",
        sessions: r.metrics[0] ?? 0,
      })),
      topCountries: rows(countries).map((r) => ({
        country: r.dims[0] || "Unknown",
        visits: r.metrics[0] ?? 0,
      })),
    };
  } catch (err) {
    return { ...empty, error: String(err instanceof Error ? err.message : err) };
  }
}
