import type { Locale } from "@/lib/i18n";
import { copy as en } from "./en";
import { copy as zhHans } from "./zh-hans";
import { copy as zhHant } from "./zh-hant";
import type { ContactCopy } from "./types";

/**
 * The contact form's copy, keyed by locale — resolved on the client side of
 * the boundary because `errorNetwork` is a function. Same pattern as the quiz
 * and the calculator.
 */
const dictionaries: Record<Locale, ContactCopy> = {
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export function getContactCopy(locale: Locale): ContactCopy {
  return dictionaries[locale];
}
