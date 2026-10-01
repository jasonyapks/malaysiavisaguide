import type { PrefixedLocale } from "@/lib/i18n";
import { copy as zhHans } from "./zh-hans";
import { copy as zhHant } from "./zh-hant";
import type { AgentsCopy } from "./types";

/** The Chinese copies, for the `[locale]` routes. zh-hant is generated. */
export const COPY: Record<PrefixedLocale, AgentsCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};
