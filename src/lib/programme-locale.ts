import type { Programme } from "@/lib/data/programmes";
import type { Locale } from "@/lib/i18n";
import { prose as zhHans } from "@/locales/programmes/zh-hans";
import { prose as zhHant } from "@/locales/programmes/zh-hant";
import type { ProgrammeProse } from "@/locales/programmes/zh-hans";

const overlays: Partial<Record<Locale, Partial<Record<string, ProgrammeProse>>>> =
  {
    "zh-hans": zhHans,
    "zh-hant": zhHant,
  };

/**
 * A programme with its prose fields swapped for the locale's, and every
 * figure left exactly as `programmes.ts` states it.
 *
 * The returned object is still a `Programme`, so `KeyFacts`, `TierTable`,
 * `SupersededNotice` and the cost calculator all keep working on it unchanged
 * — they read the same field names they always did. What they get back for
 * `authority` or `sponsor` is Chinese; what they get back for `fixedDeposit`
 * is the identical number object, because there is only one of those and it
 * lives in one file.
 *
 * English returns the record untouched, not a copy: no overlay exists for it,
 * and identity here means the English pages cannot be changed by a bug in this
 * function.
 */
export function localiseProgramme(p: Programme, locale: Locale): Programme {
  const overlay = overlays[locale]?.[p.slug];
  if (!overlay) return p;

  return {
    ...p,
    ...(overlay.name ? { name: overlay.name } : {}),
    ...(overlay.authority ? { authority: overlay.authority } : {}),
    ...(overlay.minStayPerYear !== undefined
      ? { minStayPerYear: overlay.minStayPerYear }
      : {}),
    ...(overlay.minStayShort !== undefined
      ? { minStayShort: overlay.minStayShort }
      : {}),
    ...(overlay.sponsor !== undefined ? { sponsor: overlay.sponsor } : {}),
    ...(overlay.sponsorShort !== undefined
      ? { sponsorShort: overlay.sponsorShort }
      : {}),
    ...(overlay.renewalLimit ? { renewalLimit: overlay.renewalLimit } : {}),
    ...(overlay.dependants ? { dependants: overlay.dependants } : {}),
    ...(overlay.withdrawable && p.fixedDeposit
      ? { fixedDeposit: { ...p.fixedDeposit, withdrawable: overlay.withdrawable } }
      : {}),
  };
}
