#!/usr/bin/env node
/**
 * Emit public/figures.json — the catalogue the dashboard's figure picker reads.
 *
 * Every field a `fig` node may address, for every programme, with the value it
 * currently resolves to. The picker's job in Phase 5 is to let Jason insert a
 * live figure and see what it will say; that preview is the ergonomics that
 * matter, and it needs the resolved text.
 *
 * ## Why it is a build artifact and not an API
 *
 * The numbers live in src/lib/data/programmes.ts, which is site source. The
 * Worker has no way to read a TypeScript module in the repo, and giving it a
 * copy would create exactly the second source of truth this whole design exists
 * to avoid. So the site publishes what it knows, once per deploy, and the Worker
 * fetches it.
 *
 * The consequence is stated plainly: this file can be one deploy stale. That is
 * acceptable because it affects the *preview only* — a published page always
 * resolves its figures live, at build, from programmes.ts itself.
 *
 * ## How it reads TypeScript
 *
 * Node runs .ts directly (type stripping, on by default since 23.6). The three
 * modules below are reachable that way because none of them has a value import:
 * programmes.ts imports nothing at all, format.ts imports only a type, and
 * shared/figures.ts is import-free by design for exactly this reason. Adding a
 * value import to any of them breaks this script — which is the tripwire, since
 * the same property is what lets the Worker compile shared/ too.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { programmes } from "../src/lib/data/programmes.ts";
import { money, moneyPer, reviewDate, years } from "../src/lib/format.ts";
import {
  FIGURE_FIELDS,
  FORMATS_FOR_KIND,
  figureValue,
  formatFigure,
} from "../shared/figures.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "figures.json");

const fns = { money, moneyPer, years, reviewDate };

/** The leading words several programme names have in common, or the first name. */
function sharedName(names) {
  if (names.length === 1) return names[0];
  const words = names.map((n) => n.split(" "));
  const shared = [];
  for (let i = 0; i < words[0].length; i++) {
    const w = words[0][i];
    if (!words.every((parts) => parts[i] === w)) break;
    shared.push(w);
  }
  return shared.length ? shared.join(" ") : names[0];
}

const catalogue = {
  /**
   * Stamped so the dashboard can say how old the preview data is rather than
   * presenting a possibly-stale figure as current.
   */
  generatedAt: new Date().toISOString(),
  formats: Object.fromEntries(
    Object.entries(FORMATS_FOR_KIND).map(([kind, fmts]) => [kind, [...fmts]]),
  ),
  fields: FIGURE_FIELDS.map((f) => ({
    id: f.id,
    label: f.label,
    kind: f.kind,
    formats: [...FORMATS_FOR_KIND[f.kind]],
  })),
  /**
   * The official page behind each programme's figures, deduplicated by URL —
   * the MM2H tiers all cite the one MOTAC guide.
   *
   * Emitted for the Worker's official-source watcher (worker/src/watch.ts),
   * which upserts a watch row per URL. Publishing the list here rather than
   * keeping one in the Worker is the point: the watched set becomes the cited
   * set by construction, so adding a programme puts its source under watch on
   * the next deploy and there is no second list to drift.
   */
  sources: Object.values(
    programmes.reduce((acc, p) => {
      if (!p.source) return acc;
      const row = (acc[p.source] ??= {
        url: p.source,
        programme: p.slug,
        names: [],
        lastVerified: p.lastVerified ?? null,
      });
      row.names.push(p.name);
      return acc;
    }, {}),
  ).map(({ names, ...row }) => ({
    ...row,
    // Three MM2H tiers cite one MOTAC guide, so the label is what their names
    // agree on ("MM2H") rather than whichever tier happened to be first.
    label: `${sharedName(names)} — official source`,
  })),
  programmes: programmes.map((p) => ({
    id: p.slug,
    name: p.name,
    // Only the fields this programme actually has. A picker that offers
    // "income requirement" for MM2H would be offering a build failure —
    // src/lib/figures.ts throws on a null field, on purpose.
    values: Object.fromEntries(
      FIGURE_FIELDS.flatMap((f) => {
        const v = figureValue(p, f.id);
        if (!v) return [];
        const rendered = Object.fromEntries(
          FORMATS_FOR_KIND[f.kind].flatMap((fmt) => {
            const text = formatFigure(v, fmt, fns);
            return text === null ? [] : [[fmt, text]];
          }),
        );
        return [[f.id, rendered]];
      }),
    ),
  })),
};

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(catalogue, null, 2) + "\n");
console.log(
  `[figures] wrote public/figures.json — ${catalogue.programmes.length} programmes × ${catalogue.fields.length} fields.`,
);
