/**
 * The insight editor's client-side script — Phase 5.
 *
 * Lives in its own module purely for escaping safety. The dashboard is one big
 * template literal, and a template literal eats backslashes: `\{` in the source
 * becomes `{` in the emitted JavaScript, which would quietly break every regex
 * and every escape sequence below. `String.raw` leaves them alone. The one rule
 * that follows from it: **no backticks and no `${` in this file's raw block**,
 * because String.raw cannot escape either.
 *
 * It is injected into the dashboard's existing <script>, so it shares `$`,
 * `api()`, `esc()` and the CATEGORIES / PROGRAMMES / BLOCK_TYPES constants that
 * dashboard.ts serialises out of shared/blocks.ts.
 */
export const EDITOR_JS = String.raw`
/* ------------------------------------------------------------------ *
 * Prose to AST, and back.
 *
 * The body is a typed AST and has to stay one — that is what keeps a
 * <script> off a reader's page and stops the design system being optional.
 * But nobody writes an AST by hand, so inline content is edited as text in
 * a small markdown-ish syntax:
 *
 *   **bold**   _italic_   [label](/visas/pvip/)   ((caveat))
 *   {{pvip:participationFee:money}}   <- a live figure, resolved at build
 *
 * Emphasis is _underscore_ and not *asterisk*, which is the unusual choice
 * here and the one worth explaining. With both markers built from the same
 * character, an italic closing at the end of a bold run emits *** — and ***
 * cannot be parsed back unambiguously. The self-check below cannot rescue
 * it either, because the ambiguity is in the structural markers rather than
 * in the escaped text. Underscore removes the collision at the source, and
 * has the side benefit that a lone asterisk in prose needs no escaping.
 *
 * The parser is total. A half-typed ** stays literal text rather than
 * throwing, because the field being typed into must not explode mid-word.
 *
 * The round trip is the part that has to be exact: a lossy write would
 * corrupt an article on save, silently, with no error anywhere. So
 * writeInline() checks itself — it escapes minimally, parses its own output
 * back, compares, and falls back to escaping every marker character if the
 * two do not match.
 *
 * One deliberate asymmetry: an empty text node is dropped rather than
 * round-tripped, because there is no text to write and nothing renders from
 * it either way.
 * ------------------------------------------------------------------ */

function findClose(src, from, marker) {
  var i = from;
  while (i < src.length) {
    if (src.charAt(i) === "\\") { i += 2; continue; }
    if (src.startsWith(marker, i)) return i;
    i += 1;
  }
  return -1;
}

function stripEscapes(s) {
  var out = "";
  for (var i = 0; i < s.length; i++) {
    if (s.charAt(i) === "\\" && i + 1 < s.length) { out += s.charAt(i + 1); i += 1; }
    else out += s.charAt(i);
  }
  return out;
}

function parseInline(src) {
  var out = [];
  var buf = "";
  function flush() { if (buf) { out.push({ t: "text", v: buf }); buf = ""; } }

  var i = 0;
  while (i < src.length) {
    var c = src.charAt(i);

    if (c === "\\" && i + 1 < src.length) { buf += src.charAt(i + 1); i += 2; continue; }

    if (src.startsWith("**", i)) {
      var sEnd = findClose(src, i + 2, "**");
      if (sEnd >= 0) {
        flush(); out.push({ t: "strong", c: parseInline(src.slice(i + 2, sEnd)) });
        i = sEnd + 2; continue;
      }
    }
    if (c === "_") {
      var eEnd = findClose(src, i + 1, "_");
      if (eEnd >= 0) {
        flush(); out.push({ t: "em", c: parseInline(src.slice(i + 1, eEnd)) });
        i = eEnd + 1; continue;
      }
    }
    if (src.startsWith("((", i)) {
      var nEnd = findClose(src, i + 2, "))");
      if (nEnd >= 0) {
        flush(); out.push({ t: "note", c: parseInline(src.slice(i + 2, nEnd)) });
        i = nEnd + 2; continue;
      }
    }
    if (src.startsWith("{{", i)) {
      var fEnd = findClose(src, i + 2, "}}");
      if (fEnd >= 0) {
        var parts = src.slice(i + 2, fEnd).split(":");
        if (parts.length === 3) {
          flush();
          out.push({ t: "fig", programme: parts[0], field: parts[1], fmt: parts[2] });
          i = fEnd + 2; continue;
        }
      }
    }
    if (c === "[") {
      var lEnd = findClose(src, i + 1, "]");
      if (lEnd >= 0 && src.charAt(lEnd + 1) === "(") {
        var hEnd = findClose(src, lEnd + 2, ")");
        if (hEnd >= 0) {
          flush();
          out.push({
            t: "link",
            href: stripEscapes(src.slice(lEnd + 2, hEnd)),
            c: parseInline(src.slice(i + 1, lEnd)),
          });
          i = hEnd + 1; continue;
        }
      }
    }

    buf += c; i += 1;
  }
  flush();
  return out;
}

function escText(v, hard) {
  if (hard) return v.replace(/([\\*_\[\](){}])/g, "\\$1");
  // Only what would actually parse: the backslash itself, the emphasis marker,
  // a link opener, and the three doubled openers. A lone asterisk, paren or
  // brace is left alone — prose is full of them and escaping all of them makes
  // the field unreadable to write in.
  return v
    .replace(/\\/g, "\\\\")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\*\*/g, "\\*\\*")
    .replace(/\(\(/g, "\\(\\(")
    .replace(/\{\{/g, "\\{\\{");
}

function emitInline(nodes, hard) {
  return (nodes || []).map(function (n) {
    if (n.t === "text") return escText(String(n.v == null ? "" : n.v), hard);
    if (n.t === "strong") return "**" + emitInline(n.c, hard) + "**";
    if (n.t === "em") return "_" + emitInline(n.c, hard) + "_";
    if (n.t === "note") return "((" + emitInline(n.c, hard) + "))";
    if (n.t === "fig") return "{{" + n.programme + ":" + n.field + ":" + n.fmt + "}}";
    if (n.t === "link") {
      return "[" + emitInline(n.c, hard) + "](" + String(n.href).replace(/([\\()])/g, "\\$1") + ")";
    }
    return "";
  }).join("");
}

/**
 * Structural equality, written out rather than done with JSON.stringify:
 * stringify compares key ORDER too, and a node built by the parser has its
 * keys in a different order from the same node loaded out of D1. That would
 * report every document as lossy and push every save down the hard-escape
 * path — correct output, unreadable source.
 */
function sameInline(a, b) {
  a = a || []; b = b || [];
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) {
    var x = a[i], y = b[i];
    if (x.t !== y.t) return false;
    if (x.t === "text") { if (x.v !== y.v) return false; }
    else if (x.t === "fig") {
      if (x.programme !== y.programme || x.field !== y.field || x.fmt !== y.fmt) return false;
    } else if (x.t === "link") {
      if (x.href !== y.href || !sameInline(x.c, y.c)) return false;
    } else if (!sameInline(x.c, y.c)) return false;
  }
  return true;
}

function writeInline(nodes) {
  var minimal = emitInline(nodes, false);
  if (sameInline(parseInline(minimal), nodes)) return minimal;
  return emitInline(nodes, true);
}

/* Table cells are pipe-separated, so a literal pipe inside one needs hiding.
   writeInline never emits a bare backslash-pipe, so this pair is unambiguous. */
function cellOut(nodes) { return writeInline(nodes).replace(/\|/g, "\\|"); }
function cellIn(s) { return parseInline(s.replace(/\\\|/g, "|")); }
function splitCells(line) {
  var parts = [], cur = "";
  for (var i = 0; i < line.length; i++) {
    if (line.charAt(i) === "\\" && i + 1 < line.length) { cur += line.charAt(i) + line.charAt(i + 1); i += 1; continue; }
    if (line.charAt(i) === "|") { parts.push(cur.trim()); cur = ""; continue; }
    cur += line.charAt(i);
  }
  parts.push(cur.trim());
  return parts;
}

/* ------------------------------------------------------------------ *
 * Document list and editor state
 * ------------------------------------------------------------------ */

var docs = [];
var doc = null;      // the document being edited, or null
var docId = null;    // its id, or null for a new one
var figures = null;  // public/figures.json, for the picker's previews

function blankDoc() {
  return {
    slug: "", category: "expat-living", title: "", dek: "",
    published: today(), reviewed: today(), readingMinutes: 6,
    relatedGuides: [{ path: "/visas/pvip/", title: "the PVIP guide" }],
    draft: true,
    blocks: [{ t: "paragraph", c: [] }],
    faq: [],
    sources: [],
  };
}

function today() { return new Date().toISOString().slice(0, 10); }

async function loadDocs() {
  var data = await api("/api/admin/insights");
  docs = (data && data.items) || [];
  renderDocs();
}

function renderDocs() {
  var el = $("#docList");
  if (!docs.length) {
    el.innerHTML = '<div class="empty">No articles yet. The two comparison pieces are still hand-written in the repo.</div>';
    return;
  }
  el.innerHTML = docs.map(function (d) {
    return '<div class="doc">' +
      '<div>' +
        '<h3>' + esc(d.title) + '</h3>' +
        '<div class="path">/insights/' + esc(d.category) + '/' + esc(d.slug) + '/</div>' +
      '</div>' +
      '<div class="row">' +
        '<span class="pill ' + (d.draft ? "draft" : "live") + '">' + (d.draft ? "Draft" : "Live") + '</span>' +
        '<button class="ghost mini" data-doc="' + esc(d.id) + '">Edit</button>' +
      '</div>' +
    '</div>';
  }).join("");
}

async function openDoc(id) {
  if (id) {
    var r = await api("/api/admin/insights/" + encodeURIComponent(id));
    if (!r || !r.item) { alert("Could not load that article."); return; }
    doc = r.item; docId = id;
  } else {
    doc = blankDoc(); docId = null;
  }
  if (!figures) {
    figures = await api("/api/admin/figures").catch(function () { return null; });
  }
  renderEditor();
  $("#editor").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ------------------------------------------------------------------ *
 * Rendering the form
 * ------------------------------------------------------------------ */

function opts(list, sel) {
  return list.map(function (v) {
    return '<option value="' + esc(v) + '"' + (v === sel ? " selected" : "") + ">" + esc(v) + "</option>";
  }).join("");
}

function field(label, html) {
  return '<div><label>' + esc(label) + "</label>" + html + "</div>";
}

function renderEditor() {
  var d = doc;
  var h = "";

  h += '<div class="row" style="justify-content:space-between; margin-bottom:12px">' +
    "<h2>" + (docId ? "Editing" : "New article") + "</h2>" +
    '<div class="row">' +
      '<button class="ghost" id="edCancel">Close</button>' +
      (docId ? '<button class="delete" id="edDelete">Delete</button>' : "") +
      '<button class="approve" id="edSave">Save</button>' +
    "</div></div>";

  h += '<div id="edMsg"></div>';

  h += '<div class="grid">' +
    field("Title", '<input type="text" id="fTitle" value="' + esc(d.title) + '">') +
    field("Slug", '<input type="text" id="fSlug" value="' + esc(d.slug) + '">') +
    field("Category", '<select id="fCategory">' + opts(CATEGORIES, d.category) + "</select>") +
    field("Reading minutes", '<input type="number" min="1" id="fMinutes" value="' + esc(d.readingMinutes) + '">') +
    field("Published", '<input type="date" id="fPublished" value="' + esc(d.published) + '">') +
    field("Reviewed", '<input type="date" id="fReviewed" value="' + esc(d.reviewed) + '">') +
  "</div>";

  h += '<div style="margin-top:12px">' +
    field("Standfirst — this is the meta description too, so it has to stand alone in a search result",
      '<textarea id="fDek" rows="3">' + esc(d.dek) + "</textarea>") +
  "</div>";

  h += '<div class="row" style="margin:12px 0">' +
    '<label style="margin:0"><input type="checkbox" id="fDraft"' + (d.draft ? " checked" : "") +
    '> Draft — reviewable at its real URL, noindex, out of the sitemap and every listing</label>' +
  "</div>";

  h += '<div style="margin-top:12px">' +
    field("Related guides — one per line, path | title",
      '<textarea id="fGuides" rows="3">' +
      esc(d.relatedGuides.map(function (g) { return g.path + " | " + g.title; }).join("\n")) +
      "</textarea>") +
  "</div>";

  h += "<h3 style=\"margin:18px 0 8px\">Body</h3>";
  h += '<p class="syntax">**bold**  _italic_  [label](/visas/pvip/)  ((caveat))  {{programme:field:format}}</p>';
  h += '<div id="blocks">' + d.blocks.map(renderBlock).join("") + "</div>";
  h += '<div class="row" style="margin-top:10px">' +
    '<select id="newBlockType">' + opts(BLOCK_TYPES, "paragraph") + "</select>" +
    '<button class="ghost" id="addBlock">Add block</button>' +
    (figures ? '<button class="ghost" id="figHelp">Figure reference…</button>' : "") +
  "</div>";

  h += '<div style="margin-top:18px">' +
    field("FAQ — one per group: first line the question, the rest the answer, blank line between groups. Rendered, and emitted as FAQPage structured data from the same text.",
      '<textarea id="fFaq" rows="8">' +
      esc(d.faq.map(function (f) { return f.q + "\n" + f.a; }).join("\n\n")) +
      "</textarea>") +
  "</div>";

  h += '<div style="margin-top:12px">' +
    field("Sources — one per line, label | url | YYYY-MM-DD verified. At least one; every figure has to trace to one.",
      '<textarea id="fSources" rows="5">' +
      esc(d.sources.map(function (s) { return s.label + " | " + s.url + " | " + s.verified; }).join("\n")) +
      "</textarea>") +
  "</div>";

  var ed = $("#editor");
  ed.innerHTML = h;
  ed.hidden = false;
}

function blockHead(i, kind) {
  return '<div class="hd">' +
    '<span class="kind">' + esc(kind) + "</span>" +
    '<button class="mini" data-blk="up" data-i="' + i + '" title="Move up">&uarr;</button>' +
    '<button class="mini" data-blk="down" data-i="' + i + '" title="Move down">&darr;</button>' +
    '<button class="mini" data-blk="del" data-i="' + i + '" title="Remove">&times;</button>' +
  "</div>";
}

function ta(i, name, value, rows) {
  return '<textarea data-i="' + i + '" data-f="' + name + '" rows="' + (rows || 3) + '">' + esc(value) + "</textarea>";
}

function renderBlock(b, i) {
  var body = "";

  if (b.t === "heading") {
    body = '<div class="rowline">' +
      '<select data-i="' + i + '" data-f="level" style="flex:0 0 90px">' +
        '<option value="2"' + (b.level === 2 ? " selected" : "") + ">H2</option>" +
        '<option value="3"' + (b.level === 3 ? " selected" : "") + ">H3</option>" +
      "</select>" +
      '<input type="text" data-i="' + i + '" data-f="c" value="' + esc(writeInline(b.c)) + '">' +
    "</div>";

  } else if (b.t === "paragraph" || b.t === "pullquote" || b.t === "cta") {
    body = ta(i, "c", writeInline(b.c), b.t === "paragraph" ? 4 : 3);

  } else if (b.t === "list") {
    body = '<label><input type="checkbox" data-i="' + i + '" data-f="ordered"' +
      (b.ordered ? " checked" : "") + "> Numbered</label>" +
      ta(i, "items", (b.items || []).map(writeInline).join("\n"), 5) +
      '<p class="syntax">One item per line.</p>';

  } else if (b.t === "callout") {
    body = '<div class="rowline">' +
      '<select data-i="' + i + '" data-f="tone" style="flex:0 0 130px">' +
        '<option value="info"' + (b.tone === "info" ? " selected" : "") + ">Info</option>" +
        '<option value="warning"' + (b.tone === "warning" ? " selected" : "") + ">Warning</option>" +
      "</select>" +
      '<input type="text" data-i="' + i + '" data-f="title" placeholder="Title (optional)" value="' + esc(b.title || "") + '">' +
    "</div>" +
    ta(i, "body", (b.body || []).map(writeInline).join("\n\n"), 4) +
    '<p class="syntax">Blank line between paragraphs.</p>';

  } else if (b.t === "table") {
    var rows = (b.rows || []).map(function (r) {
      return [cellOut(r.label)].concat((r.cells || []).map(function (c) {
        return cellOut(c.value) + (c.note ? " ^" + c.note : "");
      })).join(" | ");
    }).join("\n");
    body = '<div class="cell">' +
      '<input type="text" data-i="' + i + '" data-f="caption" placeholder="Caption" value="' + esc(b.caption || "") + '">' +
    "</div>" +
    '<div class="cell"><input type="text" data-i="' + i + '" data-f="head" value="' + esc((b.head || []).join(" | ")) + '"></div>' +
    '<p class="syntax">Columns above, pipe-separated — the first is the row-label column and is usually empty.</p>' +
    ta(i, "rows", rows, 6) +
    '<p class="syntax">One row per line: label | cell | cell. Add ^1 to a cell to hang footnote 1 on it.</p>' +
    ta(i, "notes", (b.notes || []).map(writeInline).join("\n"), 3) +
    '<p class="syntax">Footnotes, one per line. The long conditions that must not sit inside a cell.</p>';

  } else if (b.t === "figure") {
    body = '<div class="rowline">' +
      '<input type="text" data-i="' + i + '" data-f="assetId" placeholder="Asset id" value="' + esc(b.assetId || "") + '">' +
      '<input type="text" data-i="' + i + '" data-f="aspect" placeholder="Aspect, e.g. 16/9" value="' + esc(b.aspect || "") + '">' +
    "</div>" +
    '<input type="text" data-i="' + i + '" data-f="caption" placeholder="Caption" value="' + esc(b.caption || "") + '">';

  } else if (b.t === "programmeNotice" || b.t === "keyFacts") {
    body = '<select data-i="' + i + '" data-f="programme">' + opts(PROGRAMMES, b.programme) + "</select>";

  } else if (b.t === "tierTable") {
    body = '<div class="rowline">' +
      '<input type="text" data-i="' + i + '" data-f="programmes" value="' + esc((b.programmes || []).join(", ")) + '">' +
      '<select data-i="' + i + '" data-f="variant" style="flex:0 0 160px">' +
        '<option value=""' + (!b.variant ? " selected" : "") + ">(default)</option>" +
        '<option value="long-stay"' + (b.variant === "long-stay" ? " selected" : "") + ">Long stay</option>" +
        '<option value="work-study"' + (b.variant === "work-study" ? " selected" : "") + ">Work / study</option>" +
      "</select>" +
    "</div>" +
    '<input type="text" data-i="' + i + '" data-f="caption" placeholder="Caption" value="' + esc(b.caption || "") + '">' +
    '<p class="syntax">Programmes, comma-separated: ' + esc(PROGRAMMES.join(", ")) + "</p>";
  }

  return '<div class="blk" data-i="' + i + '" data-t="' + esc(b.t) + '">' + blockHead(i, b.t) + body + "</div>";
}

/* ------------------------------------------------------------------ *
 * Reading the form back
 * ------------------------------------------------------------------ */

function val(i, name) {
  var el = document.querySelector('[data-i="' + i + '"][data-f="' + name + '"]');
  if (!el) return "";
  return el.type === "checkbox" ? el.checked : el.value;
}

function lines(s) {
  return String(s).split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
}

function collectBlock(b, i) {
  var t = b.t;
  if (t === "heading") return { t: t, level: Number(val(i, "level")), c: parseInline(val(i, "c")) };
  if (t === "paragraph" || t === "pullquote" || t === "cta") return { t: t, c: parseInline(val(i, "c")) };
  if (t === "list") {
    var out = { t: t, items: lines(val(i, "items")).map(parseInline) };
    if (val(i, "ordered")) out.ordered = true;
    return out;
  }
  if (t === "callout") {
    var o = { t: t, tone: val(i, "tone"), body: String(val(i, "body")).split(/\n\s*\n/)
      .map(function (p) { return p.trim(); }).filter(Boolean).map(parseInline) };
    var title = String(val(i, "title")).trim();
    if (title) o.title = title;
    return o;
  }
  if (t === "table") {
    var head = splitCells(val(i, "head"));
    var notes = lines(val(i, "notes")).map(parseInline);
    var rows = lines(val(i, "rows")).map(function (line) {
      var cells = splitCells(line);
      return {
        label: cellIn(cells[0] || ""),
        cells: cells.slice(1).map(function (raw) {
          var m = raw.match(/\s\^(\d+)$/);
          var cell = { value: cellIn(m ? raw.slice(0, m.index) : raw) };
          if (m) cell.note = Number(m[1]);
          return cell;
        }),
      };
    });
    var tb = { t: t, head: head, rows: rows };
    var cap = String(val(i, "caption")).trim();
    if (cap) tb.caption = cap;
    if (notes.length) tb.notes = notes;
    return tb;
  }
  if (t === "figure") {
    var f = { t: t, assetId: String(val(i, "assetId")).trim() };
    var fc = String(val(i, "caption")).trim();
    var fa = String(val(i, "aspect")).trim();
    if (fc) f.caption = fc;
    if (fa) f.aspect = fa;
    return f;
  }
  if (t === "programmeNotice" || t === "keyFacts") return { t: t, programme: val(i, "programme") };
  if (t === "tierTable") {
    var tt = { t: t, programmes: String(val(i, "programmes")).split(",")
      .map(function (s) { return s.trim(); }).filter(Boolean) };
    var tc = String(val(i, "caption")).trim();
    var tv = String(val(i, "variant")).trim();
    if (tc) tt.caption = tc;
    if (tv) tt.variant = tv;
    return tt;
  }
  return b;
}

function collect() {
  var d = {
    slug: $("#fSlug").value.trim(),
    category: $("#fCategory").value,
    title: $("#fTitle").value.trim(),
    dek: $("#fDek").value.trim(),
    published: $("#fPublished").value,
    reviewed: $("#fReviewed").value,
    readingMinutes: Number($("#fMinutes").value),
    draft: $("#fDraft").checked,
    relatedGuides: lines($("#fGuides").value).map(function (l) {
      var p = l.split("|").map(function (s) { return s.trim(); });
      return { path: p[0] || "", title: p[1] || "" };
    }),
    blocks: doc.blocks.map(collectBlock),
    faq: String($("#fFaq").value).split(/\n\s*\n/).map(function (g) {
      var ls = g.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      if (!ls.length) return null;
      return { q: ls[0], a: ls.slice(1).join(" ") };
    }).filter(Boolean),
    sources: lines($("#fSources").value).map(function (l) {
      var p = l.split("|").map(function (s) { return s.trim(); });
      return { label: p[0] || "", url: p[1] || "", verified: p[2] || "" };
    }),
  };
  return d;
}

/* Keep edits to the blocks that are on screen before a structural change
   re-renders them all — otherwise adding a block discards the paragraph
   just typed. */
function syncBlocks() { doc.blocks = doc.blocks.map(collectBlock); }

function rerenderBlocks() {
  $("#blocks").innerHTML = doc.blocks.map(renderBlock).join("");
}

/* ------------------------------------------------------------------ *
 * Saving
 * ------------------------------------------------------------------ */

function showMsg(html) { $("#edMsg").innerHTML = html; }

async function saveDoc() {
  var payload = collect();
  var path = docId ? "/api/admin/insights/" + encodeURIComponent(docId) : "/api/admin/insights";
  var res = await api(path, {
    method: docId ? "PUT" : "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res || !res.ok) {
    var list = (res && res.errors) ? "<ul>" + res.errors.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" : "";
    showMsg('<div class="errs"><strong>' + esc((res && res.error) || "Save failed.") + "</strong>" + list + "</div>");
    return;
  }

  doc = payload;
  docId = res.id;
  showMsg('<div class="ok">Saved. Nothing is visible to a reader until the site is rebuilt — use Publish at the top. ' +
    '<a href="' + esc(SITE) + "/insights/" + esc(payload.category) + "/" + esc(payload.slug) + '/" target="_blank" rel="noopener">View the page</a>.</div>');
  await loadDocs();
}

/* ------------------------------------------------------------------ *
 * Wiring
 * ------------------------------------------------------------------ */

$("#newDoc").addEventListener("click", function () { openDoc(null); });

$("#docList").addEventListener("click", function (e) {
  var btn = e.target.closest("[data-doc]");
  if (btn) openDoc(btn.getAttribute("data-doc"));
});

$("#editor").addEventListener("click", async function (e) {
  var t = e.target;

  if (t.id === "edCancel") { $("#editor").hidden = true; doc = null; docId = null; return; }
  if (t.id === "edSave") { await saveDoc(); return; }

  if (t.id === "edDelete") {
    // No confirm() — a modal dialog blocks the whole page, and this panel is
    // reached by one click from a list that shows what the row is.
    if (t.dataset.armed !== "1") { t.dataset.armed = "1"; t.textContent = "Delete — click again"; return; }
    await api("/api/admin/insights/" + encodeURIComponent(docId), { method: "DELETE" });
    $("#editor").hidden = true; doc = null; docId = null;
    await loadDocs();
    return;
  }

  if (t.id === "addBlock") {
    syncBlocks();
    doc.blocks.push(newBlock($("#newBlockType").value));
    rerenderBlocks();
    return;
  }

  if (t.id === "figHelp") { showFigures(); return; }

  var act = t.getAttribute && t.getAttribute("data-blk");
  if (act) {
    var i = Number(t.getAttribute("data-i"));
    syncBlocks();
    if (act === "del") doc.blocks.splice(i, 1);
    if (act === "up" && i > 0) doc.blocks.splice(i - 1, 0, doc.blocks.splice(i, 1)[0]);
    if (act === "down" && i < doc.blocks.length - 1) doc.blocks.splice(i + 1, 0, doc.blocks.splice(i, 1)[0]);
    if (!doc.blocks.length) doc.blocks.push({ t: "paragraph", c: [] });
    rerenderBlocks();
  }
});

function newBlock(t) {
  if (t === "heading") return { t: t, level: 2, c: [] };
  if (t === "list") return { t: t, items: [] };
  if (t === "callout") return { t: t, tone: "info", body: [] };
  if (t === "table") return { t: t, head: ["", "", ""], rows: [] };
  if (t === "figure") return { t: t, assetId: "" };
  if (t === "programmeNotice" || t === "keyFacts") return { t: t, programme: PROGRAMMES[0] };
  if (t === "tierTable") return { t: t, programmes: [PROGRAMMES[0]] };
  return { t: t, c: [] };
}

/**
 * The figure reference. Not a click-to-insert picker: the catalogue is a flat
 * list of what every programme resolves to right now, which is the thing worth
 * seeing before typing a reference. Copy the token out of it.
 */
function showFigures() {
  if (!figures || !figures.programmes) { showMsg('<div class="errs">figures.json could not be read — the site has not been built since Phase 5, or SITE_ORIGIN is wrong.</div>'); return; }
  var rows = [];
  figures.programmes.forEach(function (p) {
    Object.keys(p.values || {}).forEach(function (fieldId) {
      Object.keys(p.values[fieldId]).forEach(function (fmt) {
        rows.push("<tr><td><code>{{" + esc(p.id) + ":" + esc(fieldId) + ":" + esc(fmt) +
          "}}</code></td><td>" + esc(p.values[fieldId][fmt]) + "</td></tr>");
      });
    });
  });
  showMsg('<div class="ok" style="max-height:340px; overflow:auto"><strong>Live figures</strong> — as at ' +
    esc((figures.generatedAt || "").slice(0, 10)) +
    ', one deploy stale at worst. <table>' + rows.join("") + "</table></div>");
}

loadDocs();
`;
