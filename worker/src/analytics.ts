import type { Env } from "./types";

/**
 * Visitor stats for the dashboard, from Cloudflare Web Analytics via the
 * GraphQL Analytics API. Web Analytics is cookieless and privacy-preserving,
 * which keeps the site's "no tracking pixels selling your attention" promise
 * honest. Requires an API token with Account Analytics: Read (CF_ANALYTICS_TOKEN).
 *
 * Dataset: rumPageloadEventsAdaptiveGroups. `count` = page views, `sum.visits`
 * = visits. All sub-queries are wrapped so a schema hiccup degrades gracefully
 * rather than breaking the dashboard.
 */

const ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

export interface AnalyticsResult {
  ok: boolean;
  error?: string;
  totals: { pageViews: number; visits: number };
  daily: { date: string; pageViews: number; visits: number }[];
  topPages: { path: string; pageViews: number }[];
  topCountries: { country: string; visits: number }[];
}

export async function getAnalytics(env: Env, days: number): Promise<AnalyticsResult> {
  const empty: AnalyticsResult = {
    ok: false,
    totals: { pageViews: 0, visits: 0 },
    daily: [],
    topPages: [],
    topCountries: [],
  };

  if (!env.CF_ANALYTICS_TOKEN || !env.WEB_ANALYTICS_SITE_TAG) {
    return { ...empty, error: "Analytics not configured yet." };
  }

  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const startS = start.toISOString();
  const endS = end.toISOString();

  const query = `
    query Stats($accountTag: string!, $siteTag: string!, $start: Time!, $end: Time!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          daily: rumPageloadEventsAdaptiveGroups(
            limit: 1000
            filter: { siteTag: $siteTag, datetime_geq: $start, datetime_leq: $end }
            orderBy: [date_ASC]
          ) {
            count
            sum { visits }
            dimensions { date }
          }
          pages: rumPageloadEventsAdaptiveGroups(
            limit: 15
            filter: { siteTag: $siteTag, datetime_geq: $start, datetime_leq: $end }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { requestPath }
          }
          countries: rumPageloadEventsAdaptiveGroups(
            limit: 10
            filter: { siteTag: $siteTag, datetime_geq: $start, datetime_leq: $end }
            orderBy: [sum_visits_DESC]
          ) {
            sum { visits }
            dimensions { countryName }
          }
        }
      }
    }`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          accountTag: env.CF_ACCOUNT_ID,
          siteTag: env.WEB_ANALYTICS_SITE_TAG,
          start: startS,
          end: endS,
        },
      }),
    });

    const json = (await res.json()) as {
      data?: { viewer?: { accounts?: AccountBlock[] } };
      errors?: { message: string }[];
    };

    if (json.errors?.length) {
      return { ...empty, error: json.errors.map((e) => e.message).join("; ") };
    }

    const acct = json.data?.viewer?.accounts?.[0];
    if (!acct) return { ...empty, error: "No data returned." };

    const daily = (acct.daily ?? []).map((d) => ({
      date: d.dimensions.date,
      pageViews: d.count,
      visits: d.sum?.visits ?? 0,
    }));
    const totals = daily.reduce(
      (a, d) => ({
        pageViews: a.pageViews + d.pageViews,
        visits: a.visits + d.visits,
      }),
      { pageViews: 0, visits: 0 },
    );
    const topPages = (acct.pages ?? []).map((p) => ({
      path: p.dimensions.requestPath ?? "/",
      pageViews: p.count,
    }));
    const topCountries = (acct.countries ?? []).map((c) => ({
      country: c.dimensions.countryName ?? "Unknown",
      visits: c.sum?.visits ?? 0,
    }));

    return { ok: true, totals, daily, topPages, topCountries };
  } catch (err) {
    return { ...empty, error: String(err) };
  }
}

interface AccountBlock {
  daily?: { count: number; sum?: { visits?: number }; dimensions: { date: string } }[];
  pages?: { count: number; dimensions: { requestPath?: string } }[];
  countries?: { sum?: { visits?: number }; dimensions: { countryName?: string } }[];
}
