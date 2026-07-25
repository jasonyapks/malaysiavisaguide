import type { Env, NewsItem } from "./types";
import { requireAccess } from "./access";
import { runNewsSweep, submitUrl } from "./news";
import { getAnalytics } from "./analytics";
import { dashboardHtml } from "./dashboard";

export default {
  // Daily news sweep — fills the pending queue only. Nothing goes public here.
  // Await the sweep so the scheduled invocation stays alive until it finishes.
  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    await runNewsSweep(env);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // --- Public: approved news feed for the site's /news page ---
    if (pathname === "/api/news") {
      if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
      const { results } = await env.DB.prepare(
        `SELECT id, title, summary, category, source_name, source_url, published_at
           FROM news_items WHERE status = 'approved'
           ORDER BY COALESCE(published_at, created_at) DESC LIMIT 60`,
      ).all<NewsItem>();
      return cors(env, json({ items: results ?? [] }));
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
      return html(dashboardHtml(email));
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

    // POST /api/admin/items/:id/(approve|reject|delete)
    const decide = pathname.match(/^\/api\/admin\/items\/([^/]+)\/(approve|reject|delete)$/);
    if (decide && request.method === "POST") {
      const [, id, action] = decide;
      if (action === "delete") {
        await env.DB.prepare("DELETE FROM news_items WHERE id = ?").bind(id).run();
      } else {
        const status = action === "approve" ? "approved" : "rejected";
        await env.DB.prepare(
          "UPDATE news_items SET status = ?, decided_at = datetime('now') WHERE id = ?",
        )
          .bind(status, id)
          .run();
      }
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

function cors(env: Env, res: Response): Response {
  const h = new Headers(res.headers);
  h.set("access-control-allow-origin", env.SITE_ORIGIN);
  h.set("access-control-allow-methods", "GET, OPTIONS");
  h.set("access-control-allow-headers", "content-type");
  h.set("cache-control", "public, max-age=300");
  return new Response(res.body, { status: res.status, headers: h });
}
