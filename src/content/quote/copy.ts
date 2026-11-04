import type { Locale } from "@/lib/i18n";
import { copy as en } from "./en";
import { copy as zhHans } from "./zh-hans";
import { copy as zhHant } from "./zh-hant";
import type { QuoteCopy } from "./types";

const dictionaries: Record<Locale, QuoteCopy> = {
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export function getQuoteCopy(locale: Locale): QuoteCopy {
  return dictionaries[locale];
}
