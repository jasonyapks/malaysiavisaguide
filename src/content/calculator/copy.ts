import type { Locale } from "@/lib/i18n";
import { copy as en } from "./en";
import { copy as zhHans } from "./zh-hans";
import { copy as zhHant } from "./zh-hant";
import type { CalculatorCopy } from "./types";

/**
 * The calculator's copy, keyed by locale.
 *
 * Resolved on the client side of the boundary rather than passed in as a prop:
 * `CalculatorCopy` holds functions — English pluralises and the two languages
 * put a term suffix in different places — and functions cannot be serialized
 * across the server/client boundary. Same shape and same reason as the
 * eligibility quiz next door.
 */
const dictionaries: Record<Locale, CalculatorCopy> = {
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export function getCalculatorCopy(locale: Locale): CalculatorCopy {
  return dictionaries[locale];
}
