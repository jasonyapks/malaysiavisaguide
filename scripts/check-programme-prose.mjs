#!/usr/bin/env node
/**
 * Fail the build when a prose field in programmes.ts has no Chinese overlay.
 *
 * `localiseProgramme()` swaps a programme's free-text fields for the locale's
 * and falls back to English per field. That fallback is right at runtime — an
 * untranslated sponsor line beats a crashed page — and wrong at build time,
 * because it is silent: a field added to programmes.ts, or a programme added
 * without an overlay entry, ships English inside an otherwise Chinese page and
 * nobody finds out until a reader does.
 *
 * That is not hypothetical. The comparison table rendered six such fields in
 * English on the Chinese pages from the day they launched, because the page
 * passed raw programmes to `TierTable` instead of localised ones, and nothing
 * anywhere said so.
 *
 * Checks only fields the programme actually has: a pass with no fixed deposit
 * needs no withdrawal rule.
 */
import { programmes } from "../src/lib/data/programmes.ts";
import { prose } from "../src/locales/programmes/zh-hans.ts";

/** field → does this programme carry it? */
const FIELDS = {
  name: (p) => p.name != null,
  authority: (p) => p.authority != null,
  minStayPerYear: (p) => p.minStayPerYear != null,
  minStayShort: (p) => p.minStayShort != null,
  sponsor: (p) => p.sponsor != null,
  sponsorShort: (p) => p.sponsorShort != null,
  renewalLimit: (p) => p.renewalLimit != null,
  withdrawable: (p) => p.fixedDeposit?.withdrawable != null,
  propertyStateFloorNote: (p) => p.propertyStateFloorNote != null,
  dependants: (p) => (p.dependants ?? []).length > 0,
  agencyFee: (p) => p.governmentExtras?.agencyFee != null,
  superseded: (p) => p.superseded != null,
};

const gaps = [];
for (const p of programmes) {
  const overlay = prose[p.slug];
  if (!overlay) {
    gaps.push(`${p.slug}: no overlay entry at all`);
    continue;
  }
  for (const [field, present] of Object.entries(FIELDS)) {
    if (present(p) && overlay[field] == null) {
      gaps.push(`${p.slug}: ${field}`);
    }
  }
  // The agency fee is three prose fields behind one key.
  const fee = p.governmentExtras?.agencyFee;
  if (fee && overlay.agencyFee) {
    for (const k of ["note", "includes", "paymentTerms"]) {
      if (fee[k] != null && overlay.agencyFee[k] == null) {
        gaps.push(`${p.slug}: agencyFee.${k}`);
      }
    }
  }
  if (p.superseded && overlay.superseded) {
    if (overlay.superseded.whatChanged == null) {
      gaps.push(`${p.slug}: superseded.whatChanged`);
    }
  }
}

if (gaps.length) {
  console.error(
    `check-programme-prose: ${gaps.length} field(s) in programmes.ts have no zh-hans overlay.\n` +
      `Add them to src/locales/programmes/zh-hans.ts, then run \`npm run i18n:hant\`.\n`,
  );
  for (const g of gaps) console.error(`  • ${g}`);
  process.exit(1);
}

console.log(
  `check-programme-prose: ${programmes.length} programme(s) fully covered.`,
);
