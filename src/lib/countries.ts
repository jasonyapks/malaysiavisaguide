import type { Locale } from "./i18n";
import {
  countries as zhHans,
  countryNotes as zhHansNotes,
  feeAttribution as zhHansAttribution,
} from "@/locales/countries/zh-hans";
import {
  countries as zhHant,
  countryNotes as zhHantNotes,
  feeAttribution as zhHantAttribution,
} from "@/locales/countries/zh-hant";

/**
 * The display name for a nationality option in the cost calculator.
 *
 * The English label stays the stored value — it is the key the fee schedules
 * are looked up by — so only the rendering changes and a selection cannot mean
 * something different in one locale than another.
 */
const dictionaries: Partial<Record<Locale, Record<string, string>>> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export function countryName(label: string, locale: Locale): string {
  if (locale === "en") return label;
  return dictionaries[locale]?.[label] ?? label;
}

const noteDictionaries: Partial<Record<Locale, Record<string, string>>> = {
  "zh-hans": zhHansNotes,
  "zh-hant": zhHantNotes,
};

/** The note attached to a nationality row, where it has one. */
export function countryNote(
  label: string,
  note: string | undefined,
  locale: Locale,
): string | undefined {
  if (note == null) return undefined;
  if (locale === "en") return note;
  return noteDictionaries[locale]?.[label] ?? note;
}

const attributionDictionaries: Partial<Record<Locale, Record<string, string>>> =
  {
    "zh-hans": zhHansAttribution,
    "zh-hant": zhHantAttribution,
  };

/** Who the nationality fee schedules are attributed to. */
export function feeAttributionName(by: string, locale: Locale): string {
  if (locale === "en") return by;
  return attributionDictionaries[locale]?.[by] ?? by;
}
