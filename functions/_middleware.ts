import { buildPrefix, localeByHost, localeOrigin } from "../src/lib/i18n";

/**
 * Host → locale routing for the Pages deployment.
 *
 * ## Why this exists at all
 *
 * The build produces ONE asset tree: English at the root, Chinese under
 * `out/zh-hans/` and `out/zh-hant/`, because that is what the `app/[locale]/`
 * route tree emits. The public URLs are a different shape — one hostname per
 * locale, no prefix. This file is the join. See the header comment in
 * `src/lib/i18n.ts` for the two-models-of-a-URL explanation; it imports
 * `buildPrefix` and `localeOrigin` from there so the mapping cannot drift.
 *
 * It has to live here rather than in Next because `output: "export"` supports
 * no rewrites, redirects or proxy — the static-exports doc lists all three as
 * unsupported. A root `functions/_middleware` runs on every request to the
 * project, static files included, which is exactly the reach needed.
 *
 * ## What it does, in order
 *
 *   1. On the apex, 301 any `/zh-hans/…` or `/zh-hant/…` away to the subdomain
 *      that owns it. Those paths are real files in `out/`, so without this the
 *      Chinese pages are reachable — and therefore indexable — at two URLs.
 *      That is the duplicate-content bug the whole subdomain split was meant to
 *      avoid, and it would be invisible from the Chinese hosts.
 *   2. On a Chinese host, 301 the internal prefix back off if it ever leaks
 *      into a public URL, for the same reason in the other direction.
 *   3. Serve localisable paths from inside that locale's subtree.
 *   4. If the page has not been translated, send the reader to English rather
 *      than to a dead end. This is the runtime twin of `linkPath()` — that
 *      keeps our own links off untranslated Chinese URLs, this catches
 *      everything else: a bookmark, a stale link, a crawler guessing.
 *
 * Unknown hosts — `*.pages.dev` preview builds, `localhost` — fall through
 * untouched, so a preview still exposes the raw tree with the prefixes visible.
 * That is the only way to inspect what was actually built.
 */

type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
  env: { ASSETS: { fetch: (input: Request | string | URL) => Promise<Response> } };
};

/**
 * Countries where analytics must be opt-IN — the EEA, the UK and Switzerland.
 *
 * The EEA is the EU 27 plus Iceland, Liechtenstein and Norway, which adopt the
 * GDPR through the EEA agreement. The UK keeps it as UK GDPR + PECR post-Brexit,
 * and Switzerland's revised FADP is close enough that treating it as strict is
 * the only defensible reading. Everywhere else — Malaysia, Singapore, the Gulf,
 * Australia, the US, Japan — runs on notice-and-opt-out, which is what the rest
 * of this file's machinery switches on.
 *
 * Spelled out rather than using `request.cf.isEUCountry`, which covers the EU
 * only: it would leave Norwegian and British readers silently opted in.
 */
const OPT_IN_COUNTRIES = new Set([
  // EU 27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EEA non-EU
  "IS", "LI", "NO",
  // UK, Switzerland
  "GB", "CH",
]);

type ConsentRegion = "strict" | "open";

/**
 * HTMLRewriter is a Workers runtime global with no ambient declaration here.
 *
 * Hand-rolled for the same reason `PagesContext` above is: adding
 * @cloudflare/workers-types to a Next app's tsconfig drops a second, competing
 * set of `lib.dom` globals — `Response`, `Request`, `fetch` — beside the ones
 * this project already compiles against, and the resulting errors surface in
 * React components that have nothing to do with the edge. Three members are
 * needed; three members are declared.
 */
declare const HTMLRewriter: {
  new (): {
    on(
      selector: string,
      handlers: {
        element(element: {
          prepend(content: string, options?: { html?: boolean }): void;
        }): void;
      },
    ): { transform(response: Response): Response };
  };
};

/**
 * Which consent regime this visitor falls under.
 *
 * Unknown resolves to "strict". Cloudflare reports `XX` when it cannot place an
 * IP and `T1` for Tor exit nodes, and `request.cf` is absent entirely under
 * `wrangler pages dev` — in every one of those cases the visitor might be in
 * Frankfurt, so the answer that cannot be wrong in the expensive direction is
 * the opt-in one.
 */
function consentRegion(request: Request): ConsentRegion {
  // Header first, `request.cf` second. Both are set by Cloudflare and neither is
  // client-controllable — the edge overwrites any inbound CF-IPCountry before a
  // Function sees it, which is what makes trusting the header safe. The order
  // matters for a different reason: `wrangler pages dev` fills `request.cf` with
  // a fixed mock whose country never changes, so reading it first would make
  // every country resolve identically in local testing and this list could only
  // ever be verified in production.
  const country =
    request.headers.get("cf-ipcountry") ??
    (request as Request & { cf?: { country?: string } }).cf?.country ??
    "";
  if (!country || country === "XX" || country === "T1") return "strict";
  return OPT_IN_COUNTRIES.has(country) ? "strict" : "open";
}

/**
 * Stamp the consent regime into the document for the bootstrap script to read.
 *
 * This has to be an edge injection because the site is a static export: every
 * HTML file is built once and served to all nine source markets, so the
 * document itself cannot know where the reader is. The consent default has to
 * be decided BEFORE gtag.js loads — a fetch to `/cdn-cgi/trace` would resolve
 * long after the tag has already fired denied, which is the bug this is fixing.
 *
 * Safe against caching only because Pages Functions responses are never edge
 * cached (`cf-cache-status: DYNAMIC`) and the HTML carries no `Cache-Control`
 * from `public/_headers`. If HTML ever gains a shared-cache lifetime, this line
 * starts serving one country's answer to another country, so add a cache key on
 * country at the same time.
 */
function withConsentRegion(response: Response, request: Request): Response {
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) {
    return response;
  }
  const region = consentRegion(request);
  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.prepend(
          `<script>window.__mvgConsentRegion=${JSON.stringify(region)}</script>`,
          { html: true },
        );
      },
    })
    .transform(response);
}

/**
 * Which paths belong to a locale's subtree.
 *
 * Pages are the easy half: `trailingSlash: true` means every real page ends in
 * `/`. The other half is Next's RSC payloads — `index.txt` and the `__next.*`
 * files sitting beside each `index.html`. Those must be rewritten too, and
 * getting it wrong is worse than a 404: the client router would fetch the
 * ENGLISH payload for the same path, get a 200, and soft-navigate a reader on
 * cn. into English content with the Chinese URL still in the address bar.
 *
 * `sitemap.xml` is per-host too: each Chinese host serves a sitemap of its own
 * URLs, so indexing does not depend on Search Console cross-submission. See the
 * header of `src/lib/sitemap-entries.ts`.
 *
 * Everything else — `/_next/static/*`, `/images/*`, `/og.png`, `/favicon.ico`
 * and `/robots.txt`, which is one shared file naming all three sitemaps — is
 * shared across all three hosts and passes through to the root of the tree,
 * which is where the build puts it.
 */
const PER_HOST_FILES = new Set(["sitemap.xml"]);

function isLocalised(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return false;
  if (pathname.endsWith("/")) return true;
  const segment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return (
    segment === "index.txt" ||
    segment.startsWith("__next.") ||
    PER_HOST_FILES.has(segment)
  );
}

const PREFIXES = Object.values(buildPrefix).filter(Boolean);

function redirect(to: string, status: 301 | 302): Response {
  return new Response(null, { status, headers: { Location: to } });
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const locale = localeByHost[url.hostname];

  // Unknown host (preview deployment, local wrangler): serve the tree as built.
  if (!locale) return withConsentRegion(await next(), request);

  const prefix = buildPrefix[locale];

  // An internal prefix must never be part of a public URL, on any host. On the
  // apex it means "you want the other site"; on a Chinese host it is the same
  // page reachable twice.
  for (const p of PREFIXES) {
    if (url.pathname === p || url.pathname.startsWith(`${p}/`)) {
      const owner = (Object.keys(buildPrefix) as (keyof typeof buildPrefix)[]).find(
        (l) => buildPrefix[l] === p,
      )!;
      const rest = url.pathname.slice(p.length) || "/";
      return redirect(`${localeOrigin[owner]}${rest}${url.search}`, 301);
    }
  }

  // English is already at the root of the tree, and shared assets live there
  // for every locale.
  if (!prefix || !isLocalised(url.pathname)) {
    return withConsentRegion(await next(), request);
  }

  const target = new URL(url);
  target.pathname = `${prefix}${url.pathname}`;
  const response = await env.ASSETS.fetch(new Request(target, request));

  // Not translated yet. 302, not 301: this page becoming Chinese later is the
  // expected outcome, and a cached permanent redirect would outlive it.
  if (response.status === 404) {
    return redirect(`${localeOrigin.en}${url.pathname}${url.search}`, 302);
  }

  return withConsentRegion(response, request);
}
