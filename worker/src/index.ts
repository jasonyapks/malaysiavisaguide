import type { Env, NewsItem } from "./types";
import { requireAccess } from "./access";
import { runNewsSweep, submitUrl, submitManual, VALID_CATEGORIES } from "./news";
import { generateAndStore } from "./article";
import { humanizeStored } from "./humanize";
import { triggerPublish, getDeployStatus, getBuildLog } from "./publish";
import {
  deleteInsightDoc,
  getInsight,
  getInsightById,
  listInsights,
  listInsightsAdmin,
  saveInsightDoc,
} from "./cms";
import {
  commitAsset,
  deleteAssetBySlot,
  deleteAsset,
  heroForSlot,
  imageBytes,
  imageManifest,
  isVariant,
  listAssets,
  migrateNewsImages,
  proxyImageUrl,
  putVariant,
} from "./assets";
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
 *
 * The `asset_*` values come from the R2 image library, joined on the slot an
 * article's hero occupies. Correlated subqueries rather than a LEFT JOIN because
 * the slot is a computed string and the index on `assets.slot` is unique, so each
 * one is a single index seek.
 *
 * They are here and deliberately NOT in INDEX_COLUMNS: /api/news is read by the
 * deployed site's build and its shape is frozen — that coupling caused the
 * 2026-07-25 outage. Only the private queue sees these.
 *
 * `has_image` accordingly means "there is a picture, in either home" — the
 * migration-004 base64 column or the asset library. That is what the dashboard
 * has always used it for, and it stays true right through the migration.
 */
const ASSET_SLOT = `'news/' || news_items.slug`;
const ADMIN_COLUMNS = `id, title, summary, category, source_name, source_url,
   published_at, status, created_at, decided_at, slug, headline, dek, body,
   source_excerpt, reading_minutes, article_model, updated_at, origin,
   polish_state, polished_at, image_alt, image_credit, image_source,
   image_updated_at,
   (SELECT a.id FROM assets a WHERE a.slot = ${ASSET_SLOT}) AS asset_id,
   (SELECT a.alt FROM assets a WHERE a.slot = ${ASSET_SLOT}) AS asset_alt,
   (SELECT a.credit FROM assets a WHERE a.slot = ${ASSET_SLOT}) AS asset_credit,
   (SELECT a.updated_at FROM assets a WHERE a.slot = ${ASSET_SLOT}) AS asset_updated_at,
   CASE WHEN image_data IS NOT NULL
          OR EXISTS (SELECT 1 FROM assets a WHERE a.slot = ${ASSET_SLOT})
        THEN 1 ELSE 0 END AS has_image`;

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
    const legacyImage = pathname.match(/^\/api\/news\/([a-z0-9-]+)\/image$/);
    if (legacyImage) {
      const row = await env.DB.prepare(
        `SELECT image_data, image_mime FROM news_items
          WHERE slug = ? AND status = 'approved' AND image_data IS NOT NULL`,
      )
        .bind(legacyImage[1])
        .first<{ image_data: string; image_mime: string }>();
      if (row) {
        return new Response(base64ToBytes(row.image_data), {
          headers: {
            "content-type": row.image_mime || "image/jpeg",
            "cache-control": "public, max-age=300",
          },
        });
      }
      // Migrated to R2 — answer from there rather than 404ing. This route is not
      // used by the build any more (pull-images.mjs reads /api/images), but the
      // dashboard's preview and anything else holding the URL still works, and a
      // half-migrated table serves both kinds of row from one address.
      const fromR2 = await heroForSlot(env, `news/${legacyImage[1]}`);
      return fromR2 ?? new Response("No image", { status: 404 });
    }

    // --- Public: the image manifest, and the bytes behind it ---
    //
    // Read once per build by scripts/pull-images.mjs, which downloads each
    // rendition into public/images/cms/ so the exported site serves them
    // same-origin. Public for exactly the reason /api/news is: the build machine
    // has no browser to log in with, and nothing here is not about to be
    // published anyway.
    if (pathname === "/api/images") {
      if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
      return cors(env, json(await imageManifest(env)));
    }

    const imageFile = pathname.match(/^\/api\/images\/([^/]+)\/(orig|hero|og)$/);
    if (imageFile) {
      if (!isVariant(imageFile[2])) return new Response("Not found", { status: 404 });
      return imageBytes(env, imageFile[1], imageFile[2], request.headers);
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

    // --- Public: CMS-authored /insights/ documents, read by the site's build ---
    //
    // Public for the same reason /api/news is: `next build` reads them and has
    // no browser to log in with. Drafts are included on purpose — a draft is
    // reviewed at its real URL, noindex and unlisted, which only works if the
    // build can see it. See worker/src/cms.ts for the contract.
    //
    // ⚠️ These paths need a Bypass policy on the "MVG Dashboard" Access app
    // before a deployed Worker can serve them. Access is scoped to the whole
    // host and today only /api/news is bypassed — /api/images (Phase 3) needs
    // the same. Without it the site build gets a 302 to the login page, reads
    // HTML where it expected JSON, and stops.
    if (pathname === "/api/cms/insights") {
      if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
      return cors(env, json(await listInsights(env)));
    }

    const cmsInsight = pathname.match(
      /^\/api\/cms\/insights\/([a-z0-9-]+)\/([a-z0-9-]+)$/,
    );
    if (cmsInsight) {
      if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
      const item = await getInsight(env, cmsInsight[1], cmsInsight[2]);
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

    // --- The image library ---------------------------------------------------
    //
    // Three requests to add a picture, then a fourth to make it real:
    //
    //   PUT  /api/admin/assets/:id/orig   raw bytes, content-type header
    //   PUT  /api/admin/assets/:id/hero   1440×810 webp, cropped in the browser
    //   PUT  /api/admin/assets/:id/og     1200×630 jpeg, same
    //   POST /api/admin/assets/:id        { slot, alt, credit, source, … }
    //
    // Raw bytes rather than a base64 field, because base64 adds a third to every
    // payload and the old path paid it twice. The commit is last and separate so
    // an interrupted upload leaves orphaned objects and no row, never a row whose
    // bytes are missing. See assets.ts.

    // --- Admin: authoring /insights/ documents (Phase 5) ---
    //
    // Addressed by id, not by path, unlike the public read routes above. The
    // path is editable — correcting a slug before first publish is an ordinary
    // edit — and a key that moves takes the row being edited with it.
    //
    // Every write runs validateInsightDoc first. That is the reason this exists
    // rather than a wrangler d1 execute: a document that cannot render must be
    // refused against the thing just typed, not discovered in a red Pages build
    // that names no article.
    if (pathname === "/api/admin/insights" && request.method === "GET") {
      return json(await listInsightsAdmin(env));
    }

    // The figure catalogue, proxied rather than fetched by the browser.
    //
    // public/figures.json is a Pages asset on the site's origin, and the
    // dashboard is served from two different hosts (the custom domain and
    // workers.dev). Fetching it client-side would be same-origin on one and a
    // CORS failure on the other, and Pages sends no CORS headers. Server-side
    // there is no origin to be wrong about. See scripts/emit-figures.mjs for
    // why this is a build artifact and can be one deploy stale.
    if (pathname === "/api/admin/figures" && request.method === "GET") {
      const res = await fetch(`${env.SITE_ORIGIN}/figures.json`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) {
        return json({ error: `figures.json — status ${res.status}` }, 502);
      }
      return json(await res.json());
    }

    if (pathname === "/api/admin/insights" && request.method === "POST") {
      const doc = await request.json().catch(() => null);
      if (doc === null) return json({ ok: false, error: "Bad JSON" }, 400);
      const outcome = await saveInsightDoc(env, doc, null);
      return json(outcome, outcome.ok ? 201 : outcome.status);
    }

    const cmsAdmin = pathname.match(/^\/api\/admin\/insights\/([^/]+)$/);
    if (cmsAdmin) {
      const [, id] = cmsAdmin;

      if (request.method === "GET") {
        const item = await getInsightById(env, id);
        if (!item) return json({ ok: false, error: "Not found" }, 404);
        return json({ item });
      }

      if (request.method === "PUT") {
        const doc = await request.json().catch(() => null);
        if (doc === null) return json({ ok: false, error: "Bad JSON" }, 400);
        const outcome = await saveInsightDoc(env, doc, id);
        return json(outcome, outcome.ok ? 200 : outcome.status);
      }

      if (request.method === "DELETE") {
        const gone = await deleteInsightDoc(env, id);
        return json({ ok: gone }, gone ? 200 : 404);
      }
    }

    if (pathname === "/api/admin/assets" && request.method === "GET") {
      return json(await listAssets(env));
    }

    // One-shot, and safe to run twice — see migrateNewsImages.
    if (pathname === "/api/admin/assets/migrate-news" && request.method === "POST") {
      return migrateNewsImages(env);
    }

    const assetVariant = pathname.match(/^\/api\/admin\/assets\/([^/]+)\/([a-z]+)$/);
    if (assetVariant && request.method === "PUT") {
      const [, id, variant] = assetVariant;
      if (!isVariant(variant)) {
        return json({ ok: false, error: `Unknown rendition "${variant}".` }, 400);
      }
      return putVariant(env, id, variant, request);
    }

    const asset = pathname.match(/^\/api\/admin\/assets\/([^/]+)$/);
    if (asset && request.method === "POST") return commitAsset(env, asset[1], request);
    if (asset && request.method === "DELETE") return deleteAsset(env, asset[1]);

    // DELETE /api/admin/items/:id/image — take the picture off the article.
    //
    // There is no PUT here any more. Attaching an image is
    // PUT /api/admin/assets/:id/<rendition> plus a commit, with the slot set to
    // `news/<slug>` — one library, one crop, one place the bytes live. This route
    // remains because "remove" has to clear BOTH homes: the R2 asset for the slot
    // and the migration-004 columns, which are still populated on any row that
    // has not been migrated yet.
    const image = pathname.match(/^\/api\/admin\/items\/([^/]+)\/image$/);
    if (image && request.method === "DELETE") {
      const [, id] = image;
      const row = await env.DB.prepare(`SELECT slug FROM news_items WHERE id = ?`)
        .bind(id)
        .first<{ slug: string | null }>();
      if (row?.slug) await deleteAssetBySlot(env, `news/${row.slug}`);
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

    // GET /api/admin/fetch-image?url=… — bytes for a URL the browser cannot read
    // itself. See proxyImageUrl; the crop still happens in the browser.
    if (pathname === "/api/admin/fetch-image" && request.method === "GET") {
      return proxyImageUrl(env, url.searchParams.get("url"));
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

    // No analytics here, deliberately. This Worker edits and publishes content;
    // traffic is read in Cloudflare Web Analytics and Google Analytics directly.
    // Collection on the site is untouched — only the second-hand panel is gone,
    // and with it the need for this Worker to hold an analytics credential.

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
