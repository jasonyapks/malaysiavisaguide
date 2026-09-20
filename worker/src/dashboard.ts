import { INSIGHT_CATEGORIES } from "../../shared/blocks";
import { HERO as HERO_SPEC, OG as OG_SPEC } from "./assets";
import { INSIGHT_IMAGES_JS } from "./insight-images";

/**
 * The private dashboard, served only to Jason (behind Cloudflare Access).
 * Self-contained HTML + vanilla JS — it talks to the same Worker's /api/admin
 * routes, whose requests carry the Access cookie automatically. No framework and
 * no external requests, which is what makes a strict CSP possible.
 *
 * As of 2026-09-20 that CSP is actually sent (`html()` in index.ts), rather than
 * being a property the page merely had. Two consequences for anyone editing this
 * file, both enforced by `npm run test:dashboard`:
 *
 *   — the single inline <script> runs because it carries the nonce. There must
 *     stay exactly one, and any second one needs the nonce too.
 *   — no `onclick=` or other inline handler attributes. They are refused by
 *     `script-src 'nonce-…'`, silently, leaving a button that looks fine and does
 *     nothing. Every listener here is attached with addEventListener, mostly
 *     delegated from a container because the rows are rebuilt on each render.
 *
 * Inline `style="…"` attributes are fine — style-src keeps 'unsafe-inline'
 * precisely so they are, and index.ts explains why a nonce there would break
 * them.
 */
export function dashboardHtml(
  email: string,
  siteOrigin: string,
  newsApiOrigin: string,
  /**
   * CSP nonce for the one inline <script>, minted per response in index.ts.
   * Without it on the tag the script does not run and the page is inert — which
   * is the intended behaviour for anything injected into this markup, and would
   * be an obvious, immediate failure for the page itself rather than a quiet one.
   */
  nonce: string,
): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Content — Malaysia Visa Guide</title>
<style>
  :root {
    --forest-900:#14342b; --forest-700:#1f5c43; --forest-600:#2a7a58;
    --sand-50:#faf8f2; --sand-100:#f3efe4; --sand-200:#e6dfcd; --sand-400:#c9bfa3;
    --ink:#1b1b18; --ink-muted:#5b5a52; --amber:#b45309; --red:#b91c1c;
  }
  * { box-sizing:border-box; }
  body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    color:var(--ink); background:var(--sand-50); line-height:1.5; }
  a { color:var(--forest-700); }

  /* ---- The bar that stays put ----
     Four stacked panels ran to about five screens, so the state of the queue and
     the way to the panel you wanted were both only reachable by scrolling. This
     sticks: counts on the left, jumps on the right, everything above the fold at
     every scroll position. */
  header.top { position:sticky; top:0; z-index:20;
    background:var(--forest-900); color:var(--sand-50); padding:12px 24px 0;
    box-shadow:0 1px 0 rgba(0,0,0,.18); }
  header.top .line1 { display:flex; align-items:baseline; justify-content:space-between;
    flex-wrap:wrap; gap:8px; }
  header.top h1 { font-size:1.1rem; margin:0; font-weight:700; }
  header.top .who { font-size:.85rem; color:var(--sand-200); }

  /* Counts. Tabular numerals so a changing figure does not shift the row. */
  .stats { display:flex; gap:18px; flex-wrap:wrap; margin:10px 0 0;
    font-size:.82rem; color:var(--sand-200); }
  .stats .stat { display:flex; align-items:baseline; gap:6px; }
  .stats .stat b { color:#fff; font-weight:700; font-variant-numeric:tabular-nums; }
  /* Red is reserved, here as everywhere on this page, for the site being wrong
     right now — an approved article whose commit failed. Nothing else earns it. */
  .stats .stat.bad b, .stats .stat.bad { color:#fca5a5; }
  .stats .stat.bad b { font-weight:800; }

  /* Jump links. Plain anchors — the sections have had ids all along. */
  nav.panels { display:flex; gap:4px; flex-wrap:wrap; margin-top:10px; }
  nav.panels a { color:var(--sand-200); text-decoration:none; font-size:.82rem;
    padding:7px 12px; border-radius:8px 8px 0 0; border:1px solid transparent;
    border-bottom:none; }
  nav.panels a:hover { background:rgba(255,255,255,.08); color:#fff; }
  nav.panels a.here { background:var(--sand-50); color:var(--forest-900); font-weight:600; }

  /* scroll-margin so an anchor jump does not tuck the heading under the bar. */
  main { max-width:960px; margin:0 auto; padding:24px; }
  section { background:#fff; border:1px solid var(--sand-200); border-radius:14px;
    padding:20px; margin-bottom:24px; scroll-margin-top:140px; }
  h2 { font-size:1.05rem; margin:0 0 14px; }

  /* ---- Toasts ----
     What replaced alert(). A modal dialog blocks the page, loses whatever is
     underneath it, and on a form the size of the manual-intake one it is the
     difference between reading the error and retyping the story. These stack,
     fade, and never take the page away. */
  #toasts { position:fixed; right:18px; bottom:18px; z-index:60;
    display:flex; flex-direction:column; gap:8px; max-width:min(420px,calc(100vw - 36px)); }
  .toast { padding:11px 14px; border-radius:10px; font-size:.87rem;
    box-shadow:0 6px 20px rgba(0,0,0,.16); border:1px solid;
    animation:toastin .16s ease-out; }
  .toast.info { background:#fff; border-color:var(--sand-400); color:var(--ink); }
  .toast.good { background:#f0fdf4; border-color:#86efac; color:#14532d; }
  .toast.bad  { background:#fef2f2; border-color:#fca5a5; color:#991b1b; }
  .toast button.x { float:right; margin:-2px -6px 0 10px; padding:0 6px;
    background:none; border:none; color:inherit; opacity:.55; font-size:1rem; }
  .toast button.x:hover { opacity:1; }
  @keyframes toastin { from { opacity:0; transform:translateY(6px); } }
  @media (prefers-reduced-motion:reduce) { .toast { animation:none; } }
  .row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  table { width:100%; border-collapse:collapse; font-size:.9rem; }
  td { padding:6px 4px; border-bottom:1px solid var(--sand-100); }
  td.num { text-align:right; font-variant-numeric:tabular-nums; color:var(--ink-muted); }
  .tabs { display:flex; gap:6px; margin-bottom:14px; }
  .tab { padding:6px 14px; border-radius:999px; border:1px solid var(--sand-200);
    background:#fff; cursor:pointer; font-size:.85rem; }
  .tab.active { background:var(--forest-900); color:var(--sand-50); border-color:var(--forest-900); }
  .item { border:1px solid var(--sand-200); border-radius:12px; padding:14px; margin-bottom:12px; }
  .item .cat { display:inline-block; font-size:.7rem; text-transform:uppercase; letter-spacing:.05em;
    background:var(--sand-100); color:var(--forest-700); padding:2px 8px; border-radius:999px; }
  .item h3 { font-size:1rem; margin:8px 0 4px; }
  .item p { margin:6px 0; color:var(--ink); }
  .item .meta { font-size:.8rem; color:var(--ink-muted); }
  button { font:inherit; cursor:pointer; border-radius:8px; padding:7px 14px; border:1px solid transparent; }
  button.approve { background:var(--forest-600); color:#fff; }
  button.reject { background:#fff; color:var(--amber); border-color:var(--sand-400); }
  button.delete { background:#fff; color:var(--red); border-color:var(--sand-400); }
  button.ghost { background:var(--sand-100); color:var(--ink); }
  input[type=url]{ flex:1; min-width:200px; padding:8px 10px; border:1px solid var(--sand-400);
    border-radius:8px; font:inherit; }
  select { padding:6px 10px; border:1px solid var(--sand-400); border-radius:8px; font:inherit; }
  /* Manual intake. Folded away by default — it is the exception, used when the
     pipeline could not read a source, not the everyday path. */
  details.manual { border:1px solid var(--sand-200); border-radius:12px;
    padding:0 14px; margin:0 0 16px; background:var(--sand-50); }
  details.manual > summary { cursor:pointer; padding:12px 0; font-size:.9rem;
    color:var(--forest-700); font-weight:600; list-style:none; }
  details.manual > summary::-webkit-details-marker { display:none; }
  details.manual > summary::before { content:"＋ "; }
  details.manual[open] > summary::before { content:"− "; }
  details.manual .fields { display:grid; grid-template-columns:1fr 1fr; gap:12px 14px;
    padding-bottom:16px; }
  details.manual .wide { grid-column:1 / -1; }
  @media (max-width:640px){ details.manual .fields{ grid-template-columns:1fr; } }
  details.manual label { display:block; font-size:.75rem; text-transform:uppercase;
    letter-spacing:.06em; color:var(--ink-muted); margin-bottom:4px; }
  details.manual input, details.manual textarea, details.manual select {
    width:100%; padding:8px 10px; font:inherit; border:1px solid var(--sand-400);
    border-radius:8px; background:#fff; }
  details.manual textarea { resize:vertical; }
  .chip { display:inline-block; font-size:.7rem; text-transform:uppercase; letter-spacing:.05em;
    padding:2px 8px; border-radius:999px; margin-left:6px; }
  .chip.manual { background:#eef2ff; color:#3730a3; }
  .chip.polish { background:#fff7ed; color:#9a3412; }
  .muted { color:var(--ink-muted); font-size:.85rem; }
  .empty { color:var(--ink-muted); padding:16px 0; }
  /* Article review + edit. The generated draft is the thing Jason actually
     signs off on, so it gets real room rather than a tooltip. */
  .draft { margin-top:12px; border-top:1px dashed var(--sand-400); padding-top:12px; }
  .draft h4 { margin:14px 0 6px; font-size:.78rem; text-transform:uppercase;
    letter-spacing:.06em; color:var(--ink-muted); }
  .draft .dek { font-size:1rem; color:var(--forest-900); font-weight:600; }
  .draft ul { margin:6px 0; padding-left:20px; }
  .draft li { margin:3px 0; }
  .draft .sec { margin:10px 0; }
  .draft .sec strong { display:block; margin-bottom:2px; }
  .draft blockquote { margin:8px 0; padding:8px 12px; border-left:3px solid var(--sand-400);
    background:var(--sand-100); font-style:italic; color:var(--ink-muted); }
  .draft label { display:block; font-size:.75rem; text-transform:uppercase;
    letter-spacing:.06em; color:var(--ink-muted); margin:12px 0 4px; }
  .draft input[type=text], .draft textarea { width:100%; padding:8px 10px; font:inherit;
    border:1px solid var(--sand-400); border-radius:8px; background:#fff; }
  .draft textarea { resize:vertical; }
  .draft input[type=url], .draft input[type=file] { width:100%; padding:8px 10px; font:inherit;
    border:1px solid var(--sand-400); border-radius:8px; background:#fff; }
  .imgbox { margin-top:14px; padding:12px; border:1px solid var(--sand-400);
    border-radius:10px; background:var(--sand-100); }
  .imgbox h4 { margin:0; font-size:.8rem; text-transform:uppercase;
    letter-spacing:.06em; color:var(--ink-muted); }
  .imgbox img { display:block; width:100%; max-width:420px; aspect-ratio:16/9;
    object-fit:cover; border-radius:8px; margin:10px 0; background:var(--sand-400); }
  .imgbox .or { font-size:.75rem; color:var(--ink-muted); margin:8px 0 4px; }
  /* The insight panel's own labels. The rule on .draft label covers the news
     editor's copy of this form, but the insights one is a bare .imgbox and was
     inheriting nothing — so its labels ran inline with the inputs and the alt
     text prompt wrapped around the end of the URL field. */
  .imgbox label { display:block; font-size:.75rem; text-transform:uppercase;
    letter-spacing:.06em; color:var(--ink-muted); margin:12px 0 4px; }
  .imgbox input[type=text], .imgbox input[type=url], .imgbox input[type=file],
  .imgbox select { width:100%; padding:8px 10px; font:inherit;
    border:1px solid var(--sand-400); border-radius:8px; background:#fff; }
  .imgbox .row select, .imgbox .row input[type=text] { width:auto; flex:1 1 180px; }
  .warn { background:#fff7ed; border:1px solid #fdba74; color:#9a3412;
    padding:10px 12px; border-radius:8px; font-size:.85rem; margin-top:10px; }
  .live { font-size:.8rem; }
  .spin { color:var(--ink-muted); font-size:.85rem; }
  /* The stranded-article bar and per-item state. Red is reserved for a genuine
     failure — an approved article that never reached the repo. Retired is grey:
     absent on purpose, not broken. */
  .alertbar { background:#fef2f2; border:1px solid var(--red); color:#7f1d1d;
    padding:12px 14px; border-radius:10px; margin-bottom:14px; font-size:.9rem;
    font-weight:600; }
  .notlive { font-size:.8rem; color:#b91c1c; font-weight:600; }
  .retired { font-size:.8rem; color:var(--ink-muted); }
  /* Publish panel. The dot carries the state at a glance; the words carry the
     detail. Colour alone would fail anyone who cannot tell amber from green. */
  .deploy { display:flex; align-items:center; gap:9px; margin-top:12px;
    font-size:.9rem; }
  .deploy .dot { width:9px; height:9px; border-radius:50%; flex:none;
    background:var(--ink-muted); }
  .deploy.running .dot { background:var(--amber); animation:pulse 1.1s infinite; }
  .deploy.success .dot { background:var(--forest-600); }
  .deploy.failure .dot { background:var(--red); }
  @keyframes pulse { 50% { opacity:.25; } }
  .deploy-log { margin-top:10px; padding:12px 14px; border-radius:8px;
    background:var(--ink); color:#e6edf3; font-size:.78rem; line-height:1.55;
    overflow-x:auto; white-space:pre-wrap; word-break:break-word; }

  /* ---- Official sources ----
     Same dot-plus-words convention as the publish panel above: the dot is the
     glance, the words are the answer, and neither depends on telling colours
     apart. A changed source gets the amber treatment rather than red — it is a
     thing to read, not a thing that has broken. */
  .src { display:flex; gap:9px; align-items:baseline; padding:8px 0;
    border-bottom:1px solid var(--sand-200); font-size:.88rem; }
  .src:last-child { border-bottom:0; }
  .src .dot { width:9px; height:9px; border-radius:50%; flex:none;
    background:var(--forest-600); align-self:center; }
  .src.stale .dot { background:var(--ink-muted); }
  .src.bad .dot { background:var(--red); }
  .src .name { flex:1 1 auto; min-width:0; }
  .src .when { color:var(--ink-muted); font-size:.78rem; white-space:nowrap; }
  .chg { border:1px solid #fdba74; background:#fff7ed; border-radius:10px;
    padding:12px 14px; margin:12px 0; }
  .chg h4 { margin:0 0 4px; font-size:.92rem; }
  .chg .diff { margin-top:10px; max-height:280px; overflow:auto; }
  .chg .row { margin-top:10px; }

  /* ---- Attached-image rows ----
     One row per stored hero image, in the insights panel. Shares the flex shape
     the retired document list used, which is why it is still called .doc. */
  .doc { border:1px solid var(--sand-200); border-radius:12px; padding:12px 14px;
    margin-bottom:10px; display:flex; gap:12px; align-items:baseline;
    flex-wrap:wrap; justify-content:space-between; }
  .doc .path { font-size:.78rem; color:var(--ink-muted); font-family:ui-monospace,Menlo,monospace; }
  button.mini { padding:2px 8px; font-size:.78rem; background:#fff;
    border:1px solid var(--sand-400); }
  .errs { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b;
    padding:10px 12px; border-radius:8px; font-size:.85rem; margin:10px 0; }
  .errs ul { margin:6px 0 0; padding-left:18px; }
  .ok { background:#f0fdf4; border:1px solid #86efac; color:#14532d;
    padding:10px 12px; border-radius:8px; font-size:.85rem; margin:10px 0; }
</style>
</head>
<body>
<header class="top">
  <div class="line1">
    <h1>Malaysia Visa Guide — control room</h1>
    <span class="who">Signed in: ${escapeHtml(email)}</span>
  </div>
  <div class="stats" id="stats"><span class="stat">Loading…</span></div>
  <nav class="panels" id="panelNav">
    <a href="#publish">Publish</a>
    <a href="#watch">Sources</a>
    <a href="#insights">Images</a>
    <a href="#news">News queue</a>
  </nav>
</header>
<div id="toasts" role="status" aria-live="polite"></div>
<main>

  <!-- Loud, persistent failure bar. A commit that fails leaves an article
       approved but not live, and the old UI said so only in a toast that the
       list reload wiped. This sits above everything, survives reloads, and only
       clears when there is nothing stranded. -->
  <div id="alertBar" class="alertbar" hidden></div>

  <section id="publish">
    <div class="row" style="justify-content:space-between">
      <h2>Publish</h2>
      <button class="approve" id="publishBtn">Retry failed publishes</button>
    </div>
    <p class="muted" style="margin:6px 0 0">
      Approving an article publishes it — it commits to the repo and the site
      redeploys on its own, live in about two minutes. Nothing to click here in
      the normal case. If a commit failed, the article shows in Approved with its
      own Publish (retry) button; this retries every stranded one at once.
    </p>
    <div id="deployState" class="deploy"><span class="muted">Checking…</span></div>
    <pre id="deployLog" class="deploy-log" hidden></pre>
  </section>

  <!--
    Official sources. Sits directly under Publish because it is the only panel on
    this page that can tell you the site is currently WRONG — the news queue can
    only tell you it is incomplete. PVIP's terms changed in March 2026 and the
    site served the 2022 numbers until July; nothing here would have let that run.
  -->
  <section id="watch">
    <div class="row" style="justify-content:space-between">
      <h2>Official sources</h2>
      <button class="ghost" id="watchRun">Check now</button>
    </div>
    <p class="muted" style="margin:6px 0 0">
      The government pages every figure on the site cites, checked daily. A change
      here usually means <code>programmes.ts</code> needs an edit — not that an
      article needs writing.
    </p>
    <div id="watchEvents"></div>
    <div id="watchList"><div class="empty">Loading…</div></div>
  </section>

  <!--
    Insights — pictures only.

    The prose is not edited here. /insights/ articles are markdown in
    content/insights/ and are written at /admin/ (Sveltia CMS), where saving
    commits and deploys in one step. This panel is what Sveltia cannot do:
    hero images live in R2 rather than in git (public/admin/config.yml explains
    why), so there is no media library over there to upload one through.

    The image is filed against a slug typed by hand, and nothing here checks
    that the article exists. It may not exist yet — attaching the picture
    before the prose lands is a legitimate order to work in — and a slot for an
    article that never arrives costs a row nobody reads. The slot is the only
    thing that binds the two: scripts/pull-images.mjs matches
    "insights/<category>/<slug>" against the article's own path, and neither
    side has to know how the other was made.
  -->
  <section id="insights">
    <h2>Insight article images</h2>
    <p class="muted" style="margin:6px 0 0">
      The articles themselves are written at
      <a href="${escapeHtml(siteOrigin)}/admin/" target="_blank" rel="noopener">/admin/</a>.
      Pictures are here because that editor has no media library — they live in
      R2, not in the repo.
    </p>

    <div class="imgbox" id="insightImages">
      <h4>Hero images</h4>
      <div id="insightImgList"><div class="empty">Loading…</div></div>
      <label>Which article — category and the last part of its URL</label>
      <div class="row">
        <select id="iiCategory"></select>
        <input type="text" id="iiSlug" placeholder="malaysian-tax-for-expats">
      </div>
      <label>Upload a file</label>
      <input type="file" accept="image/*" id="iiFile">
      <div class="or">or paste the address of an image already on the web</div>
      <input type="url" id="iiUrl" placeholder="https://…/photo.jpg">
      <label>Alt text — what the picture shows (required)</label>
      <input type="text" id="iiAlt">
      <label>Credit — photographer or agency, blank for none</label>
      <input type="text" id="iiCredit">
      <div class="row" style="margin-top:10px">
        <button class="approve" id="iiSave">Save image</button>
      </div>
      <div class="muted" style="margin-top:8px">
        Saving stores the picture. It reaches the site on the next deploy, when
        the build pulls it in.
      </div>
    </div>
  </section>

  <section id="news">
    <div class="row" style="justify-content:space-between">
      <h2>News queue</h2>
      <div class="row">
        <button class="ghost" id="backfill">Write missing articles</button>
        <button class="ghost" id="refresh">Fetch latest now</button>
      </div>
    </div>
    <div id="backfillMsg"></div>
    <div class="row" style="margin:8px 0 12px">
      <input type="url" id="submitUrl" placeholder="Paste an article URL to add it manually…">
      <button class="approve" id="submitBtn">Add</button>
    </div>

    <details class="manual" id="manual">
      <summary>Key the article in yourself — for a source we cannot read</summary>
      <div class="fields">
        <div>
          <label for="mUrl">Source URL</label>
          <input type="url" id="mUrl" placeholder="https://www.thestar.com.my/…">
        </div>
        <div>
          <label for="mSource">Publication</label>
          <input type="text" id="mSource" placeholder="Defaults to the URL's domain">
        </div>
        <div class="wide">
          <label for="mTitle">Publisher's headline</label>
          <input type="text" id="mTitle" placeholder="Exactly as they ran it — we write our own on top">
        </div>
        <div>
          <label for="mCategory">Category</label>
          <select id="mCategory"></select>
        </div>
        <div>
          <label for="mDate">Published</label>
          <input type="date" id="mDate">
        </div>
        <div class="wide">
          <label for="mText">Article text</label>
          <textarea id="mText" rows="14" placeholder="Paste the body of the story. Model input only — none of it is published, and the page still cites and links the source."></textarea>
          <div class="muted" id="mCount" style="margin-top:4px">0 characters — 400 minimum.</div>
        </div>
        <div class="wide row">
          <button class="approve" id="mSubmit">Write article &amp; publish</button>
          <div id="mMsg" style="flex:1; min-width:220px"></div>
        </div>
      </div>
    </details>

    <div class="tabs">
      <button class="tab active" data-view="pending">Pending</button>
      <button class="tab" data-view="approved">Approved (live)</button>
      <button class="tab" data-view="rejected">Rejected</button>
      <button class="tab" data-view="polish">Needs polish</button>
    </div>
    <div id="list"><div class="empty">Loading…</div></div>
  </section>

</main>
<script nonce="${escapeHtml(nonce)}">
const $ = (s) => document.querySelector(s);
const SITE = ${JSON.stringify(siteOrigin)};
// Serialised from shared/blocks.ts rather than retyped, so the image panel's
// category select cannot drift from the closed list the site validates against.
const CATEGORIES = ${JSON.stringify(INSIGHT_CATEGORIES)};
/**
 * Where to load an attached image preview from.
 *
 * NOT a relative path, and not SITE. The dashboard is served on
 * malaysiavisaguide.com as well as on workers.dev, and the routes claimed on the
 * custom domain are only /dashboard* and /api/admin/* — /api/news/… there falls
 * through to the Pages site, which has never heard of it. The workers.dev host
 * answers on every path this Worker serves, so previews use it explicitly.
 */
const SITE_API = ${JSON.stringify(newsApiOrigin)};
// "pending" | "approved" | "rejected" are status filters; "polish" is the
// /humanizer queue, which cuts across status — an item waiting on the real skill
// is normally already approved and live.
let currentView = "pending";
// Kept so "Edit" can build a form from the row already on screen rather than
// re-fetching a single item.
let currentItems = [];

async function api(path, opts) {
  const r = await fetch(path, opts);
  return r.json();
}

/* ------------------------------------------------------------------ *
 * Telling Jason something
 * ------------------------------------------------------------------ */

/**
 * A message that does not take the page away.
 *
 * This replaced alert(). A modal blocks every other control, has to be dismissed
 * before the thing it is describing can be looked at, and — the case that
 * actually cost something — sits on top of the manual-intake form holding a
 * story that was pasted in by hand, so reading the error and fixing the field
 * cannot happen at the same time.
 *
 * Errors stay until dismissed; anything else clears itself. A failure is the one
 * kind of message that must not scroll past while you are looking elsewhere.
 */
function toast(message, kind) {
  const el = document.createElement("div");
  el.className = "toast " + (kind || "info");
  const x = document.createElement("button");
  x.className = "x";
  x.type = "button";
  x.setAttribute("aria-label", "Dismiss");
  x.textContent = "×";
  x.addEventListener("click", () => el.remove());
  el.textContent = String(message);
  el.prepend(x);
  $("#toasts").append(el);
  if (kind !== "bad") setTimeout(() => el.remove(), 6000);
  return el;
}

/**
 * Two clicks for anything that cannot be undone, in place of confirm().
 *
 * Same objection as alert(), plus one specific to this page: the browser dialog
 * names the page, not the article, so "Remove the image from this article?"
 * arrives with no way to check WHICH article without dismissing it first. Arming
 * the button instead keeps the row, the headline and the picture on screen while
 * the question is being answered, and the answer is in the same place as the
 * question.
 *
 * Returns true once armed and clicked again. Disarms after six seconds, so a
 * button left half-pressed does not stay dangerous.
 */
function armed(btn, prompt) {
  if (btn.dataset.armed === "1") return true;
  const original = btn.textContent;
  btn.dataset.armed = "1";
  btn.textContent = prompt || "Click again to confirm";
  const reset = () => {
    if (!btn.isConnected) return;
    delete btn.dataset.armed;
    btn.textContent = original;
  };
  btn.dataset.resetAt = String(Date.now() + 6000);
  setTimeout(reset, 6000);
  return false;
}

/* ------------------------------------------------------------------ *
 * Unsent work survives a reload
 * ------------------------------------------------------------------ */

/**
 * localStorage, wrapped so it can never be the thing that breaks the page.
 *
 * It throws in a private window and on blocked site data, and the dashboard
 * working is worth more than a restored draft. Every read returns null and every
 * write is a no-op if the browser refuses.
 */
const draft = {
  get(key) {
    try { return JSON.parse(localStorage.getItem("mvg:" + key) || "null"); }
    catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem("mvg:" + key, JSON.stringify(value)); } catch {}
  },
  clear(key) {
    try { localStorage.removeItem("mvg:" + key); } catch {}
  },
};

/* ------------------------------------------------------------------ *
 * The header strip
 *
 * The dashboard opens on Pending, so before this existed the one state that
 * means the site is WRONG right now — an approved article whose commit failed —
 * was two clicks away and you had to suspect it to go looking. Now it is in the
 * bar, in red, at every scroll position.
 * ------------------------------------------------------------------ */

function ago(iso) {
  if (!iso) return "never";
  const then = Date.parse(iso.length <= 19 && !iso.endsWith("Z") ? iso + "Z" : iso);
  if (!Number.isFinite(then)) return "never";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return hrs + "h ago";
  return Math.round(hrs / 24) + "d ago";
}

async function loadCounts() {
  const c = await api("/api/admin/counts").catch(() => null);
  const box = $("#stats");
  if (!c || !c.ok) {
    box.innerHTML = '<span class="stat">Counts unavailable.</span>';
    return;
  }

  const bits = [];
  // Stranded leads when there is one, and is omitted entirely when there is not.
  // A permanent "Not live: 0" trains the eye to skip the place the warning
  // appears, which is the opposite of what it is for.
  if (c.stranded > 0) {
    bits.push('<span class="stat bad"><b>' + c.stranded + '</b> NOT LIVE — commit failed</span>');
  }
  bits.push('<span class="stat"><b>' + c.pending + '</b> pending</span>');
  bits.push('<span class="stat"><b>' + c.approved + '</b> approved</span>');
  if (c.polish > 0) bits.push('<span class="stat"><b>' + c.polish + '</b> need polish</span>');
  bits.push('<span class="stat">sources checked <b>' + esc(ago(c.checked)) + "</b></span>");
  if (c.unreachable > 0) {
    bits.push('<span class="stat bad"><b>' + c.unreachable + '</b> unreadable</span>');
  }
  box.innerHTML = bits.join("");
}

/**
 * Which panel the jump links highlight.
 *
 * Cheap scroll handler rather than IntersectionObserver: four elements, and the
 * rule wanted here ("the last heading that has passed under the bar") is a
 * position comparison, which an observer answers awkwardly.
 */
const PANELS = ["publish", "watch", "insights", "news"];
function markPanel() {
  let here = PANELS[0];
  for (const id of PANELS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 160) here = id;
  }
  document.querySelectorAll("nav.panels a").forEach((a) => {
    a.classList.toggle("here", a.getAttribute("href") === "#" + here);
  });
}
addEventListener("scroll", markPanel, { passive: true });

// ---- Publish ----
//
// The site is a static export, so every panel below writes to D1 and changes
// nothing a reader can see. This is the only control on the page that publishes.

// Polling handle, so a second Publish cannot start a second timer racing the
// first — both would write the same element and the elapsed count would jitter.
let deployTimer = null;
// 6 minutes at 5s. A Pages build of this site takes ~50s; anything past six
// minutes is stuck, and polling forever would hammer the API all day on a tab
// nobody closed.
const DEPLOY_POLL_MS = 5000;
const DEPLOY_POLL_MAX = 72;
let deployPolls = 0;

const PHASE_WORDS = {
  queued: "Queued",
  building: "Building",
  deploying: "Uploading",
  success: "Live",
  failure: "Failed",
};

function renderDeploy(s) {
  const el = $("#deployState");
  const log = $("#deployLog");

  if (!s.ok) {
    el.className = "deploy";
    el.innerHTML = '<span class="dot"></span><span class="muted">' + esc(s.error || "Unavailable.") + "</span>";
    return;
  }
  if (!s.latest) {
    el.className = "deploy";
    el.innerHTML = '<span class="dot"></span><span class="muted">No deployment yet.</span>';
    return;
  }

  const d = s.latest;
  const running = d.phase === "queued" || d.phase === "building" || d.phase === "deploying";
  el.className = "deploy " + (running ? "running" : d.phase);

  // Past tense once it is done: "in 49s" reads as a duration, "49s" while running
  // reads as a stopwatch. Same number, two different questions.
  const time = running ? d.elapsedSeconds + "s" : "in " + d.elapsedSeconds + "s";
  let text = "<strong>" + esc(PHASE_WORDS[d.phase] || d.phase) + "</strong> · " + time;
  if (d.commit) text += " · " + esc(d.commit);
  if (d.commitMessage) text += " · " + esc(d.commitMessage);

  el.innerHTML = '<span class="dot"></span><span>' + text + "</span>";

  if (d.phase === "failure") {
    loadDeployLog(d.id);
  } else if (d.phase !== "queued") {
    log.hidden = true;
  }
}

async function loadDeployLog(id) {
  const log = $("#deployLog");
  const r = await api("/api/admin/deployments/" + encodeURIComponent(id) + "/log");
  log.hidden = false;
  log.textContent = r.ok && r.lines.length
    ? r.lines.join("\\n")
    : (r.error || "No log available.");
}

async function pollDeploy() {
  const s = await api("/api/admin/deployments");
  renderDeploy(s);

  const running = s.ok && s.busy;
  if (deployTimer) { clearTimeout(deployTimer); deployTimer = null; }

  if (running && ++deployPolls < DEPLOY_POLL_MAX) {
    deployTimer = setTimeout(pollDeploy, DEPLOY_POLL_MS);
  } else {
    deployPolls = 0;
  }
  return s;
}

// Retry every stranded article in one go. Publishing is per-article now — the
// old site-wide build trigger is gone — so this fetches the approved list, finds
// the ones that never committed, and re-attempts each. loadList (via showTab)
// then recomputes the bar, so the residual count is shown without special-casing.
$("#publishBtn").addEventListener("click", async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Retrying…";
  try {
    const { items } = await api("/api/admin/items?status=approved");
    const bad = (items || []).filter(isStranded);
    if (!bad.length) {
      clearAlert();
      showTab("approved");
      return;
    }
    for (const it of bad) {
      await api("/api/admin/publish", {
        method: "POST", headers: {"content-type":"application/json"},
        body: JSON.stringify({ id: it.id }),
      });
    }
    showTab("approved");
  } finally {
    btn.disabled = false;
    btn.textContent = "Retry failed publishes";
  }
});

// ---- Stranded-article alert ----
// An approved article with a slug that was never committed and was not retired
// is stranded: it looks approved and is not live. This is the single condition
// the loud bar and the per-item badge both key off.
function isStranded(it) {
  return it.status === "approved" && it.slug && !it.committed_at && !it.retired_at;
}
function showAlert(html) {
  const bar = $("#alertBar");
  bar.innerHTML = html;
  bar.hidden = false;
}
function clearAlert() {
  const bar = $("#alertBar");
  bar.hidden = true;
  bar.innerHTML = "";
}
// The link line under an article's category, told from the repo state rather
// than assumed. A slug alone used to print a green /news/ link even when the
// page 404ed; now the link appears only when the file is actually committed.
function liveState(it) {
  if (!it.slug) return "";
  if (it.retired_at) return ' <span class="retired">retired — offline</span>';
  if (it.committed_at) {
    return ' <a class="live" href="' + SITE + '/news/' + esc(it.slug) +
      '/" target="_blank" rel="noopener">/news/' + esc(it.slug) + '/ ↗</a>';
  }
  if (isStranded(it)) return ' <span class="notlive">⚠ NOT LIVE — commit failed</span>';
  return "";
}

// ---- News queue ----
async function loadList() {
  const query = currentView === "polish" ? "polish=needed" : "status=" + currentView;
  const { items } = await api("/api/admin/items?" + query);
  currentItems = items || [];

  // The header follows the list. Every action that changes the queue already
  // ends in loadList(), so one call here keeps the counts honest without
  // threading a refresh through fifteen handlers — and it is one cheap query.
  loadCounts();

  // The bar reflects the approved view, where stranded articles live. On any
  // other tab it is cleared rather than left showing a stale count.
  if (currentView === "approved") {
    const bad = currentItems.filter(isStranded);
    if (bad.length) {
      showAlert(bad.length + " approved article" + (bad.length > 1 ? "s are" : " is") +
        " NOT live — the commit to the repo failed. Press <strong>Publish (retry)</strong> on " +
        (bad.length > 1 ? "each" : "it") + " below. If it keeps failing, the Worker's " +
        "GITHUB_TOKEN has most likely expired — mint a new one and " +
        "<code>wrangler secret put GITHUB_TOKEN</code>.");
    } else {
      clearAlert();
    }
  } else {
    clearAlert();
  }

  if (!currentItems.length) {
    $("#list").innerHTML = '<div class="empty">' + (currentView === "polish"
      ? "Nothing waiting on the humanizer. Articles land here after the Worker's own pass has run over them."
      : "Nothing here.") + '</div>';
    return;
  }
  $("#list").innerHTML = currentItems.map(renderItem).join("");
}
function renderItem(it) {
  const date = it.published_at ? new Date(it.published_at).toLocaleDateString() : "";
  const id = it.id;
  const edit = '<button class="ghost" data-act="edit" data-id="' + id + '">Edit</button>';
  const humanise = '<button class="ghost" data-act="humanize" data-id="' + id + '">Humanise</button>';
  let actions;
  if (currentView === "pending") {
    // "Write & publish", not "Approve" — the button commissions a large-model
    // article and takes the better part of a minute. Labelling it honestly is
    // what stops it being clicked twice.
    actions = '<button class="approve" data-act="approve" data-id="' + id + '">Write article &amp; publish</button>' +
      '<button class="reject" data-act="reject" data-id="' + id + '">Reject</button>';
  } else if (currentView === "approved") {
    // A stranded article leads with Publish (retry) — that is the one thing to
    // do with it, so it is the first and loudest button.
    actions = (isStranded(it)
        ? '<button class="approve" data-act="publish" data-id="' + id + '">Publish (retry)</button>'
        : "") +
      edit +
      '<button class="ghost" data-act="regenerate" data-id="' + id + '">Rewrite</button>' +
      humanise +
      '<button class="delete" data-act="delete" data-id="' + id + '">Delete</button>';
  } else if (currentView === "polish") {
    // No Rewrite here on purpose: regenerating would throw away whatever the
    // humanizer already improved and start the article over from the source.
    actions = edit + humanise +
      '<button class="ghost" data-act="polished" data-id="' + id + '">Mark polished</button>';
  } else {
    actions = '<button class="approve" data-act="approve" data-id="' + id + '">Write article &amp; publish</button>' +
      '<button class="delete" data-act="delete" data-id="' + id + '">Delete</button>';
  }

  return '<div class="item" data-item="' + id + '">' +
    '<span class="cat">' + esc(it.category) + '</span>' +
    (it.origin === "manual" ? '<span class="chip manual">keyed in</span>' : '') +
    (it.polish_state === "needs-claude" ? '<span class="chip polish">needs /humanizer</span>' : '') +
    liveState(it) +
    '<h3>' + esc(it.headline || it.title) + '</h3>' +
    (it.headline ? '<div class="meta">Publisher\\'s headline: ' + esc(it.title) + '</div>' : '') +
    '<p>' + esc(it.dek || it.summary) + '</p>' +
    '<div class="meta">Source: <a href="' + esc(it.source_url) + '" target="_blank" rel="noopener">' +
      esc(it.source_name) + '</a>' + (date ? ' · ' + date : '') +
      (it.reading_minutes ? ' · ' + it.reading_minutes + ' min read' : '') +
      (it.article_model ? ' · written by ' + esc(it.article_model) : '') + '</div>' +
    renderDraft(it) +
    '<div class="row" style="margin-top:10px">' + actions + '</div>' +
    '<div class="msg" data-msg="' + id + '"></div>' +
  '</div>';
}

/** Read-only view of the generated article, so approval is an informed decision. */
function renderDraft(it) {
  const body = parseBody(it.body);
  if (!body) return "";
  let h = '<div class="draft">';
  if (body.keyPoints.length) {
    h += '<h4>Key points</h4><ul>' + body.keyPoints.map(p => '<li>' + esc(p) + '</li>').join("") + '</ul>';
  }
  h += body.sections.map(s =>
    '<div class="sec"><strong>' + esc(s.heading) + '</strong>' +
    s.paragraphs.map(p => '<p>' + esc(p) + '</p>').join("") + '</div>').join("");
  if (body.whatItMeans.length) {
    h += '<h4>What it means</h4><ul>' + body.whatItMeans.map(p => '<li>' + esc(p) + '</li>').join("") + '</ul>';
  }
  if (it.source_excerpt) {
    h += '<h4>Quoted from ' + esc(it.source_name) + '</h4><blockquote>' + esc(it.source_excerpt) + '</blockquote>';
  }
  return h + '</div>';
}

/**
 * The editor. Every field is plain text — one bullet or paragraph per line —
 * rather than the raw JSON the column stores. Jason is the editorial authority
 * on this content, not a JSON author, and a stray comma should not be able to
 * take a live page down.
 */
function renderEditor(it) {
  const body = parseBody(it.body) || { keyPoints: [], sections: [], whatItMeans: [] };
  const secs = body.sections.map((s, i) =>
    '<label>Section ' + (i + 1) + ' heading</label>' +
    '<input type="text" data-f="secHeading" value="' + esc(s.heading) + '">' +
    '<label>Section ' + (i + 1) + ' paragraphs (one per line)</label>' +
    '<textarea rows="6" data-f="secParas">' + esc(s.paragraphs.join("\\n")) + '</textarea>').join("");

  return '<div class="draft" data-editor="' + it.id + '">' +
    '<label>Headline</label>' +
    '<input type="text" data-f="headline" value="' + esc(it.headline || it.title) + '">' +
    '<label>Standfirst — also the meta description</label>' +
    '<textarea rows="2" data-f="dek">' + esc(it.dek || "") + '</textarea>' +
    '<label>Key points (one per line)</label>' +
    '<textarea rows="5" data-f="keyPoints">' + esc(body.keyPoints.join("\\n")) + '</textarea>' +
    secs +
    '<label>What it means (one per line)</label>' +
    '<textarea rows="4" data-f="whatItMeans">' + esc(body.whatItMeans.join("\\n")) + '</textarea>' +
    '<label>Quote from the source — leave empty for none</label>' +
    '<textarea rows="2" data-f="excerpt">' + esc(it.source_excerpt || "") + '</textarea>' +
    renderImageBox(it) +
    '<div class="row" style="margin-top:14px">' +
      '<button class="approve" data-act="save" data-id="' + it.id + '">Save</button>' +
      '<button class="ghost" data-act="cancel" data-id="' + it.id + '">Cancel</button>' +
    '</div>' +
    '<div class="muted" style="margin-top:8px">Saved edits are live as soon as the site is rebuilt and deployed.</div>' +
  '</div>';
}

/**
 * The hero image panel.
 *
 * Its Save is separate from the article's Save, and that is on purpose: an image
 * is a file transfer that can fail on its own terms — too big, a URL that is
 * really a web page, a 403 from a publisher — and folding it into the article
 * save would make a rejected picture look like lost edits to the prose.
 *
 * The preview is cache-busted on image_updated_at. Without it, replacing a
 * picture appears to do nothing: the URL has not changed, so the browser shows
 * the copy it already has and the obvious conclusion is that the upload failed.
 */
function renderImageBox(it) {
  // Prefer the asset library. The /api/news/<slug>/image address still answers
  // for a row that has not been migrated, and falls through to R2 for one that
  // has, so either works — but the library URL is content-addressed by asset id
  // and needs no cache-buster at all.
  const src = it.asset_id
    ? SITE_API + "/api/images/" + esc(it.asset_id) + "/hero"
    : SITE_API + "/api/news/" + esc(it.slug || "") + "/image?v=" +
      encodeURIComponent(it.image_updated_at || "");
  return '<div class="imgbox" data-img="' + it.id + '">' +
    '<h4>Hero image</h4>' +
    (it.has_image
      ? '<img src="' + src + '" alt="">'
      : '<div class="muted" style="margin:8px 0">No image — the article publishes without one.</div>') +
    (it.image_source ? '<div class="muted" style="font-size:.75rem">From: ' + esc(it.image_source) + '</div>' : '') +
    '<label>Upload a file</label>' +
    '<input type="file" accept="image/*" data-f="imgFile">' +
    '<div class="or">or paste the address of an image already on the web</div>' +
    '<input type="url" data-f="imgUrl" placeholder="https://…/photo.jpg">' +
    '<label>Alt text — what the picture shows (required)</label>' +
    '<input type="text" data-f="imgAlt" value="' + esc(it.asset_alt || it.image_alt || "") + '">' +
    '<label>Credit — photographer or agency, blank for none</label>' +
    '<input type="text" data-f="imgCredit" value="' + esc(it.asset_credit || it.image_credit || "") + '">' +
    '<div class="row" style="margin-top:10px">' +
      '<button class="approve" data-act="saveimg" data-id="' + it.id + '">Save image</button>' +
      (it.has_image ? '<button class="delete" data-act="delimg" data-id="' + it.id + '">Remove image</button>' : '') +
    '</div>' +
  '</div>';
}

/**
 * The renditions, serialised out of worker/src/assets.ts rather than retyped.
 *
 * This is where an image on this site is resized — the crop runs in the browser
 * — but the numbers belong to the file that documents what a hero_key promises.
 * They were written out in both places until 2026-09-20 with nothing keeping the
 * two in step.
 */
const HERO = ${JSON.stringify({
  w: HERO_SPEC.width,
  h: HERO_SPEC.height,
  type: HERO_SPEC.mime,
  q: HERO_SPEC.quality,
})};
const OG = ${JSON.stringify({
  w: OG_SPEC.width,
  h: OG_SPEC.height,
  type: OG_SPEC.mime,
  q: OG_SPEC.quality,
})};

/**
 * Crop-to-fill, reproducing sharp's \`fit: "cover"\` with the default centre
 * position.
 *
 * That equivalence is the point of the function: this replaces a \`sharp\` resize
 * that ran in Pages CI, and a hero that suddenly framed differently would look
 * like a bug in the photo rather than a change of tool.
 *
 * What cover does: scale so the source COVERS the target — the larger of the two
 * ratios — then take the overflow off both sides equally. Done here as a source
 * rectangle handed to drawImage rather than as a scale-then-clip, so the browser
 * resamples straight from the original pixels once instead of twice.
 *
 * Note it enlarges a source smaller than the target, exactly as sharp does by
 * default (\`withoutEnlargement\` is false). Better a soft hero than a 600px
 * picture in a 1440px slot.
 */
function coverCrop(bitmap, spec) {
  const scale = Math.max(spec.w / bitmap.width, spec.h / bitmap.height);
  // The source rectangle that maps onto the whole target. Clamped, because
  // rounding at the extremes can put it a pixel outside the bitmap.
  const sw = Math.min(bitmap.width, Math.round(spec.w / scale));
  const sh = Math.min(bitmap.height, Math.round(spec.h / scale));
  const sx = Math.max(0, Math.round((bitmap.width - sw) / 2));
  const sy = Math.max(0, Math.round((bitmap.height - sh) / 2));

  const canvas = document.createElement("canvas");
  canvas.width = spec.w; canvas.height = spec.h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, spec.w, spec.h);
  return new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error("The browser could not encode " + spec.type)), spec.type, spec.q));
}

/**
 * Turn one picked file into the three objects R2 stores.
 *
 * This is where \`sharp\` went. It used to run on the Pages build machine, which
 * meant a native dependency installed on every CI run to resize a photograph
 * that a browser with the file already open could crop in a few milliseconds on
 * a GPU. The bytes also stopped travelling: base64 through a Worker, into a D1
 * row and back out again is gone, and each rendition is now PUT as-is.
 *
 * \`orig\` is the file untouched. It is what makes a re-crop possible later
 * without asking Jason for the photo again — the reason the bucket keeps three
 * objects instead of two.
 */
async function derive(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const [hero, og] = await Promise.all([coverCrop(bitmap, HERO), coverCrop(bitmap, OG)]);
    return {
      id: crypto.randomUUID(),
      orig: file,
      mime: file.type || "image/jpeg",
      width: bitmap.width,
      height: bitmap.height,
      source: file.name || null,
      hero: hero,
      og: og,
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Send the three renditions, then the row that makes them real.
 *
 * Order matters and is the reverse of what feels natural: bytes first, metadata
 * last. An upload that dies half way then leaves objects nobody references —
 * invisible, and a fraction of a cent — rather than a manifest entry whose
 * picture 404s on the build machine and vanishes off the site.
 */
async function uploadAsset(d, meta) {
  const put = async (variant, blob, mime) => {
    const r = await api("/api/admin/assets/" + d.id + "/" + variant, {
      method: "PUT", headers: { "content-type": mime }, body: blob,
    });
    if (!r.ok) throw new Error(r.error || ("Could not upload the " + variant + " image."));
  };
  await put("orig", d.orig, d.mime);
  await put("hero", d.hero, HERO.type);
  await put("og", d.og, OG.type);

  const r = await api("/api/admin/assets/" + d.id, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slot: meta.slot, alt: meta.alt, credit: meta.credit, source: meta.source ?? d.source,
      mime: d.mime, width: d.width, height: d.height,
    }),
  });
  if (!r.ok) throw new Error(r.error || "Could not save the image details.");
  return r;
}

/**
 * A file for a pasted URL.
 *
 * The browser cannot read a publisher's photo itself — no CORS header, and a
 * tainted response is not something createImageBitmap will decode — so the
 * Worker fetches it and hands the bytes back. One crop path for both ways in.
 */
async function fileFromUrl(url) {
  const r = await fetch("/api/admin/fetch-image?url=" + encodeURIComponent(url));
  if (!r.ok) {
    const why = await r.json().catch(() => ({}));
    throw new Error(why.error || ("That URL returned " + r.status + "."));
  }
  const blob = await r.blob();
  const name = (url.split("?")[0].split("/").pop() || "image");
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

function parseBody(raw) {
  if (!raw) return null;
  try {
    const b = JSON.parse(raw);
    return {
      keyPoints: b.keyPoints || [],
      sections: b.sections || [],
      whatItMeans: b.whatItMeans || [],
    };
  } catch { return null; }
}

/** Read the editor's plain-text fields back into the stored JSON shape. */
function collectEditor(el) {
  const get = (f) => el.querySelector('[data-f="' + f + '"]');
  const lines = (f) => get(f).value.split("\\n").map(s => s.trim()).filter(Boolean);
  const headings = [...el.querySelectorAll('[data-f="secHeading"]')];
  const paras = [...el.querySelectorAll('[data-f="secParas"]')];
  const sections = headings.map((h, i) => ({
    heading: h.value.trim(),
    paragraphs: (paras[i] ? paras[i].value : "").split("\\n").map(s => s.trim()).filter(Boolean),
  })).filter(s => s.heading && s.paragraphs.length);

  return {
    headline: get("headline").value.trim(),
    dek: get("dek").value.trim(),
    body: { keyPoints: lines("keyPoints"), sections: sections, whatItMeans: lines("whatItMeans") },
    source_excerpt: get("excerpt").value.trim() || null,
  };
}

// ---- events ----
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  showTab(t.dataset.view);
}));
function showTab(view) {
  currentView = view;
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x.dataset.view === view));
  loadList();
}
$("#list").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  const id = b.dataset.id, act = b.dataset.act;
  const item = currentItems.find(i => i.id === id);
  const msg = document.querySelector('[data-msg="' + id + '"]');

  if (act === "edit") {
    if (!item) return;
    b.closest(".item").querySelector(".draft").outerHTML = renderEditor(item);
    const editor = document.querySelector('[data-editor="' + id + '"]');

    // Unsaved edits to this article, from a previous visit. Restoring is offered
    // rather than done: the stored copy may be older than what the humanizer or a
    // rewrite has since written into the row, and silently preferring it would
    // quietly undo that.
    const saved = draft.get("edit:" + id);
    if (saved && editor) {
      const bar = document.createElement("div");
      bar.className = "warn";
      bar.textContent = "You have unsaved edits to this article from " + ago(saved.at) + ". ";
      const restore = document.createElement("button");
      restore.className = "ghost";
      restore.type = "button";
      restore.textContent = "Restore them";
      restore.addEventListener("click", () => {
        for (const [f, v] of Object.entries(saved.fields)) {
          const el = editor.querySelector('[data-f="' + f + '"]');
          if (el) el.value = v;
        }
        bar.remove();
      });
      const discard = document.createElement("button");
      discard.className = "ghost";
      discard.type = "button";
      discard.textContent = "Discard";
      discard.addEventListener("click", () => { draft.clear("edit:" + id); bar.remove(); });
      bar.append(restore, " ", discard);
      editor.prepend(bar);
    }

    if (editor) {
      editor.addEventListener("input", () => {
        const fields = {};
        editor.querySelectorAll("[data-f]").forEach((el) => {
          // File inputs have no value worth storing and cannot be restored into.
          if (el.type !== "file") fields[el.dataset.f] = el.value;
        });
        draft.set("edit:" + id, { at: new Date().toISOString(), fields });
      });
    }
    return;
  }
  if (act === "cancel") { draft.clear("edit:" + id); loadList(); return; }

  if (act === "save") {
    const editor = document.querySelector('[data-editor="' + id + '"]');
    const patch = collectEditor(editor);
    if (!patch.body.sections.length) { toast("An article needs at least one section with a heading and a paragraph.", "bad"); return; }
    b.disabled = true; b.textContent = "Saving…";
    const r = await api("/api/admin/items/" + id, {
      method: "PATCH", headers: {"content-type":"application/json"}, body: JSON.stringify(patch),
    });
    if (r.ok) { draft.clear("edit:" + id); toast("Saved. Live once the site rebuilds.", "good"); loadList(); }
    else { b.disabled = false; b.textContent = "Save"; toast(r.error || "Could not save.", "bad"); }
    return;
  }

  // The image saves on its own, separately from the prose. See renderImageBox.
  if (act === "saveimg") {
    const box = document.querySelector('[data-img="' + id + '"]');
    const get = (f) => box.querySelector('[data-f="' + f + '"]');
    const file = get("imgFile").files[0];
    const url = get("imgUrl").value.trim();
    const alt = get("imgAlt").value.trim();
    const credit = get("imgCredit").value.trim();

    if (alt.length < 5) { toast("Alt text is required — one line describing what the picture shows.", "bad"); return; }
    const item = currentItems.find(i => i.id === id);
    // Alt or credit alone is a legitimate edit of an image already attached.
    if (!file && !url && !(item && item.has_image)) { toast("Pick a file or paste an image URL.", "bad"); return; }
    if (!item || !item.slug) { toast("Write the article first — the image is filed against its slug.", "bad"); return; }

    b.disabled = true;
    try {
      // No new picture: this is a caption edit, and re-uploading three
      // renditions to change a line of text would be absurd. Re-commit the
      // existing asset instead.
      if (!file && !url) {
        if (!item.asset_id) {
          toast("This picture is still in the old store. Re-upload it to edit the caption.", "bad");
          b.disabled = false; b.textContent = "Save image"; return;
        }
        b.textContent = "Saving…";
        const r = await api("/api/admin/assets/" + item.asset_id, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ slot: "news/" + item.slug, alt: alt, credit: credit || null }),
        });
        if (r.ok) loadList();
        else { b.disabled = false; b.textContent = "Save image"; toast(r.error || "Could not save.", "bad"); }
        return;
      }

      b.textContent = url && !file ? "Fetching…" : "Resizing…";
      const source = file ? (file.name || null) : url;
      const picked = file || await fileFromUrl(url);
      const derived = await derive(picked);

      b.textContent = "Uploading…";
      await uploadAsset(derived, {
        slot: "news/" + item.slug, alt: alt, credit: credit || null, source: source,
      });
      loadList();
    } catch (err) {
      b.disabled = false; b.textContent = "Save image";
      toast(String(err.message || err), "bad");
    }
    return;
  }

  if (act === "delimg") {
    if (!armed(b, "Remove image — click again")) return;
    b.disabled = true; b.textContent = "Removing…";
    const r = await api("/api/admin/items/" + id + "/image", { method: "DELETE" });
    if (r.ok) loadList();
    else { b.disabled = false; b.textContent = "Remove image"; toast(r.error || "Could not remove it.", "bad"); }
    return;
  }

  // Clearing the flag is a PATCH, not an action — the article is untouched and
  // only the queue changes.
  if (act === "polished") {
    b.disabled = true; b.textContent = "Clearing…";
    const r = await api("/api/admin/items/" + id, {
      method: "PATCH", headers: {"content-type":"application/json"},
      body: JSON.stringify({ polish_state: "claude-polished" }),
    });
    if (r.ok) loadList();
    else { b.disabled = false; b.textContent = "Mark polished"; toast(r.error || "Could not update.", "bad"); }
    return;
  }

  // Publish (retry): the prose is already written and stored, so this only
  // re-attempts the commit. Fast, and safe to repeat — an unchanged file makes
  // no commit. This is the button the stranded-article bar points at.
  if (act === "publish") {
    b.disabled = true; b.textContent = "Publishing…";
    const r = await api("/api/admin/publish", {
      method: "POST", headers: {"content-type":"application/json"},
      body: JSON.stringify({ id }),
    });
    if (r.ok) { clearAlert(); loadList(); }
    else {
      b.disabled = false; b.textContent = "Publish (retry)";
      if (msg) msg.innerHTML = '<div class="warn">' + esc(r.error || "The commit failed again.") + '</div>';
    }
    return;
  }

  // Two clicks for the two that destroy work.
  //
  // Delete is permanent. Rewrite is subtler and was the more expensive of the
  // two to click by accident: it discards prose that a large model was already
  // paid to write — and, on a live article, prose that has been read, edited and
  // published. Both sit in a row of ordinary buttons next to Edit.
  if (act === "delete" && !armed(b, "Delete permanently — click again")) return;
  if (act === "regenerate" && !armed(b, "Rewrite from scratch — click again")) return;

  // approve / regenerate / humanize all make a large-model call — the first two
  // read the source first. Tell the user it will be slow instead of looking hung.
  const slow = act === "approve" || act === "regenerate" || act === "humanize";
  b.disabled = true;
  const label = b.textContent;
  let tick = null;
  if (slow) {
    b.textContent = act === "humanize" ? "Humanising…" : "Writing…";
    const what = act === "humanize"
      ? "Rewriting the prose. The facts and figures are checked against the original before anything is saved."
      : "Reading the source and writing the article. Leave the tab open.";
    // A live count rather than "this takes 20–60 seconds". The static estimate
    // reads as a stall the moment it is exceeded, and there is no way to tell a
    // slow model call from a dead one. A number that is still moving says which.
    const started = Date.now();
    const paint = () => {
      if (!msg) return;
      const secs = Math.round((Date.now() - started) / 1000);
      msg.innerHTML = '<div class="spin">' + what + " <strong>" + secs + "s</strong>" +
        (secs > 90 ? " — longer than usual, but still going." : "") + "</div>";
    };
    paint();
    tick = setInterval(paint, 1000);
  }
  const r = await api("/api/admin/items/" + id + "/" + act, { method: "POST" })
    .catch((err) => ({ ok: false, error: String((err && err.message) || err) }));
  if (tick) clearInterval(tick);
  if (r && r.ok === false) {
    b.disabled = false; b.textContent = label;
    if (msg) msg.innerHTML = '<div class="warn">' + esc(r.error || "That did not work.") + '</div>';
    return;
  }
  // An approve can return ok:true and still not be live: committing is a second
  // step and reports itself in the committed/warning fields, not in ok. Raise
  // the bar — which outlives this list reload — so the article cannot slip into
  // Approved looking published when it never reached the repo.
  if (act === "approve" && r && r.committed === false) {
    showAlert(esc(r.warning ||
      "The article was approved but the commit failed, so it is not live. " +
      "Open the Approved tab and press Publish (retry)."));
  }
  loadList();
});
// Backfill: approved items that predate the blog have no article, so they are
// filtered out of the public feed. Walk them one at a time, reporting as it goes
// — an item whose source has since gone behind a paywall is skipped and named,
// not allowed to stall the rest.
$("#backfill").addEventListener("click", async (e) => {
  const btn = e.target, out = $("#backfillMsg");
  btn.disabled = true;
  const skip = []; let written = 0; const failed = [];
  for (;;) {
    out.innerHTML = '<div class="spin">Writing article ' + (written + skip.length + 1) +
      '… 20–60 seconds each. Leave this tab open.</div>';
    const r = await api("/api/admin/write-next", {
      method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ skip }),
    });
    if (r.done) break;
    if (r.ok) written++;
    else { skip.push(r.id); failed.push(r.title); }
  }
  btn.disabled = false;
  out.innerHTML = '<div class="' + (failed.length ? "warn" : "muted") + '">' +
    'Wrote ' + written + ' article(s).' +
    (failed.length ? ' Could not write ' + failed.length + ' — the source could not be read: ' +
      failed.map(esc).join("; ") + '.' : '') +
    ' Rebuild and deploy the site to publish.</div>';
  loadList();
});
$("#refresh").addEventListener("click", async (e) => {
  e.target.disabled = true; e.target.textContent = "Fetching…";
  const r = await api("/api/admin/refresh", { method: "POST" });
  e.target.disabled = false; e.target.textContent = "Fetch latest now";
  showTab("pending");
  toast("Added " + (r.added ?? 0) + " new item(s) to the pending queue.", (r.added ?? 0) > 0 ? "good" : "info");
});
$("#submitBtn").addEventListener("click", async () => {
  const url = $("#submitUrl").value.trim(); if (!url) return;
  $("#submitBtn").disabled = true;
  const r = await api("/api/admin/submit", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ url }) });
  $("#submitBtn").disabled = false;
  if (r.ok) { $("#submitUrl").value = ""; showTab("pending"); }
  else toast(r.error || "Could not add that URL.", "bad");
});

// ---- Manual intake ----
// Two requests, not one: insert, then the ordinary approve call that every other
// item goes through. A manual story reaches a page by exactly the same route as
// a swept one, and neither request is left open long enough for a proxy to give
// up on it.
/**
 * The manual-intake form survives a reload.
 *
 * It holds up to twelve thousand characters of a story keyed in or pasted by
 * hand, and it sits in a panel that starts collapsed on every load. A stray
 * Cmd-R, a session that times out, a crash — any of them used to cost the whole
 * paste, and the only recovery was to go and get the story again. Saved on every
 * keystroke, restored on load, cleared only on success.
 */
const MANUAL_FIELDS = ["#mUrl", "#mSource", "#mTitle", "#mCategory", "#mDate", "#mText"];

function saveManualDraft() {
  const out = {};
  for (const sel of MANUAL_FIELDS) out[sel] = $(sel).value;
  // An empty form is not a draft worth keeping — storing one would reopen the
  // panel on the next load for nothing.
  if (MANUAL_FIELDS.every((sel) => !out[sel])) { draft.clear("manual"); return; }
  draft.set("manual", out);
}

function restoreManualDraft() {
  const saved = draft.get("manual");
  if (!saved) return;
  let any = false;
  for (const sel of MANUAL_FIELDS) {
    if (saved[sel]) { $(sel).value = saved[sel]; any = true; }
  }
  if (!any) return;
  // Open the panel — a restored draft nobody can see is the same as a lost one.
  $("#manual").open = true;
  countManual();
  toast("Restored what you had typed into the manual form.", "info");
}

function countManual() {
  const n = $("#mText").value.trim().length;
  $("#mCount").textContent = n < 400
    ? n + " characters — 400 minimum."
    : n + " characters.";
}

$("#mText").addEventListener("input", countManual);
for (const sel of MANUAL_FIELDS) {
  $(sel).addEventListener("input", saveManualDraft);
  $(sel).addEventListener("change", saveManualDraft);
}
$("#mSubmit").addEventListener("click", async () => {
  const btn = $("#mSubmit"), out = $("#mMsg");
  const payload = {
    url: $("#mUrl").value.trim(),
    sourceName: $("#mSource").value.trim(),
    title: $("#mTitle").value.trim(),
    category: $("#mCategory").value,
    text: $("#mText").value.trim(),
    // A date input gives YYYY-MM-DD; the column wants ISO, and midday UTC keeps
    // the displayed date the same on either side of the timezone Jason is in.
    publishedAt: $("#mDate").value ? $("#mDate").value + "T12:00:00.000Z" : "",
  };

  btn.disabled = true;
  out.innerHTML = '<span class="spin">Saving…</span>';
  const added = await api("/api/admin/manual", {
    method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify(payload),
  });
  if (!added.ok) {
    btn.disabled = false;
    out.innerHTML = '<div class="warn">' + esc(added.error || "Could not save that.") + '</div>';
    return;
  }

  out.innerHTML = '<span class="spin">Saved. Writing the article, then humanising it — 30–90 seconds. Leave this tab open.</span>';
  const written = await api("/api/admin/items/" + added.id + "/approve", { method: "POST" });
  btn.disabled = false;

  if (!written.ok) {
    // The row survives, with the pasted text on it. Say so — otherwise a long
    // paste looks lost and gets retyped.
    out.innerHTML = '<div class="warn">' + esc(written.error || "Could not write it.") +
      ' It is saved in the Pending queue with your text — try Write article &amp; publish there.</div>';
    showTab("pending");
    return;
  }

  // Only clear on success, so a failure never costs a long paste.
  ["#mUrl", "#mSource", "#mTitle", "#mText", "#mDate"].forEach(s => { $(s).value = ""; });
  $("#mCount").textContent = "0 characters — 400 minimum.";
  draft.clear("manual");

  if (written.committed === false) {
    // Written and approved, but the commit failed — so it is NOT live. Say so
    // here and raise the bar, rather than linking a page that will 404.
    out.innerHTML = '<div class="warn">' + esc(written.warning ||
      "Written and approved, but the commit failed, so it is not live. " +
      "Open the Approved tab and press Publish (retry).") + '</div>';
    showAlert("An article was just approved but its commit failed — it is not live. " +
      "Open the Approved tab and press <strong>Publish (retry)</strong>.");
    showTab("approved");
    return;
  }

  out.innerHTML = '<span class="muted">Published: <a href="' + SITE + '/news/' + esc(written.slug) +
    '/" target="_blank" rel="noopener">/news/' + esc(written.slug) + '/ ↗</a>' +
    ' — live within about two minutes, once the deploy finishes.</span>';
  showTab("polish");
});

// The category list comes from the Worker so the select cannot drift out of step
// with what the writer will actually accept.
async function loadCategories() {
  const { categories } = await api("/api/admin/categories");
  $("#mCategory").innerHTML = (categories || ["general"]).map(c =>
    '<option value="' + esc(c) + '"' + (c === "general" ? " selected" : "") + '>' + esc(c) + '</option>').join("");
}

// ---- Official sources ----
//
// Two lists in one panel, and the order is the argument: unacknowledged changes
// first, because they are the only thing here that needs a decision, then the
// roster underneath as reassurance that the rest were checked and are the same.

async function loadWatch() {
  const r = await api("/api/admin/watch");
  renderWatch(r.sources || [], r.events || []);
}

function watchWhen(s) {
  if (s.status === "unreachable") {
    return ["bad", "Unreadable — " + s.consecutive_failures + " runs"];
  }
  if (!s.content_hash) return ["stale", "Not read yet"];
  if (!s.last_checked_at) return ["stale", "Never checked"];
  return ["", "Checked " + s.last_checked_at.slice(0, 16)];
}

function renderWatch(sources, events) {
  $("#watchEvents").innerHTML = events.map(e =>
    '<div class="chg">' +
      "<h4>" + esc(e.label) + " changed</h4>" +
      "<div>" + esc(e.summary) + "</div>" +
      (e.diff ? '<pre class="deploy-log diff">' + esc(e.diff) + "</pre>" : "") +
      '<div class="row">' +
        '<button class="approve" data-ack="' + esc(e.id) + '">Seen it</button>' +
        '<button class="ghost" data-promote="' + esc(e.id) + '">Queue as news</button>' +
        '<span class="muted" style="font-size:.78rem">Detected ' + esc(e.detected_at.slice(0, 16)) + "</span>" +
      "</div>" +
    "</div>").join("");

  $("#watchList").innerHTML = sources.length
    ? sources.map(s => {
        const st = watchWhen(s);
        return '<div class="src ' + st[0] + '">' +
          '<span class="dot"></span>' +
          '<span class="name"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
            esc(s.label) + "</a>" +
            (s.mode === "binary" ? ' <span class="muted" style="font-size:.75rem">PDF</span>' : "") +
          "</span>" +
          '<span class="when">' + esc(st[1]) + "</span>" +
        "</div>";
      }).join("")
    : '<div class="empty">No sources yet — run a check.</div>';
}

// Delegated, because the buttons are rebuilt on every render and the page has no
// inline handlers to bind (CSP).
$("#watchEvents").addEventListener("click", async (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const ack = btn.getAttribute("data-ack");
  const promote = btn.getAttribute("data-promote");
  if (!ack && !promote) return;

  btn.disabled = true;
  if (ack) {
    await api("/api/admin/watch/" + encodeURIComponent(ack) + "/ack", { method: "POST" });
    await loadWatch();
    return;
  }

  const r = await api("/api/admin/watch/" + encodeURIComponent(promote) + "/promote", { method: "POST" });
  btn.disabled = false;
  if (!r.ok) {
    btn.insertAdjacentHTML("afterend", '<span class="warn">' + esc(r.error || "Could not queue it.") + "</span>");
    return;
  }
  // It is a pending item now, so send the eye to where the decision continues.
  await loadWatch();
  await loadList();
  showTab("pending");
});

$("#watchRun").addEventListener("click", async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Checking…";
  try {
    await api("/api/admin/watch/run", { method: "POST" });
    await loadWatch();
  } finally {
    btn.disabled = false;
    btn.textContent = "Check now";
  }
});

function esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

loadList(); loadCategories(); pollDeploy(); loadWatch();
loadCounts(); markPanel(); restoreManualDraft();
${INSIGHT_IMAGES_JS}
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
