import type { Locale } from "@/lib/i18n";
import { copy as en } from "./en";
import { copy as zhHans } from "./zh-hans";
import { copy as zhHant } from "./zh-hant";
import type { HandoffCopy } from "./types";

const dictionaries: Record<Locale, HandoffCopy> = {
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export function getHandoffCopy(locale: Locale): HandoffCopy {
  return dictionaries[locale];
}
