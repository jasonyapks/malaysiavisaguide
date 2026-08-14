import type { Locale } from "./i18n";
import { ui as en, type UiStrings } from "@/locales/ui/en";
import { ui as zhHans } from "@/locales/ui/zh-hans";
import { ui as zhHant } from "@/locales/ui/zh-hant";

/**
 * The chrome dictionary for a locale.
 *
 * A plain object rather than the dynamic `import()` the Next i18n guide shows.
 * That pattern exists to keep unused dictionaries out of a server bundle
 * serving every locale from one process; this site is a static export, so
 * every page's HTML is produced at build time and there is no server bundle to
 * keep small. A static map is one less async boundary in every layout.
 */
const dictionaries: Record<Locale, UiStrings> = {
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export function getUi(locale: Locale): UiStrings {
  return dictionaries[locale];
}

export type { UiStrings };
