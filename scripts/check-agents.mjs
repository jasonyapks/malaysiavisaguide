#!/usr/bin/env node
/**
 * Has either official agent register changed since the last import?
 *
 *   npm run agents:check
 *
 * Report-only: it never edits anything and always exits 0 when it could reach
 * the sources, because a changed register is a prompt to re-import, not a
 * broken build. Exits 1 only when a source cannot be fetched or parsed.
 *
 *   - PVIP: the Immigration PDF, compared by SHA-256 to the newest snapshot
 *     in raw/agents/.
 *   - MM2H cross-check: mm2h.gov.my's table, compared by licence and expiry.
 *   - MM2H: MOTAC's register, compared by content (company, licence, expiry)
 *     with src/lib/data/agents.json — the response's HTML wrapping changes
 *     with the site's templates, so its bytes are not a useful signal.
 *
 * To act on a change: save fresh snapshots as raw/agents/<today>-*, run
 * `python3 scripts/import-agents.py <today>`, review, rebuild. See
 * wiki/agents.md.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const RAW = join(ROOT, "raw/agents");
const PVIP_URL =
  "https://imigresen-online.imi.gov.my/eservices/doc/AUTHORISED_MALAYSIA_PREMIUM_VISA_PROGRAMME_AGENCIES.pdf";
const MOTAC_AJAX = "https://www.motac.gov.my/wp-admin/admin-ajax.php";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36";

const newest = (suffix) =>
  readdirSync(RAW)
    .filter((f) => f.endsWith(suffix))
    .sort()
    .at(-1);

const data = JSON.parse(readFileSync(join(ROOT, "src/lib/data/agents.json"), "utf8"));
let changed = false;

// --- PVIP ---------------------------------------------------------------
{
  const res = await fetch(PVIP_URL, { headers: { "User-Agent": UA } });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.includes("pdf")) {
    console.error(`PVIP: could not fetch the PDF (${res.status}, ${type})`);
    process.exit(1);
  }
  const live = createHash("sha256").update(Buffer.from(await res.arrayBuffer())).digest("hex");
  const file = newest("-imi-pvip-agencies.pdf");
  const saved = createHash("sha256").update(readFileSync(join(RAW, file))).digest("hex");
  if (live === saved) {
    console.log(`PVIP: unchanged since ${file}`);
  } else {
    changed = true;
    console.log(`PVIP: CHANGED — the live PDF differs from ${file}`);
  }
}

// --- MM2H ---------------------------------------------------------------
{
  const form = new FormData();
  for (const [k, v] of Object.entries({
    action: "motac_semakan_filter",
    kategori: "syarikat-mm2h-berlesen",
    search: "",
    negeri: "",
    klasifikasi: "",
    jenis: "",
    page: "1",
    per_page: "1000",
  }))
    form.append(k, v);
  const res = await fetch(MOTAC_AJAX, { method: "POST", body: form, headers: { "User-Agent": UA } });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.includes("json")) {
    console.error(`MM2H: could not query MOTAC (${res.status}, ${type})`);
    process.exit(1);
  }
  const body = await res.json();
  const html = body?.data?.html ?? "";
  const rows = html
    .split('<div class="motac-card">')
    .slice(1)
    .map((card) => {
      const name = card.match(/class="company-name">([\s\S]*?)<\/div>/)?.[1];
      const licence = card.match(/class="col col-lesen">([\s\S]*?)<\/div>/)?.[1];
      const to = [...card.split("col-tempoh")[1].matchAll(/<span>([\s\S]*?)<\/span>/g)][1]?.[1];
      return [name, licence, to].map((s) => (s ?? "").replace(/\s+|~/g, " ").trim()).join(" | ");
    });
  if (rows.length !== Number(body?.data?.total)) {
    console.error(`MM2H: parsed ${rows.length} rows of ${body?.data?.total}; the page format has changed`);
    process.exit(1);
  }
  // Compare names punctuation-blind: one company's HQ and branch rows spell
  // "SDN BHD" differently, and the import keeps only the first spelling.
  const key = (row) =>
    row
      .replace(/&amp;/g, "&")
      .replace(/&#0?39;/g, "'")
      .replace(/^[^|]*/, (n) => n.toUpperCase().replace(/[^A-Z0-9]/g, ""));
  const ddmmyy = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
  const ours = data.companies.flatMap((c) =>
    c.mm2h.filter((l) => l.motac).map((l) => [c.name.replace(/\s+/g, " "), l.licence, ddmmyy(l.motac[1])].join(" | ")),
  );
  const live = new Set(rows.map(key));
  const mine = new Set(ours.map(key));
  const added = [...live].filter((r) => !mine.has(r));
  const gone = [...mine].filter((r) => !live.has(r));
  if (!added.length && !gone.length) {
    console.log(`MM2H: unchanged since the ${data.checked} import (${rows.length} licences)`);
  } else {
    changed = true;
    console.log(`MM2H: CHANGED — ${added.length} new or renewed, ${gone.length} gone or renewed`);
    for (const r of added) console.log(`  + ${r}`);
    for (const r of gone) console.log(`  - ${r}`);
  }
}

// --- MM2H cross-check list (mm2h.gov.my) ---------------------------------
{
  const res = await fetch("https://www.mm2h.gov.my/agencies", { headers: { "User-Agent": UA } });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.includes("html")) {
    console.error(`mm2h.gov.my: could not fetch (${res.status}, ${type})`);
    process.exit(1);
  }
  const page = await res.text();
  const table = page.slice(page.indexOf("<table"), page.indexOf("</table>"));
  const lic = (l) => {
    const m = l.toUpperCase().replace(/\s|KPK\/LN:/g, "").match(/^MM2H0*(\d+)(\/\d+)?$/);
    return m ? `MM2H${m[1]}${m[2] ?? ""}` : l;
  };
  const iso = (d) => {
    const [dd, mm, yy] = d.trim().split("/");
    return `${yy}-${mm}-${dd}`;
  };
  const live = new Set(
    [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].slice(1).map(([row]) => {
      const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
        m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      );
      return `${lic(tds[1])} | ${iso(tds[4].split(" - ")[1])}`;
    }),
  );
  if (!live.size) {
    console.error("mm2h.gov.my: no rows parsed; the page format has changed");
    process.exit(1);
  }
  const mine = new Set(
    data.companies.flatMap((c) =>
      c.mm2h.filter((l) => l.mm2hgov).map((l) => `${lic(l.mm2hgovLicence ?? l.licence)} | ${l.mm2hgov[1]}`),
    ),
  );
  const added = [...live].filter((r) => !mine.has(r));
  const gone = [...mine].filter((r) => !live.has(r));
  if (!added.length && !gone.length) {
    console.log(`mm2h.gov.my: unchanged since the ${data.checked} import (${live.size} licences)`);
  } else {
    changed = true;
    console.log(`mm2h.gov.my: CHANGED — ${added.length} new or renewed, ${gone.length} gone or renewed`);
    for (const r of added) console.log(`  + ${r}`);
    for (const r of gone) console.log(`  - ${r}`);
  }
}

if (changed) console.log("\nRe-import: see the header of this script, or wiki/agents.md.");
