/**
 * The private dashboard, served only to Jason (behind Cloudflare Access).
 * Self-contained HTML + vanilla JS — it talks to the same Worker's /api/admin
 * routes, whose requests carry the Access cookie automatically. No framework,
 * no external requests, so it works under a strict CSP.
 */
export function dashboardHtml(email: string, siteOrigin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>News & Traffic — Malaysia Visa Guide</title>
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
  header.top { background:var(--forest-900); color:var(--sand-50); padding:16px 24px;
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
  header.top h1 { font-size:1.1rem; margin:0; font-weight:700; }
  header.top .who { font-size:.85rem; color:var(--sand-200); }
  main { max-width:960px; margin:0 auto; padding:24px; }
  section { background:#fff; border:1px solid var(--sand-200); border-radius:14px;
    padding:20px; margin-bottom:24px; }
  h2 { font-size:1.05rem; margin:0 0 14px; }
  .row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:14px; }
  .stat { background:var(--sand-100); border-radius:10px; padding:14px 16px; }
  .stat .n { font-size:1.7rem; font-weight:700; color:var(--forest-900); }
  .stat .l { font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; color:var(--ink-muted); }
  .chart { display:flex; align-items:flex-end; gap:3px; height:120px; margin:16px 0 4px; }
  .chart .bar { flex:1; background:var(--forest-600); border-radius:3px 3px 0 0; min-height:2px; opacity:.85; }
  .chart .bar:hover { opacity:1; }
  .twocol { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  @media (max-width:640px){ .twocol{ grid-template-columns:1fr; } }
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
  .warn { background:#fff7ed; border:1px solid #fdba74; color:#9a3412;
    padding:10px 12px; border-radius:8px; font-size:.85rem; margin-top:10px; }
  .live { font-size:.8rem; }
  .spin { color:var(--ink-muted); font-size:.85rem; }
</style>
</head>
<body>
<header class="top">
  <h1>Malaysia Visa Guide — control room</h1>
  <span class="who">Signed in: ${escapeHtml(email)}</span>
</header>
<main>

  <section id="analytics">
    <div class="row" style="justify-content:space-between">
      <h2>Site traffic</h2>
      <select id="range">
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
    </div>
    <div class="stat-grid" id="stats"><div class="muted">Loading…</div></div>
    <div class="chart" id="chart"></div>
    <div class="muted" id="chartLabel"></div>
    <div class="twocol" style="margin-top:18px">
      <div><h2>Top pages</h2><table id="topPages"></table></div>
      <div><h2>Top countries</h2><table id="topCountries"></table></div>
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
<script>
const $ = (s) => document.querySelector(s);
const SITE = ${JSON.stringify(siteOrigin)};
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

// ---- Analytics ----
async function loadStats() {
  const days = $("#range").value;
  const s = await api("/api/admin/stats?days=" + days);
  if (!s.ok) {
    $("#stats").innerHTML = '<div class="muted">' + (s.error || "No analytics yet.") + '</div>';
    $("#chart").innerHTML = ""; $("#topPages").innerHTML = ""; $("#topCountries").innerHTML = "";
    return;
  }
  $("#stats").innerHTML =
    stat(s.totals.visits, "Visits") + stat(s.totals.pageViews, "Page views") +
    stat(s.daily.length ? Math.round(s.totals.pageViews / days) : 0, "Views / day");
  const max = Math.max(1, ...s.daily.map(d => d.visits));
  $("#chart").innerHTML = s.daily.map(d =>
    '<div class="bar" style="height:' + (d.visits / max * 100) + '%" title="' +
    d.date + ': ' + d.visits + ' visits"></div>').join("");
  $("#chartLabel").textContent = s.daily.length
    ? s.daily[0].date + " → " + s.daily[s.daily.length - 1].date + " (daily visits)" : "";
  $("#topPages").innerHTML = s.topPages.map(p =>
    '<tr><td>' + esc(p.path) + '</td><td class="num">' + p.pageViews + '</td></tr>').join("")
    || '<tr><td class="muted">No data</td></tr>';
  $("#topCountries").innerHTML = s.topCountries.map(c =>
    '<tr><td>' + esc(c.country) + '</td><td class="num">' + c.visits + '</td></tr>').join("")
    || '<tr><td class="muted">No data</td></tr>';
}
function stat(n, l){ return '<div class="stat"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }

// ---- News queue ----
async function loadList() {
  const query = currentView === "polish" ? "polish=needed" : "status=" + currentView;
  const { items } = await api("/api/admin/items?" + query);
  currentItems = items || [];
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
    actions = edit +
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
    (it.slug ? ' <a class="live" href="' + SITE + '/news/' + esc(it.slug) + '/" target="_blank" rel="noopener">/news/' + esc(it.slug) + '/ ↗</a>' : '') +
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
    '<div class="row" style="margin-top:14px">' +
      '<button class="approve" data-act="save" data-id="' + it.id + '">Save</button>' +
      '<button class="ghost" data-act="cancel" data-id="' + it.id + '">Cancel</button>' +
    '</div>' +
    '<div class="muted" style="margin-top:8px">Saved edits are live as soon as the site is rebuilt and deployed.</div>' +
  '</div>';
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
    return;
  }
  if (act === "cancel") { loadList(); return; }

  if (act === "save") {
    const editor = document.querySelector('[data-editor="' + id + '"]');
    const patch = collectEditor(editor);
    if (!patch.body.sections.length) { alert("An article needs at least one section with a heading and a paragraph."); return; }
    b.disabled = true; b.textContent = "Saving…";
    const r = await api("/api/admin/items/" + id, {
      method: "PATCH", headers: {"content-type":"application/json"}, body: JSON.stringify(patch),
    });
    if (r.ok) loadList();
    else { b.disabled = false; b.textContent = "Save"; alert(r.error || "Could not save."); }
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
    else { b.disabled = false; b.textContent = "Mark polished"; alert(r.error || "Could not update."); }
    return;
  }

  // approve / regenerate / humanize all make a large-model call — the first two
  // read the source first. Tell the user it will be slow instead of looking hung.
  const slow = act === "approve" || act === "regenerate" || act === "humanize";
  b.disabled = true;
  const label = b.textContent;
  if (slow) {
    b.textContent = act === "humanize" ? "Humanising…" : "Writing…";
    if (msg) msg.innerHTML = '<div class="spin">' + (act === "humanize"
      ? "Rewriting the prose — 20–40 seconds. The facts and figures are checked against the original before anything is saved."
      : "Reading the source and writing the article — this takes 20–60 seconds. Leave the tab open.") + '</div>';
  }
  const r = await api("/api/admin/items/" + id + "/" + act, { method: "POST" });
  if (r && r.ok === false) {
    b.disabled = false; b.textContent = label;
    if (msg) msg.innerHTML = '<div class="warn">' + esc(r.error || "That did not work.") + '</div>';
    return;
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
  alert("Added " + (r.added ?? 0) + " new item(s) to the pending queue.");
});
$("#submitBtn").addEventListener("click", async () => {
  const url = $("#submitUrl").value.trim(); if (!url) return;
  $("#submitBtn").disabled = true;
  const r = await api("/api/admin/submit", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ url }) });
  $("#submitBtn").disabled = false;
  if (r.ok) { $("#submitUrl").value = ""; showTab("pending"); }
  else alert(r.error || "Could not add that URL.");
});
$("#range").addEventListener("change", loadStats);

// ---- Manual intake ----
// Two requests, not one: insert, then the ordinary approve call that every other
// item goes through. A manual story reaches a page by exactly the same route as
// a swept one, and neither request is left open long enough for a proxy to give
// up on it.
$("#mText").addEventListener("input", () => {
  const n = $("#mText").value.trim().length;
  $("#mCount").textContent = n < 400
    ? n + " characters — 400 minimum."
    : n + " characters.";
});
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
  out.innerHTML = '<span class="muted">Written: <a href="' + SITE + '/news/' + esc(written.slug) +
    '/" target="_blank" rel="noopener">/news/' + esc(written.slug) + '/ ↗</a>' +
    ' — live once the site is rebuilt and deployed.</span>';
  showTab("polish");
});

// The category list comes from the Worker so the select cannot drift out of step
// with what the writer will actually accept.
async function loadCategories() {
  const { categories } = await api("/api/admin/categories");
  $("#mCategory").innerHTML = (categories || ["general"]).map(c =>
    '<option value="' + esc(c) + '"' + (c === "general" ? " selected" : "") + '>' + esc(c) + '</option>').join("");
}

function esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

loadStats(); loadList(); loadCategories();
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
