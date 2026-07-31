import type { Asset, Env } from "./types";

/**
 * Images: R2 for the bytes, D1 for everything you might want to ask about them.
 *
 * THE SHAPE OF AN UPLOAD. The browser mints a UUID, derives three renditions
 * from the file the user picked, PUTs each one as raw bytes, then POSTs the
 * metadata. Four requests where one would do, for two reasons that both matter:
 *
 *   1. Raw bytes, never base64. Base64 inflates a payload by a third, and the
 *      old path paid that tax twice — once into D1 and once back out to the
 *      build machine. A `PUT` with the file as the body pays it zero times.
 *   2. The metadata write is last and is the only thing that makes the asset
 *      real. An upload interrupted half way leaves R2 objects nobody references
 *      and no row — the harmless direction. The other order would put a row in
 *      the manifest whose bytes 404 on the build machine.
 *
 * WHY THE DERIVATIVES ARE NOT MADE HERE. A Worker has no canvas and no image
 * decoder. The two alternatives are shelling out to Cloudflare Images (a paid
 * product, for something the browser already does) or shipping a wasm codec into
 * a 1MB Worker. The browser that has the file open has a GPU-backed canvas and
 * is idle. `derive()` in dashboard.ts is where the crop lives, and it reproduces
 * sharp's `fit:"cover"` exactly so the output is the same as what CI used to make.
 *
 * WHAT THE WORKER STILL ENFORCES. Alt text, because a client-side check is a
 * suggestion. And the variant names, because the R2 key is built from them.
 */

/** The three renditions. Anything else is a 400 — these are R2 key prefixes. */
export const VARIANTS = ["orig", "hero", "og"] as const;
export type Variant = (typeof VARIANTS)[number];

/**
 * The hero renders at most 720 CSS pixels wide, so 1440 covers a 2× display
 * exactly. The OG card is the size every social platform asks for. Both are
 * centre-cropped to their aspect ratio. These numbers are duplicated in
 * dashboard.ts, which is where the cropping actually happens; they live here too
 * because this is the file that documents what a `hero_key` promises.
 */
export const HERO = { width: 1440, height: 810 };
export const OG = { width: 1200, height: 630 };

/**
 * A ceiling on a single uploaded object, in bytes.
 *
 * Nothing like D1's limit — R2 would take five gigabytes without noticing. This
 * is about the Worker: the body is buffered to measure it, and 20MB of camera
 * RAW would be memory spent on bytes the crop is about to discard anyway. The
 * browser sends a downscaled original, so this only ever catches a mistake.
 */
const MAX_OBJECT_BYTES = 12 * 1024 * 1024;

/** A UUID, and nothing else. This value becomes an R2 key. */
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * A slot, or null.
 *
 * Deliberately narrow: it is written into a JSON key on the site and into a file
 * name under public/images/cms/, so a slot containing `..` or a space would be a
 * path-traversal question rather than a typo.
 */
const SLOT_RE = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/;

export function isVariant(v: string): v is Variant {
  return (VARIANTS as readonly string[]).includes(v);
}

/** The R2 key for one rendition. The only place keys are composed. */
export function assetKey(id: string, variant: Variant, ext: string): string {
  return `${variant}/${id}.${ext}`;
}

/** File extension for an original, from its mime type. */
export function extForMime(mime: string): string {
  const known: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  return known[mime.toLowerCase()] ?? "bin";
}

// ---------------------------------------------------------------------------
// Public — read by the site's build machine, which has no browser to log in with

/**
 * One manifest entry, as `scripts/pull-images.mjs` consumes it.
 *
 * `key` is what the site's article-images.json is keyed by. An asset with a slot
 * uses the slot; one without — a figure inside an article, referenced by id —
 * uses `asset/<id>`, so the same registry can serve both without the build
 * script needing to know which is which.
 *
 * `stamp` is `updated_at`, and it is the whole reason a rebuild does not
 * re-download every picture. It changes when the bytes change AND when only the
 * alt or the credit changes, because editing a caption is a real edit that never
 * touches a pixel.
 */
export interface ManifestEntry {
  key: string;
  id: string;
  hero: string;
  og: string | null;
  alt: string;
  credit: string | null;
  width: number | null;
  height: number | null;
  stamp: string;
}

/**
 * Every asset, as URLs the build machine can fetch.
 *
 * Ordered by key so the JSON the site writes is stable — an unordered manifest
 * would make every build look like it had changed something.
 */
export async function imageManifest(env: Env): Promise<{ images: ManifestEntry[] }> {
  const { results } = await env.DB.prepare(
    `SELECT id, slot, hero_key, og_key, alt, credit, width, height, updated_at
       FROM assets ORDER BY COALESCE(slot, id) LIMIT 1000`,
  ).all<Asset>();

  const images = (results ?? []).map((a) => ({
    key: a.slot ?? `asset/${a.id}`,
    id: a.id,
    hero: `/api/images/${a.id}/hero`,
    og: a.og_key ? `/api/images/${a.id}/og` : null,
    alt: a.alt,
    credit: a.credit ?? null,
    width: a.width ?? null,
    height: a.height ?? null,
    stamp: a.updated_at,
  }));
  return { images };
}

/**
 * The bytes of one rendition.
 *
 * Public for the same reason `/api/news/:slug/image` is: the build machine reads
 * it and cannot authenticate. Nothing is exposed that is not about to be
 * published on the site anyway.
 *
 * Conditional on ETag. R2 hands back a strong etag per object, a caller sends it
 * as `if-none-match` on the next run, and an unchanged photo costs a 304 instead
 * of a megabyte. The `stamp` check in pull-images.mjs usually short-circuits
 * before this, but a fresh CI clone has no registry to compare against and this
 * is what keeps that case cheap.
 *
 * The whole `Headers` object goes to `onlyIf`, not a plucked string. R2 parses
 * the conditional headers itself, and it is strict: handed an `if-none-match`
 * value with the quotes RFC 9110 requires on it, the binding throws
 * "Conditional ETag should not be wrapped in quotes" and the request 500s. Ask
 * it to do the parsing and that whole class of mistake belongs to someone else.
 */
export async function imageBytes(
  env: Env,
  id: string,
  variant: Variant,
  conditional: Headers | null,
): Promise<Response> {
  if (!ID_RE.test(id)) return new Response("Not found", { status: 404 });

  const row = await env.DB.prepare(
    `SELECT hero_key, og_key, orig_key, mime FROM assets WHERE id = ?`,
  )
    .bind(id)
    .first<Pick<Asset, "hero_key" | "og_key" | "orig_key" | "mime">>();
  if (!row) return new Response("Not found", { status: 404 });

  const key =
    variant === "hero" ? row.hero_key : variant === "og" ? row.og_key : row.orig_key;
  if (!key) return new Response("No such rendition", { status: 404 });

  const object = await env.ASSETS.get(key, {
    onlyIf: conditional ?? undefined,
  });
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  // The bytes under a given key never change — a replaced picture is a new
  // upload under a new id — so this can be cached hard. The manifest, which is
  // not cached, is what tells the build a new id exists.
  headers.set("cache-control", "public, max-age=31536000, immutable");

  // `onlyIf` failing means the caller already has these bytes: R2 returns a
  // bodyless R2Object rather than null, which is exactly a 304.
  const body = (object as R2ObjectBody).body;
  if (!body) return new Response(null, { status: 304, headers });
  headers.set(
    "content-type",
    headers.get("content-type") ??
      (variant === "hero" ? "image/webp" : variant === "og" ? "image/jpeg" : row.mime),
  );
  return new Response(body, { headers });
}

/**
 * The hero bytes for a slot, or null.
 *
 * Only used by the compatibility shim on `/api/news/:slug/image` — see index.ts.
 */
export async function heroForSlot(env: Env, slot: string): Promise<Response | null> {
  const row = await env.DB.prepare(`SELECT id FROM assets WHERE slot = ?`)
    .bind(slot)
    .first<{ id: string }>();
  if (!row) return null;
  return imageBytes(env, row.id, "hero", null);
}

// ---------------------------------------------------------------------------
// Admin

/**
 * Fetch an image the user pasted the URL of, and hand the bytes back to the
 * browser that asked.
 *
 * A proxy rather than a store, and that is the point. The browser cannot fetch a
 * publisher's photo itself — cross-origin, no CORS header, `createImageBitmap`
 * on a tainted response is not allowed — so without this the URL path would have
 * to store whatever the Worker downloaded, uncropped, and there would be two
 * different ways an image gets its dimensions. This way there is one crop, in
 * `derive()`, and a pasted URL and a picked file arrive at R2 identically.
 *
 * Deliberately strict about what comes back, exactly as the endpoint it replaces
 * was: a URL that 404s to an HTML error page, or points at an article rather
 * than a file, would otherwise reach `createImageBitmap` as a decode error with
 * nothing useful to say.
 */
export async function proxyImageUrl(env: Env, raw: string | null): Promise<Response> {
  if (!raw) return json({ ok: false, error: "Missing url." }, 400);
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return json({ ok: false, error: "That is not a URL." }, 400);
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return json({ ok: false, error: "Only http(s) URLs." }, 400);
  }

  let res: Response;
  try {
    res = await fetch(target.toString(), {
      headers: {
        // Some publishers refuse a bare fetch. The same courtesy extract.ts
        // extends when reading a source page.
        "user-agent":
          "Mozilla/5.0 (compatible; MalaysiaVisaGuide/1.0; +https://malaysiavisaguide.com)",
        accept: "image/*",
      },
      redirect: "follow",
    });
  } catch (err) {
    return json({ ok: false, error: `Could not reach that URL — ${String(err)}` }, 422);
  }
  if (!res.ok) return json({ ok: false, error: `That URL returned ${res.status}.` }, 422);

  const mime = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!mime.startsWith("image/")) {
    return json(
      {
        ok: false,
        error: `That URL is ${mime || "not an image"} — link straight to the image file, not the page it sits on.`,
      },
      422,
    );
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength === 0) return json({ ok: false, error: "That URL returned an empty file." }, 422);
  if (bytes.byteLength > MAX_OBJECT_BYTES) {
    return json({ ok: false, error: "That image is too big — 12MB is the ceiling." }, 413);
  }
  return new Response(bytes, { headers: { "content-type": mime, "cache-control": "no-store" } });
}

/** Drop whatever asset currently fills a slot. Used when an image is removed. */
export async function deleteAssetBySlot(env: Env, slot: string): Promise<boolean> {
  const row = await env.DB.prepare(`SELECT id FROM assets WHERE slot = ?`)
    .bind(slot)
    .first<{ id: string }>();
  if (!row) return false;
  await deleteAsset(env, row.id);
  return true;
}

/** Everything in the library, newest first, for the dashboard's Images panel. */
export async function listAssets(env: Env): Promise<{ assets: Asset[] }> {
  const { results } = await env.DB.prepare(
    `SELECT id, slot, hero_key, og_key, orig_key, mime, width, height, alt,
            credit, source, created_at, updated_at
       FROM assets ORDER BY updated_at DESC LIMIT 500`,
  ).all<Asset>();
  return { assets: results ?? [] };
}

/**
 * Store one rendition's raw bytes.
 *
 * `PUT /api/admin/assets/:id/:variant`, body = the file, metadata in headers.
 * Nothing is written to D1 here: until the commit lands this is an anonymous
 * object in a bucket, and a manifest built from D1 cannot see it.
 */
export async function putVariant(
  env: Env,
  id: string,
  variant: Variant,
  request: Request,
): Promise<Response> {
  if (!ID_RE.test(id)) return json({ ok: false, error: "Bad asset id." }, 400);

  const mime = (request.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!mime.startsWith("image/")) {
    return json({ ok: false, error: `content-type must be an image, got "${mime}".` }, 415);
  }

  // Buffered rather than streamed, only so the size can be enforced before the
  // write rather than discovered after it.
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength === 0) return json({ ok: false, error: "Empty body." }, 400);
  if (bytes.byteLength > MAX_OBJECT_BYTES) {
    return json({ ok: false, error: "That file is too big — 12MB is the ceiling." }, 413);
  }

  // The extension is fixed for the derivatives and follows the mime for the
  // original, so the key the commit will record is computable from here alone.
  const ext = variant === "hero" ? "webp" : variant === "og" ? "jpg" : extForMime(mime);
  const key = assetKey(id, variant, ext);

  await env.ASSETS.put(key, bytes, {
    httpMetadata: { contentType: mime, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { assetId: id, variant },
  });
  return json({ ok: true, key, bytes: bytes.byteLength });
}

/**
 * Make an upload real: write the row that the manifest is built from.
 *
 * `POST /api/admin/assets/:id`. Upsert on the primary key, so re-committing the
 * same id after replacing its bytes is an edit rather than a duplicate — which
 * is what "change the alt text" and "re-crop it" both look like from here.
 *
 * The slot collision is handled rather than raised: taking a slot from another
 * asset is the normal way to replace a page's picture, and a UNIQUE constraint
 * error would surface to Jason as "D1_ERROR: UNIQUE constraint failed".
 */
export async function commitAsset(env: Env, id: string, request: Request): Promise<Response> {
  if (!ID_RE.test(id)) return json({ ok: false, error: "Bad asset id." }, 400);

  const body = (await request.json().catch(() => null)) as {
    slot?: string | null;
    alt?: string;
    credit?: string | null;
    source?: string | null;
    mime?: string;
    width?: number;
    height?: number;
    hasOg?: boolean;
  } | null;
  if (!body) return json({ ok: false, error: "Bad JSON" }, 400);

  // The same guard the old image endpoint has carried since migration 004, and
  // for the same reason: this is the only moment anybody knows what the picture
  // shows. Client-side validation is a courtesy; this is the rule.
  const alt = (body.alt ?? "").trim();
  if (alt.length < 5) {
    return json({ ok: false, error: "Alt text is required — describe what the picture shows." }, 400);
  }

  const slot = (body.slot ?? "").trim() || null;
  if (slot && !SLOT_RE.test(slot)) {
    return json(
      { ok: false, error: `"${slot}" is not a valid slot — lowercase words separated by / or -.` },
      400,
    );
  }

  // An existing row, if this is a re-commit rather than a new upload.
  const prior = await env.DB.prepare(
    `SELECT hero_key, og_key, orig_key, mime, width, height FROM assets WHERE id = ?`,
  )
    .bind(id)
    .first<Pick<Asset, "hero_key" | "og_key" | "orig_key" | "mime" | "width" | "height">>();

  // Two different calls arrive here and they must not be treated the same.
  //
  // A fresh upload sends `mime` (derive() always does) and its bytes are already
  // in the bucket under keys computable from it. A CAPTION EDIT sends only the
  // slot, the alt and the credit — no bytes moved, and recomputing the keys from
  // a defaulted mime would rewrite a webp original's `orig_key` to `.jpg` and
  // point the row at an object that does not exist. Worse for the rows migration
  // 005 moved out of D1, whose hero is not a webp at all.
  //
  // So: bytes were sent iff `mime` was. Otherwise every key, and the dimensions,
  // are carried over untouched.
  const rebinding = body.mime !== undefined || !prior;

  const mime = rebinding ? (body.mime ?? "image/jpeg").toLowerCase() : prior.mime;
  const heroKey = rebinding ? assetKey(id, "hero", "webp") : prior.hero_key;
  const ogKey = rebinding
    ? body.hasOg === false
      ? null
      : assetKey(id, "og", "jpg")
    : prior.og_key;
  const origKey = rebinding ? assetKey(id, "orig", extForMime(mime)) : prior.orig_key;
  const width = rebinding ? (body.width ?? null) : prior.width;
  const height = rebinding ? (body.height ?? null) : prior.height;

  // The rendition the manifest promises must actually be in the bucket. Without
  // this the failure surfaces days later as a 404 on the build machine, soft-
  // failed, and a picture quietly missing from the site.
  const head = await env.ASSETS.head(heroKey);
  if (!head) {
    return json({ ok: false, error: "The hero rendition was never uploaded — retry the upload." }, 409);
  }

  // Free the slot first. Two statements rather than ON CONFLICT(slot) because
  // the row being displaced keeps its bytes and its alt text and simply stops
  // being canonical — it stays in the library, which is what an editor expects
  // when they swap a photo.
  if (slot) {
    await env.DB.prepare(`UPDATE assets SET slot = NULL, updated_at = datetime('now')
                           WHERE slot = ? AND id <> ?`)
      .bind(slot, id)
      .run();
  }

  await env.DB.prepare(
    `INSERT INTO assets (id, slot, hero_key, og_key, orig_key, mime, width, height,
                         alt, credit, source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
          slot = excluded.slot, hero_key = excluded.hero_key,
          og_key = excluded.og_key, orig_key = excluded.orig_key,
          mime = excluded.mime, width = excluded.width, height = excluded.height,
          alt = excluded.alt, credit = excluded.credit, source = excluded.source,
          updated_at = datetime('now')`,
  )
    .bind(
      id,
      slot,
      heroKey,
      ogKey,
      origKey,
      mime,
      width,
      height,
      alt,
      (body.credit ?? "")?.toString().trim() || null,
      (body.source ?? "")?.toString().trim() || null,
    )
    .run();

  return json({ ok: true, id, slot });
}

/**
 * Delete an asset — row and bytes.
 *
 * Row first. A row pointing at objects that are gone renders a broken image on
 * the site; objects with no row are invisible and cost a fraction of a cent.
 */
export async function deleteAsset(env: Env, id: string): Promise<Response> {
  if (!ID_RE.test(id)) return json({ ok: false, error: "Bad asset id." }, 400);
  const row = await env.DB.prepare(
    `SELECT hero_key, og_key, orig_key FROM assets WHERE id = ?`,
  )
    .bind(id)
    .first<Pick<Asset, "hero_key" | "og_key" | "orig_key">>();
  if (!row) return json({ ok: false, error: "No such asset." }, 404);

  await env.DB.prepare(`DELETE FROM assets WHERE id = ?`).bind(id).run();
  const keys = [row.hero_key, row.og_key, row.orig_key].filter((k): k is string => !!k);
  if (keys.length) await env.ASSETS.delete(keys);
  return json({ ok: true });
}

/**
 * One-shot: move the base64 heroes out of `news_items` and into R2.
 *
 * `POST /api/admin/assets/migrate-news`. It runs in the Worker rather than in a
 * script because both bindings are here — the bytes go D1 → R2 without crossing
 * the wire once, where a script would have to pull a megabyte of base64 out
 * through `wrangler d1 execute` and push it back.
 *
 * NO RE-CROP. There is no image decoder in a Worker, so the stored bytes become
 * the hero as they are. That is correct for what is actually in the column: the
 * dashboard has always downscaled an upload before sending it, and the CI resize
 * this replaces was cropping the same bytes. The result is a hero at the
 * upload's own aspect ratio rather than 16:9, and re-uploading the picture
 * through the dashboard fixes it properly. With one row in the table, that is
 * the right trade against writing a wasm decoder.
 *
 * Idempotent — a row whose slot is already taken is skipped, and `image_data` is
 * cleared only after the R2 write has resolved.
 */
export async function migrateNewsImages(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT id, slug, image_data, image_mime, image_alt, image_credit, image_source,
            image_updated_at
       FROM news_items
      WHERE image_data IS NOT NULL AND slug IS NOT NULL`,
  ).all<{
    id: string;
    slug: string;
    image_data: string;
    image_mime: string | null;
    image_alt: string | null;
    image_credit: string | null;
    image_source: string | null;
    image_updated_at: string | null;
  }>();

  const moved: string[] = [];
  const skipped: { slug: string; why: string }[] = [];

  for (const row of results ?? []) {
    const slot = `news/${row.slug}`;
    const alt = (row.image_alt ?? "").trim();
    if (alt.length < 5) {
      // Alt has been required since migration 004, so this should be empty. If it
      // is not, the row predates that rule and needs a human — inventing alt text
      // for a photograph nobody has looked at is worse than leaving it.
      skipped.push({ slug: row.slug, why: "no alt text — re-attach it in the dashboard" });
      continue;
    }
    const existing = await env.DB.prepare(`SELECT id FROM assets WHERE slot = ?`)
      .bind(slot)
      .first<{ id: string }>();
    if (existing) {
      skipped.push({ slug: row.slug, why: "already migrated" });
      continue;
    }

    const mime = row.image_mime || "image/jpeg";
    const bytes = base64ToBytes(row.image_data);
    const id = crypto.randomUUID();
    const ext = extForMime(mime);
    const origKey = assetKey(id, "orig", ext);
    // Same bytes under both keys rather than a copy: R2 charges for storage, and
    // 200KB twice for a picture that is about to be replaced properly is silly.
    // `hero_key` must still end .webp-or-whatever the bytes are, so it does not
    // reuse assetKey's webp assumption.
    const heroKey = `hero/${id}.${ext}`;

    await env.ASSETS.put(origKey, bytes, {
      httpMetadata: { contentType: mime },
      customMetadata: { assetId: id, variant: "orig", migratedFrom: "news_items.image_data" },
    });
    await env.ASSETS.put(heroKey, bytes, {
      httpMetadata: { contentType: mime },
      customMetadata: { assetId: id, variant: "hero", migratedFrom: "news_items.image_data" },
    });

    await env.DB.prepare(
      `INSERT INTO assets (id, slot, hero_key, og_key, orig_key, mime, alt, credit,
                           source, created_at, updated_at)
            VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        slot,
        heroKey,
        origKey,
        mime,
        alt,
        row.image_credit,
        row.image_source,
        row.image_updated_at ?? new Date().toISOString().slice(0, 19).replace("T", " "),
        row.image_updated_at ?? new Date().toISOString().slice(0, 19).replace("T", " "),
      )
      .run();

    // Only now is the base64 safe to drop. `image_alt`, `image_credit` and
    // `image_updated_at` STAY: they are in INDEX_COLUMNS, which /api/news
    // returns, and the site's build reads that response. Emptying them would be
    // a shape-preserving change that still broke something.
    await env.DB.prepare(
      `UPDATE news_items SET image_data = NULL, image_mime = NULL WHERE id = ?`,
    )
      .bind(row.id)
      .run();

    moved.push(slot);
  }

  return json({ ok: true, moved, skipped });
}

// ---------------------------------------------------------------------------

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
