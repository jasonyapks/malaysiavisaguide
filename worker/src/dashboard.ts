/**
 * The private dashboard, served only to Jason (behind Cloudflare Access).
 * Self-contained HTML + vanilla JS — it talks to the same Worker's /api/admin
 * routes, whose requests carry the Access cookie automatically. No framework,
 * no external requests, so it works under a strict CSP.
 */
export function dashboardHtml(email: string): string {
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
  .muted { color:var(--ink-muted); font-size:.85rem; }
  .empty { color:var(--ink-muted); padding:16px 0; }
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
      <button class="ghost" id="refresh">Fetch latest now</button>
    </div>
    <div class="row" style="margin:8px 0 16px">
      <input type="url" id="submitUrl" placeholder="Paste an article URL to add it manually…">
      <button class="approve" id="submitBtn">Add</button>
    </div>
    <div class="tabs">
      <button class="tab active" data-status="pending">Pending</button>
      <button class="tab" data-status="approved">Approved (live)</button>
      <button class="tab" data-status="rejected">Rejected</button>
    </div>
    <div id="list"><div class="empty">Loading…</div></div>
  </section>

</main>
<script>
const $ = (s) => document.querySelector(s);
let currentStatus = "pending";

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
  const { items } = await api("/api/admin/items?status=" + currentStatus);
  if (!items || !items.length) { $("#list").innerHTML = '<div class="empty">Nothing here.</div>'; return; }
  $("#list").innerHTML = items.map(renderItem).join("");
}
function renderItem(it) {
  const date = it.published_at ? new Date(it.published_at).toLocaleDateString() : "";
  const actions = currentStatus === "pending"
    ? '<button class="approve" data-act="approve" data-id="' + it.id + '">Approve</button>' +
      '<button class="reject" data-act="reject" data-id="' + it.id + '">Reject</button>'
    : '<button class="delete" data-act="delete" data-id="' + it.id + '">Delete</button>' +
      (currentStatus === "rejected"
        ? '<button class="approve" data-act="approve" data-id="' + it.id + '">Approve</button>' : '');
  return '<div class="item">' +
    '<span class="cat">' + esc(it.category) + '</span>' +
    '<h3>' + esc(it.title) + '</h3>' +
    '<p>' + esc(it.summary) + '</p>' +
    '<div class="meta">Source: <a href="' + esc(it.source_url) + '" target="_blank" rel="noopener">' +
      esc(it.source_name) + '</a>' + (date ? ' · ' + date : '') + '</div>' +
    '<div class="row" style="margin-top:10px">' + actions + '</div>' +
  '</div>';
}

// ---- events ----
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active"); currentStatus = t.dataset.status; loadList();
}));
$("#list").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  b.disabled = true;
  await api("/api/admin/items/" + b.dataset.id + "/" + b.dataset.act, { method: "POST" });
  loadList();
});
$("#refresh").addEventListener("click", async (e) => {
  e.target.disabled = true; e.target.textContent = "Fetching…";
  const r = await api("/api/admin/refresh", { method: "POST" });
  e.target.disabled = false; e.target.textContent = "Fetch latest now";
  currentStatus = "pending";
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x.dataset.status === "pending"));
  loadList();
  alert("Added " + (r.added ?? 0) + " new item(s) to the pending queue.");
});
$("#submitBtn").addEventListener("click", async () => {
  const url = $("#submitUrl").value.trim(); if (!url) return;
  $("#submitBtn").disabled = true;
  const r = await api("/api/admin/submit", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ url }) });
  $("#submitBtn").disabled = false;
  if (r.ok) { $("#submitUrl").value = ""; currentStatus = "pending"; loadList(); }
  else alert(r.error || "Could not add that URL.");
});
$("#range").addEventListener("change", loadStats);

function esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

loadStats(); loadList();
</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
