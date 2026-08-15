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
 * Which paths belong to a locale's subtree.
 *
 * Pages are the easy half: `trailingSlash: true` means every real page ends in
 * `/`. The other half is Next's RSC payloads — `index.txt` and the `__next.*`
 * files sitting beside each `index.html`. Those must be rewritten too, and
 * getting it wrong is worse than a 404: the client router would fetch the
 * ENGLISH payload for the same path, get a 200, and soft-navigate a reader on
 * cn. into English content with the Chinese URL still in the address bar.
 *
 * Everything else — `/_next/static/*`, `/images/*`, `/og.png`, `/favicon.ico`,
 * `/robots.txt`, `/sitemap.xml` — is shared across all three hosts and passes
 * through to the root of the tree, which is where the build puts it.
 */
function isLocalised(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return false;
  if (pathname.endsWith("/")) return true;
  const segment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return segment === "index.txt" || segment.startsWith("__next.");
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
  if (!locale) return next();

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
  if (!prefix || !isLocalised(url.pathname)) return next();

  const target = new URL(url);
  target.pathname = `${prefix}${url.pathname}`;
  const response = await env.ASSETS.fetch(new Request(target, request));

  // Not translated yet. 302, not 301: this page becoming Chinese later is the
  // expected outcome, and a cached permanent redirect would outlive it.
  if (response.status === 404) {
    return redirect(`${localeOrigin.en}${url.pathname}${url.search}`, 302);
  }

  return response;
}
