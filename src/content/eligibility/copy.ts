import type { Locale } from "@/lib/i18n";
import { copy as en } from "./en";
import { copy as zhHans } from "./zh-hans";
import { copy as zhHant } from "./zh-hant";
import type { EligibilityCopy } from "./types";

/**
 * The quiz's copy, keyed by locale.
 *
 * ## Why the client component imports this instead of taking it as a prop
 *
 * `EligibilityCopy` holds functions — `progress.counter`, `results.fitsHeading`,
 * `disclaimer` — because English pluralises ("One programme fits" against
 * "3 programmes fit") and three strings interpolate a figure. Functions cannot
 * be serialized across the server/client boundary, so passing the whole object
 * into `EligibilityQuiz` fails the export with "Functions cannot be passed
 * directly to Client Components".
 *
 * Passing only `locale` — a string — and resolving the copy on the client side
 * of the boundary keeps the functions and costs one static map, which is the
 * same shape `lib/ui.ts` uses for exactly the same reason.
 */
const dictionaries: Record<Locale, EligibilityCopy> = {
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export function getEligibilityCopy(locale: Locale): EligibilityCopy {
  return dictionaries[locale];
}
