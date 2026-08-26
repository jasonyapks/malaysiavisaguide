#!/usr/bin/env node
/**
 * Fail the build when a nationality in the fee schedule has no Chinese name.
 *
 * `countryName()` falls back to the English label, which is right at runtime
 * and invisible at build time: a country added to `nationality-fees.ts` would
 * sit in English in the middle of an otherwise Chinese dropdown of seventy-odd
 * options, where nobody scrolling past would think to report it.
 */
import { NATIONALITY_OPTIONS } from "../src/lib/data/nationality-fees.ts";
import {
  countries,
  countryNotes,
  feeAttribution,
} from "../src/locales/countries/zh-hans.ts";
import { NATIONALITY_FEE_ATTRIBUTION } from "../src/lib/data/nationality-fees.ts";

const missing = NATIONALITY_OPTIONS.map((n) => n.label).filter(
  (l) => !(l in countries),
);

const missingNotes = NATIONALITY_OPTIONS.filter(
  (n) => n.note != null && !(n.label in countryNotes),
).map((n) => `${n.label} (note)`);
missing.push(...missingNotes);
if (!(NATIONALITY_FEE_ATTRIBUTION.by in feeAttribution)) {
  missing.push(`${NATIONALITY_FEE_ATTRIBUTION.by} (fee attribution)`);
}

if (missing.length) {
  console.error(
    `check-countries: ${missing.length} nationality label(s) have no zh-hans name.\n` +
      `Add them to src/locales/countries/zh-hans.ts, then run \`npm run i18n:hant\`.\n`,
  );
  for (const m of missing) console.error(`  • ${m}`);
  process.exit(1);
}

console.log(`check-countries: ${NATIONALITY_OPTIONS.length} label(s) covered.`);
