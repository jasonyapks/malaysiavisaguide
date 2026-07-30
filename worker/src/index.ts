import type { Env, NewsItem } from "./types";
import { requireAccess } from "./access";
import { runNewsSweep, submitUrl, submitManual, VALID_CATEGORIES } from "./news";
import { generateAndStore } from "./article";
import { humanizeStored } from "./humanize";
import { getAnalytics } from "./analytics";
import { getGa4Stats } from "./ga4";
import { triggerPublish, getDeployStatus, getBuildLog } from "./publish";
import { dashboardHtml } from "./dashboard";

/**
 * Columns the public site needs for the /news index. `body` is deliberately
 * absent — the index renders 40 cards and none of them need the full article,
 * which would multiply the payload by an order of magnitude.
 */
const INDEX_COLUMNS = `id, slug, headline, title, dek, summary, category,
   source_name, source_url, published_at, reading_minutes, updated_at,
   image_alt, image_credit, image_updated_at,
   CASE WHEN image_data IS NOT NULL THEN 1 ELSE 0 END AS has_image`;

/**
 * Columns the dashboard's queue lists need — everything except `source_text`.
 *
 * Excluded on size and on principle. On size: a pasted story is up to 12,000
 * characters and a list returns 200 rows. On principle: the pasted text is model
 * input, and the fewer places it travels to the easier that stays true. The
 * editor doesn't show it and nothing in the dashboard renders it.
 */
const ADMIN_COLUMNS = `id, title, summary, category, source_name, source_url,
   published_at, status, created_at, decided_at, slug, headline, dek, body,
   source_excerpt, reading_minutes, article_model, updated_at, origin,
   polish_state, polished_at, image_alt, image_credit, image_source,
   image_updated_at,
   CASE WHEN image_data IS NOT NULL THEN 1 ELSE 0 END AS has_image`;

export default {
  // Daily news sweep — fills the pending queue only. Nothing goes public here.
  // Await the sweep so the scheduled invocation stays alive until it finishes.
  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    await runNewsSweep(env);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // --- Public: the article index, consumed by the site's build ---
    // `slug IS NOT NULL` is the real publish gate. An item can be approved and
    // still have no article (the source was unreadable), and such a row has no
    // page to link to — serving it would put a dead link on the index.
    if (pathname === "/api/news") {
      if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
      const { results } = await env.DB.prepare(
        `SELECT ${INDEX_COLUMNS}
           FROM news_items
          WHERE status = 'approved' AND slug IS NOT NULL
          ORDER BY COALESCE(published_at, created_at) DESC LIMIT 200`,
      ).all<NewsItem>();
      return cors(env, json({ items: results ?? [] }));
    }

    // --- Public: an article's attached image, as bytes ---
    //
    // Public because the build machine reads it, and it has no browser to log in
    // with; /api/news is the one Access bypass on this host. Nothing is exposed
    // that is not about to be published on the site anyway. Cached hard: the
    // bytes for a given slug only change when Jason replaces the picture, and
    // the build asks for each one exactly once.
    const imageBytes = pathname.match(/^\/api\/news\/([a-z0-9-]+)\/image$/);
    if (imageBytes) {
      const row = await env.DB.prepare(
        `SELECT image_data, image_mime FROM news_items
          WHERE slug = ? AND status = 'approved' AND image_data IS NOT NULL`,
      )
        .bind(imageBytes[1])
        .first<{ image_data: string; image_mime: string }>();
      if (!row) return new Response("No image", { status: 404 });
      return new Response(base64ToBytes(row.image_data), {
        headers: {
          "content-type": row.image_mime || "image/jpeg",
          "cache-control": "public, max-age=300",
        },
      });
    }

    // --- Public: one full article by slug ---
    const article = pathname.match(/^\/api\/news\/([a-z0-9-]+)$/);
    if (article) {
      if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
      const item = await env.DB.prepare(
        `SELECT ${INDEX_COLUMNS}, body, source_excerpt, article_model
           FROM news_items
          WHERE slug = ? AND status = 'approved'`,
      )
        .bind(article[1])
        .first<NewsItem>();
      if (!item) return cors(env, json({ error: "Not found" }, 404));
      return cors(env, json({ item }));
    }

    // --- Everything below is admin: gated by Cloudflare Access + JWT verify ---
    const isAdmin =
      pathname === "/" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/api/admin/");
    if (!isAdmin) return new Response("Not found", { status: 404 });

    const email = await requireAccess(request, env);
    if (!email) {
      // Access should have blocked this already; this is defense-in-depth.
      return new Response("Forbidden — dashboard is private.", { status: 403 });
    }

    if (pathname === "/" || pathname === "/dashboard") {
      return html(dashboardHtml(email, env.SITE_ORIGIN, env.NEWS_API_ORIGIN));
    }

    // GET /api/admin/items?status=pending|approved|rejected
    // GET /api/admin/items?polish=needed — the /humanizer queue, cutting across
    // status: an item needing the real skill is usually already approved.
    if (pathname === "/api/admin/items" && request.method === "GET") {
      if (url.searchParams.get("polish") === "needed") {
        const { results } = await env.DB.prepare(
          `SELECT ${ADMIN_COLUMNS} FROM news_items WHERE polish_state = 'needs-claude'
            ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 200`,
        ).all<NewsItem>();
        return json({ items: results ?? [] });
      }
      const status = url.searchParams.get("status") ?? "pending";
      const { results } = await env.DB.prepare(
        `SELECT ${ADMIN_COLUMNS} FROM news_items WHERE status = ? ORDER BY created_at DESC LIMIT 200`,
      )
        .bind(status)
        .all<NewsItem>();
      return json({ items: results ?? [] });
    }

    // POST /api/admin/items/:id/(approve|reject|delete|regenerate)
    const decide = pathname.match(
      /^\/api\/admin\/items\/([^/]+)\/(approve|reject|delete|regenerate|humanize)$/,
    );
    if (decide && request.method === "POST") {
      const [, id, action] = decide;

      if (action === "delete") {
        await env.DB.prepare("DELETE FROM news_items WHERE id = ?").bind(id).run();
        return json({ ok: true });
      }

      if (action === "reject") {
        await env.DB.prepare(
          "UPDATE news_items SET status = 'rejected', decided_at = datetime('now') WHERE id = ?",
        )
          .bind(id)
          .run();
        return json({ ok: true });
      }

      // Approving is what commissions the article — see article.ts for why the
      // expensive write happens here and not during the sweep. Slow by nature:
      // a source fetch plus one large-model call, so expect 20–60 seconds.
      // Prose only — no source fetch, no rewrite of the reporting. This is for
      // an article that is already right and already live, and just reads like a
      // machine wrote it.
      if (action === "humanize") {
        const result = await humanizeStored(env, id);
        return json(result, result.ok ? 200 : 422);
      }

      if (action === "regenerate") {
        const result = await generateAndStore(env, id);
        return json(result, result.ok ? 200 : 422);
      }

      const result = await generateAndStore(env, id);
      if (!result.ok) {
        // Left pending on purpose. The item is still a real story worth a
        // second attempt or a manual write-up; marking it approved with no
        // article would put it in a state the index has to filter out forever.
        return json(result, 422);
      }
      await env.DB.prepare(
        "UPDATE news_items SET status = 'approved', decided_at = datetime('now') WHERE id = ?",
      )
        .bind(id)
        .run();
      return json({ ok: true, slug: result.slug });
    }

    // PATCH /api/admin/items/:id — Jason's manual corrections.
    // The generated draft is a draft. He is the domain authority, and the
    // editorial policy page promises a human reviewed the page, so editing has
    // to be possible without a redeploy.
    const edit = pathname.match(/^\/api\/admin\/items\/([^/]+)$/);
    if (edit && request.method === "PATCH") {
      const [, id] = edit;
      const patch = (await request.json().catch(() => null)) as {
        headline?: string;
        dek?: string;
        body?: unknown;
        source_excerpt?: string | null;
        polish_state?: string | null;
      } | null;
      if (!patch) return json({ ok: false, error: "Bad JSON" }, 400);

      if (
        patch.polish_state !== undefined &&
        patch.polish_state !== null &&
        !["needs-claude", "claude-polished"].includes(patch.polish_state)
      ) {
        return json({ ok: false, error: "polish_state must be needs-claude, claude-polished or null" }, 400);
      }

      // Validate the body shape here rather than at render time — a bad edit
      // must fail in the dashboard, where it can be fixed, not on a live page.
      let bodyJson: string | null = null;
      if (patch.body !== undefined) {
        if (!isArticleBody(patch.body)) {
          return json({ ok: false, error: "body must be {keyPoints[], sections[{heading,paragraphs[]}], whatItMeans[]}" }, 400);
        }
        bodyJson = JSON.stringify(patch.body);
      }

      // COALESCE leaves an omitted field alone. source_excerpt and polish_state
      // need the flag instead, because null is a legitimate value for both —
      // "drop the quote" and "don't touch the quote" are different edits, and so
      // are "clear the polish flag" and "leave it be".
      const polishing = patch.polish_state !== undefined;
      await env.DB.prepare(
        `UPDATE news_items
            SET headline       = COALESCE(?, headline),
                dek            = COALESCE(?, dek),
                body           = COALESCE(?, body),
                source_excerpt = CASE WHEN ? = 1 THEN ? ELSE source_excerpt END,
                polish_state   = CASE WHEN ? = 1 THEN ? ELSE polish_state END,
                polished_at    = CASE WHEN ? = 1 THEN datetime('now') ELSE polished_at END,
                updated_at     = datetime('now')
          WHERE id = ?`,
      )
        .bind(
          patch.headline ?? null,
          patch.dek ?? null,
          bodyJson,
          patch.source_excerpt !== undefined ? 1 : 0,
          patch.source_excerpt ?? null,
          polishing ? 1 : 0,
          patch.polish_state ?? null,
          // Stamp the polish time only when the skill says it has run, not when
          // the flag is merely being cleared.
          patch.polish_state === "claude-polished" ? 1 : 0,
          id,
        )
        .run();
      return json({ ok: true });
    }

    // PUT /api/admin/items/:id/image — attach the hero image.
    //
    // Two ways in, because the picture is sometimes already on the web and
    // sometimes on Jason's desk: `{ url }` has the Worker fetch it, `{ data }`
    // carries a base64 file the dashboard has already downscaled in the browser.
    // Either way it lands in the same three columns, and the build machine reads
    // it back through the public /image route.
    //
    // Alt text is required. A hero image with no alt fails WCAG 1.1.1 on every
    // article page it appears on, and this is the only moment anybody knows what
    // the picture shows — asking later means never.
    const image = pathname.match(/^\/api\/admin\/items\/([^/]+)\/image$/);
    if (image && (request.method === "PUT" || request.method === "DELETE")) {
      const [, id] = image;

      if (request.method === "DELETE") {
        await env.DB.prepare(
          `UPDATE news_items
              SET image_data = NULL, image_mime = NULL, image_alt = NULL,
                  image_credit = NULL, image_source = NULL,
                  image_updated_at = datetime('now')
            WHERE id = ?`,
        )
          .bind(id)
          .run();
        return json({ ok: true });
      }

      const patch = (await request.json().catch(() => null)) as {
        url?: string;
        data?: string;
        mime?: string;
        alt?: string;
        credit?: string | null;
        source?: string;
      } | null;
      if (!patch) return json({ ok: false, error: "Bad JSON" }, 400);

      const alt = (patch.alt ?? "").trim();
      if (alt.length < 5) {
        return json({ ok: false, error: "Alt text is required — describe what the picture shows." }, 400);
      }

      let data = patch.data ?? null;
      let mime = patch.mime ?? null;
      let source = patch.source ?? null;

      if (!data && patch.url) {
        const fetched = await fetchImage(patch.url);
        if (!fetched.ok) return json({ ok: false, error: fetched.error }, 422);
        data = fetched.data;
        mime = fetched.mime;
        source = patch.url;
      }
      if (!data) return json({ ok: false, error: "Need a file or a URL." }, 400);
      if (data.length > MAX_IMAGE_B64) {
        return json(
          {
            ok: false,
            error:
              "That image is too big to store. Save it and use the file picker — " +
              "the dashboard shrinks an upload before sending it.",
          },
          413,
        );
      }

      await env.DB.prepare(
        `UPDATE news_items
            SET image_data = ?, image_mime = ?, image_alt = ?, image_credit = ?,
                image_source = ?, image_updated_at = datetime('now')
          WHERE id = ?`,
      )
        .bind(data, mime ?? "image/jpeg", alt, patch.credit?.trim() || null, source, id)
        .run();
      return json({ ok: true });
    }

    // POST /api/admin/submit  { url }  — manual add of a pasted article
    if (pathname === "/api/admin/submit" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as { url?: string };
      if (!body.url) return json({ ok: false, error: "Missing url" }, 400);
      try {
        const added = await submitUrl(env, body.url);
        return json({ ok: added, error: added ? undefined : "Already have it, or could not summarise." });
      } catch (err) {
        return json({ ok: false, error: String(err) }, 500);
      }
    }

    // POST /api/admin/manual — Jason keys the story in himself.
    //
    // Insert only; it does NOT write the article. The dashboard chains this into
    // the ordinary approve call, so a manual story travels the same road to a
    // page as a swept one, and two short requests replace one that would sit
    // open for ninety seconds at the mercy of every proxy in between.
    if (pathname === "/api/admin/manual" && request.method === "POST") {
      const body = (await request.json().catch(() => null)) as Parameters<
        typeof submitManual
      >[1] | null;
      if (!body) return json({ ok: false, error: "Bad JSON" }, 400);
      try {
        const result = await submitManual(env, body);
        return json(result, result.ok ? 200 : 400);
      } catch (err) {
        return json({ ok: false, error: String(err) }, 500);
      }
    }

    // GET /api/admin/categories — the category list, so the dashboard's select
    // cannot drift out of step with what the writer will actually accept.
    if (pathname === "/api/admin/categories" && request.method === "GET") {
      return json({ categories: [...VALID_CATEGORIES] });
    }

    // POST /api/admin/write-next  { skip: string[] } — backfill one article.
    //
    // One per call, not all seven: each is a source fetch plus a large-model
    // call, and a single request that sat for five minutes would be at the mercy
    // of every proxy between here and the browser. The dashboard calls this in a
    // loop and shows progress, so a failure part-way through costs one item
    // rather than the batch.
    //
    // `skip` carries the ids that already failed this run. Keeping that on the
    // client makes the endpoint stateless and stops a permanently unreadable
    // source — a paywall that will still be a paywall tomorrow — from being
    // picked forever.
    if (pathname === "/api/admin/write-next" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as { skip?: string[] };
      const skip = Array.isArray(body.skip) ? body.skip.slice(0, 500) : [];

      const holes = skip.length ? skip.map(() => "?").join(",") : "''";
      const next = await env.DB.prepare(
        `SELECT id, title FROM news_items
          WHERE status = 'approved' AND slug IS NULL AND id NOT IN (${holes})
          ORDER BY COALESCE(published_at, created_at) DESC LIMIT 1`,
      )
        .bind(...skip)
        .first<{ id: string; title: string }>();

      if (!next) return json({ ok: true, done: true, remaining: 0 });

      const remaining = await env.DB.prepare(
        `SELECT COUNT(*) AS n FROM news_items
          WHERE status = 'approved' AND slug IS NULL AND id NOT IN (${holes})`,
      )
        .bind(...skip)
        .first<{ n: number }>();

      const result = await generateAndStore(env, next.id);
      return json({
        ok: result.ok,
        done: false,
        id: next.id,
        title: next.title,
        slug: result.ok ? result.slug : undefined,
        error: result.ok ? undefined : result.error,
        remaining: remaining?.n ?? 0,
      });
    }

    // POST /api/admin/refresh — run a news sweep now
    if (pathname === "/api/admin/refresh" && request.method === "POST") {
      const added = await runNewsSweep(env);
      return json({ ok: true, added });
    }

    // GET /api/admin/stats?days=7[&source=cf]
    //
    // GA4 is the source of truth — it is the one that can say where the traffic
    // came from. Cloudflare RUM is kept for two reasons: it answers while GA4 is
    // still being wired up, and `?source=cf` lets the two be compared, because
    // GA4 is consent-gated and its numbers are materially lower. Delete
    // analytics.ts once that comparison has been made.
    if (pathname === "/api/admin/stats" && request.method === "GET") {
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days")) || 7));
      const wantCf = url.searchParams.get("source") === "cf";

      if (!wantCf) {
        const ga = await getGa4Stats(env, days);
        // Only fall back when GA4 is not set up. A configured GA4 that errors
        // must surface its error — silently swapping in different numbers would
        // hide a broken credential behind plausible-looking traffic.
        if (ga.ok || !ga.error?.startsWith("GA4 not configured")) return json(ga);
      }

      const cf = await getAnalytics(env, days);
      return json({
        ...cf,
        source: "cloudflare",
        totals: { ...cf.totals, users: 0 },
      });
    }

    // POST /api/admin/publish — build and deploy the site.
    //
    // This is the step that makes an approved article visible. Everything else
    // in this dashboard writes to D1; a reader sees none of it until a build
    // runs. Refuses while a build is already in flight — see publish.ts.
    if (pathname === "/api/admin/publish" && request.method === "POST") {
      const result = await triggerPublish(env);
      return json(result, result.ok ? 200 : 422);
    }

    // GET /api/admin/deployments — how the current build is doing.
    if (pathname === "/api/admin/deployments" && request.method === "GET") {
      return json(await getDeployStatus(env));
    }

    // GET /api/admin/deployments/:id/log — the tail of a failed build.
    const buildLog = pathname.match(/^\/api\/admin\/deployments\/([^/]+)\/log$/);
    if (buildLog && request.method === "GET") {
      return json(await getBuildLog(env, buildLog[1]));
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * The cap on a stored image, in base64 characters — about 900 KB of file.
 *
 * Set by D1, not by taste: the limit is 2,000,000 bytes for a string AND for the
 * whole row, and this row also holds the article body and up to 12,000
 * characters of pasted source text. 1.2 MB of base64 leaves that comfortably
 * clear. The dashboard downscales an upload to 1800px wide before sending, which
 * lands a normal press photo at a third of this; the cap is really for the URL
 * path, where nothing has resized anything.
 *
 * Note the separate 100 KB limit on SQL *statement text* — irrelevant here
 * because the image travels as a bound parameter, but it is what makes
 * `wrangler d1 execute` refuse the same insert from the command line.
 */
const MAX_IMAGE_B64 = 1_200_000;

/**
 * Fetch an image someone pasted the URL of.
 *
 * Deliberately strict about what comes back. A URL that 404s to an HTML error
 * page, or points at a page rather than a file, would otherwise be stored as a
 * perfectly valid row whose bytes are not an image — and the failure would
 * surface days later as a broken picture on a live article.
 */
async function fetchImage(
  url: string,
): Promise<{ ok: true; data: string; mime: string } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        // Some publishers refuse a bare fetch. This is the same courtesy
        // extract.ts extends when reading a source page.
        "user-agent":
          "Mozilla/5.0 (compatible; MalaysiaVisaGuide/1.0; +https://malaysiavisaguide.com)",
        accept: "image/*",
      },
      redirect: "follow",
    });
  } catch (err) {
    return { ok: false, error: `Could not reach that URL — ${String(err)}` };
  }
  if (!res.ok) return { ok: false, error: `That URL returned ${res.status}.` };

  const mime = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!mime.startsWith("image/")) {
    return {
      ok: false,
      error: `That URL is ${mime || "not an image"} — link straight to the image file, not the page it sits on.`,
    };
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength === 0) return { ok: false, error: "That URL returned an empty file." };
  return { ok: true, data: bytesToBase64(bytes), mime };
}

/**
 * Base64 in a Worker, in chunks.
 *
 * `String.fromCharCode(...bytes)` on a megabyte of image blows the call stack —
 * the spread becomes a million arguments. 8KB at a time is well inside every
 * engine's limit and costs nothing measurable.
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function html(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** Shape guard for an edited article body arriving from the dashboard. */
function isArticleBody(v: unknown): boolean {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const b = v as Record<string, unknown>;
  const strings = (x: unknown) => Array.isArray(x) && x.every((s) => typeof s === "string");
  if (!strings(b.keyPoints) || !strings(b.whatItMeans)) return false;
  if (!Array.isArray(b.sections) || b.sections.length === 0) return false;
  return b.sections.every((s) => {
    if (!s || typeof s !== "object") return false;
    const sec = s as Record<string, unknown>;
    return typeof sec.heading === "string" && strings(sec.paragraphs);
  });
}

function cors(env: Env, res: Response): Response {
  const h = new Headers(res.headers);
  h.set("access-control-allow-origin", env.SITE_ORIGIN);
  h.set("access-control-allow-methods", "GET, OPTIONS");
  h.set("access-control-allow-headers", "content-type");
  h.set("cache-control", "public, max-age=300");
  return new Response(res.body, { status: res.status, headers: h });
}
