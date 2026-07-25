import type { Env, NewsItem } from "./types";
import { requireAccess } from "./access";
import { runNewsSweep, submitUrl } from "./news";
import { generateAndStore } from "./article";
import { getAnalytics } from "./analytics";
import { dashboardHtml } from "./dashboard";

/**
 * Columns the public site needs for the /news index. `body` is deliberately
 * absent — the index renders 40 cards and none of them need the full article,
 * which would multiply the payload by an order of magnitude.
 */
const INDEX_COLUMNS = `id, slug, headline, title, dek, summary, category,
   source_name, source_url, published_at, reading_minutes, updated_at`;

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
      return html(dashboardHtml(email, env.SITE_ORIGIN));
    }

    // GET /api/admin/items?status=pending|approved|rejected
    if (pathname === "/api/admin/items" && request.method === "GET") {
      const status = url.searchParams.get("status") ?? "pending";
      const { results } = await env.DB.prepare(
        `SELECT * FROM news_items WHERE status = ? ORDER BY created_at DESC LIMIT 200`,
      )
        .bind(status)
        .all<NewsItem>();
      return json({ items: results ?? [] });
    }

    // POST /api/admin/items/:id/(approve|reject|delete|regenerate)
    const decide = pathname.match(
      /^\/api\/admin\/items\/([^/]+)\/(approve|reject|delete|regenerate)$/,
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
      } | null;
      if (!patch) return json({ ok: false, error: "Bad JSON" }, 400);

      // Validate the body shape here rather than at render time — a bad edit
      // must fail in the dashboard, where it can be fixed, not on a live page.
      let bodyJson: string | null = null;
      if (patch.body !== undefined) {
        if (!isArticleBody(patch.body)) {
          return json({ ok: false, error: "body must be {keyPoints[], sections[{heading,paragraphs[]}], whatItMeans[]}" }, 400);
        }
        bodyJson = JSON.stringify(patch.body);
      }

      // COALESCE leaves an omitted field alone. source_excerpt needs the flag
      // instead, because null is a legitimate value for it — "drop the quote"
      // and "don't touch the quote" are different edits.
      await env.DB.prepare(
        `UPDATE news_items
            SET headline       = COALESCE(?, headline),
                dek            = COALESCE(?, dek),
                body           = COALESCE(?, body),
                source_excerpt = CASE WHEN ? = 1 THEN ? ELSE source_excerpt END,
                updated_at     = datetime('now')
          WHERE id = ?`,
      )
        .bind(
          patch.headline ?? null,
          patch.dek ?? null,
          bodyJson,
          patch.source_excerpt !== undefined ? 1 : 0,
          patch.source_excerpt ?? null,
          id,
        )
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

    // GET /api/admin/stats?days=7
    if (pathname === "/api/admin/stats" && request.method === "GET") {
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days")) || 7));
      const stats = await getAnalytics(env, days);
      return json(stats);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

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
