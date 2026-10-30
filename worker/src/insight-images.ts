/**
 * The insight hero-image panel's client-side script.
 *
 * WHAT WAS HERE BEFORE. Until the CMS moved out of D1 (2026-08-25) this module
 * also carried a full block editor for /insights/ articles — a prose-to-AST
 * parser, a block list, and a save that PUT to /api/admin/insights. Those
 * endpoints have answered 410 Gone ever since, so the editor was a button that
 * could only fail: articles are markdown in content/insights/ and are edited at
 * /admin/ (Sveltia CMS), which commits and deploys in one step. The editor and
 * everything only it used is gone. `shared/blocks.ts` and `shared/validate.ts`
 * are untouched — the site still parses and validates that AST at build time.
 *
 * WHY THE IMAGE PANEL SURVIVED IT. Sveltia has no media library here on purpose
 * (see public/admin/config.yml): hero images live in R2, not in git. So this is
 * the only way an /insights/ article gets a picture, and it is filed against a
 * slug typed by hand rather than picked off a list — an article written straight
 * into the repo never had a D1 row to pick.
 *
 * Lives in its own module for escaping safety. The dashboard is one big template
 * literal, and a template literal eats backslashes: `\{` in the source becomes
 * `{` in the emitted JavaScript. `String.raw` leaves them alone. The one rule
 * that follows from it: **no backticks and no `${` in the raw block below**,
 * because String.raw cannot escape either.
 *
 * It is injected into the dashboard's existing <script>, so it shares `$`,
 * `api()`, `esc()`, `toast()`, `armed()` and the CATEGORIES constant that
 * dashboard.ts serialises out of shared/blocks.ts, along with the news
 * pipeline's `derive()`, `fileFromUrl()` and `uploadAsset()` — function
 * declarations in that script, so they hoist and are simply in scope. The only
 * thing that differs between a news hero and an insight hero is the slot
 * string, which is why there is no second copy of the cropping code here.
 *
 * The picture is stored the moment you save. It appears on the site at the next
 * deploy, when scripts/pull-images.mjs reads the manifest and writes the
 * renditions into public/ for the static export.
 */
export const INSIGHT_IMAGES_JS = String.raw`
var SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function insightSlot(category, slug) { return "insights/" + category + "/" + slug; }

// A figure is an asset with no slot and no social card. The og check matters:
// a hero displaced by a newer upload also loses its slot, and it is not a
// figure anybody chose.
function figureSnippet(id) { return '{% figure asset="' + id + '" caption="" %}'; }

function renderFigures(assets) {
  var el = $("#figureImgList");
  var figs = assets.filter(function (a) { return !a.slot && !a.og_key; });
  if (!figs.length) {
    el.innerHTML = '<div class="empty">No photos uploaded for use inside articles yet.</div>';
    return;
  }
  el.innerHTML = figs.map(function (a) {
    return '<div class="doc">' +
      '<div class="row">' +
        '<img src="' + SITE_API + "/api/images/" + esc(a.id) + '/hero" alt="" ' +
          'style="height:56px;width:56px;object-fit:contain;border-radius:4px;background:#0001">' +
        '<div>' +
          '<div class="muted" style="font-size:.75rem">' +
            esc(a.alt) + (a.credit ? " · " + esc(a.credit) : "") +
            (a.width && a.height ? " · " + a.width + "×" + a.height : "") +
          '</div>' +
          '<input type="text" readonly value="' + esc(figureSnippet(a.id)) + '" ' +
            'onclick="this.select()" style="width:100%;font-family:monospace;font-size:.75rem">' +
        '</div>' +
      '</div>' +
      '<button class="delete mini" data-iidel="' + esc(a.id) + '">Remove</button>' +
    '</div>';
  }).join("");
}

async function loadInsightImages() {
  var el = $("#insightImgList");
  var data = await api("/api/admin/assets");
  var all = (data && data.assets) || [];
  renderFigures(all);
  var mine = all.filter(function (a) {
    return a.slot && a.slot.indexOf("insights/") === 0;
  });
  if (!mine.length) {
    el.innerHTML = '<div class="empty">No insight article has a hero image yet.</div>';
    return;
  }
  el.innerHTML = mine.map(function (a) {
    return '<div class="doc">' +
      '<div class="row">' +
        '<img src="' + SITE_API + "/api/images/" + esc(a.id) + '/hero" alt="" ' +
          'style="height:44px;width:78px;object-fit:cover;border-radius:4px">' +
        '<div>' +
          '<div class="path">/' + esc(a.slot) + '/</div>' +
          '<div class="muted" style="font-size:.75rem">' +
            esc(a.alt || "No alt text — add one, it is what a screen reader announces") +
            (a.credit ? " · " + esc(a.credit) : "") +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="delete mini" data-iidel="' + esc(a.id) + '">Remove</button>' +
    '</div>';
  }).join("");
}

$("#iiKind").addEventListener("change", function () {
  $("#iiWhich").style.display = this.value === "figure" ? "none" : "";
});

// One remove handler for both lists.
["#insightImgList", "#figureImgList"].forEach(function (sel) {
  $(sel).addEventListener("click", function (e) {
    var btn = e.target.closest("[data-iidel]");
    if (btn) removeAsset(btn);
  });
});

async function removeAsset(btn) {
  if (!armed(btn, "Remove — click again")) return;
  btn.disabled = true;
  var r = await api("/api/admin/assets/" + btn.getAttribute("data-iidel"), { method: "DELETE" });
  if (r && r.ok !== false) { toast("Image removed. The article keeps publishing, without a picture.", "good"); await loadInsightImages(); return; }
  btn.disabled = false;
  toast((r && r.error) || "Could not remove it.", "bad");
}

$("#iiSave").addEventListener("click", async function () {
  var b = this;
  var figure = $("#iiKind").value === "figure";
  var slug = ($("#iiSlug").value || "").trim().toLowerCase();
  var file = $("#iiFile").files[0];
  var url = ($("#iiUrl").value || "").trim();
  var alt = ($("#iiAlt").value || "").trim();
  var credit = ($("#iiCredit").value || "").trim();

  // Checked here rather than server-side because a mistyped slug is not an
  // error anywhere — it stores cleanly against an article that does not exist
  // and simply never shows up. Cheaper to refuse the shape than to explain the
  // silence later. A figure has no slug: the article points at it by id.
  if (!figure && !SLUG_RE.test(slug)) {
    toast("Enter the article's slug — the last part of its URL, like malaysian-tax-for-expats.", "bad");
    return;
  }
  if (alt.length < 5) {
    toast("Alt text is required — one line describing what the picture shows.", "bad");
    return;
  }
  if (!file && !url) { toast("Pick a file or paste an image URL.", "bad"); return; }

  b.disabled = true;
  try {
    b.textContent = url && !file ? "Fetching…" : "Resizing…";
    var source = file ? (file.name || null) : url;
    var picked = file || await fileFromUrl(url);
    var derived = await derive(picked, { figure: figure });
    b.textContent = "Uploading…";
    await uploadAsset(derived, {
      slot: figure ? null : insightSlot($("#iiCategory").value, slug),
      alt: alt, credit: credit || null, source: source,
    });
    $("#iiFile").value = ""; $("#iiUrl").value = "";
    $("#iiAlt").value = ""; $("#iiCredit").value = "";
    await loadInsightImages();
    toast(figure
      ? "Photo saved. Copy its line from \"Photos inside articles\" into the article."
      : "Image saved. It reaches the site on the next deploy.", "good");
  } catch (err) {
    toast(String((err && err.message) || err), "bad");
  }
  b.disabled = false;
  b.textContent = "Save image";
});

$("#iiCategory").innerHTML = CATEGORIES.map(function (c) {
  return '<option value="' + esc(c) + '">' + esc(c) + "</option>";
}).join("");

loadInsightImages();
`;
