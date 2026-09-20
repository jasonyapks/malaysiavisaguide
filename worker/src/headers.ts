/**
 * Response headers for the dashboard and the admin API.
 *
 * WHY THIS IS ITS OWN FILE. The public site's `public/_headers` does not reach
 * here — that is a Pages file and this is a Worker in front of Pages — so until
 * 2026-09-20 the one page on this domain holding a session that can commit to the
 * repo and spend model budget shipped with no CSP, no framing protection and a
 * cacheable body, while the static marketing pages had all three. Putting the
 * policy in a named module rather than inline in the router means it can be read
 * on its own, and checked: `scripts/test-dashboard-csp.mjs` loads the real page
 * in a real browser under exactly these headers and fails on any violation.
 */

/**
 * The dashboard's Content-Security-Policy.
 *
 *   script-src 'nonce-…'  The page has exactly one inline <script> and loads
 *     nothing from anywhere. The nonce is what makes that enforceable: script
 *     injected into the markup — through an article headline, a publisher name, a
 *     filename — does not carry it and does not run. Adding 'unsafe-inline' here
 *     would make browsers ignore the nonce entirely, which is the usual way this
 *     protection is quietly lost.
 *
 *   style-src 'unsafe-inline'  NOT a nonce, deliberately. The markup uses inline
 *     `style="…"` attributes throughout, and only 'unsafe-inline' permits those; a
 *     nonce in this directive makes the browser ignore it and strip every one,
 *     taking the layout with it. The exposure is restyling, not code execution.
 *
 *   img-src  'self' and data: for the page's own furniture, plus the workers.dev
 *     origin, which is where image previews load from — on the custom domain only
 *     /dashboard* and /api/admin/* route to this Worker, so /api/images would fall
 *     through to Pages. See SITE_API in dashboard.ts.
 *
 *   connect-src 'self'  Every fetch the page makes is a relative path.
 *
 *   form-action 'none'  There is no <form> here and there should not be;
 *     everything posts through fetch.
 *
 *   frame-ancestors 'none'  The clickjacking fix that matters on this page: a
 *     framed dashboard is one invisible overlay away from an approve or a delete.
 */
function dashboardCsp(nonce: string, newsApiOrigin: string): string {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${newsApiOrigin}`,
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/**
 * Everything the dashboard document is served with.
 *
 * `no-store` matters more here than it looks: the page renders the current queue,
 * so a cached copy shows a decision that has already been made — and the back
 * button shows it too, with live-looking buttons on it.
 *
 * Referrer-Policy is stricter than the site's own `strict-origin-when-cross-
 * origin`. The queue links out to publishers, and none of them needs to be told
 * that an admin page sent the click.
 */
export function dashboardHeaders(
  nonce: string,
  newsApiOrigin: string,
): Record<string, string> {
  return {
    "content-type": "text/html; charset=utf-8",
    "content-security-policy": dashboardCsp(nonce, newsApiOrigin),
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "cross-origin-opener-policy": "same-origin",
    "cache-control": "no-store, must-revalidate",
    // Belt to the robots meta tag in the markup, and to the Pages _headers rule
    // that covers /admin/ but cannot cover a Worker route.
    "x-robots-tag": "noindex, nofollow",
  };
}
