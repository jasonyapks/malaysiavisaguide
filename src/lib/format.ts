import type { Money } from "@/lib/data/programmes";
// TYPE-ONLY, and the default is the literal "en" rather than `defaultLocale`.
// scripts/emit-figures.mjs imports this file directly under plain Node, where
// the `@/` alias does not resolve — so a runtime import here fails the build
// before Next even starts, with an error naming a package that does not exist.
// A type import is erased and costs nothing.
import type { Locale } from "@/lib/i18n";

/**
 * Every figure on the site renders through here, so the same amount never
 * appears two different ways on two different pages.
 *
 * MYR renders as RM1,000,000 — no space, the way it is written in Malaysia.
 * USD renders as USD 150,000 rather than $150,000, because the audience is
 * international and $ is ambiguous across half the source markets.
 *
 * ## Why the amount itself is not localised
 *
 * `toLocaleString("en-MY")` stays, in every language. Chinese has its own
 * grouping convention — 万 and 亿, four digits at a time — and a reader who
 * saw RM100万 here would then have to convert it back to compare against the
 * bank form, the Immigration page and the agency's quote, all of which say
 * RM1,000,000. The digits are the part that must not move. Only the *words*
 * around them are translated.
 */
export function money(m: Money): string {
  const n = m.amount.toLocaleString("en-MY");
  return m.currency === "MYR" ? `RM${n}` : `USD ${n}`;
}

/** "RM40,000 a month" / "每月 RM40,000" */
export function moneyPer(
  m: Money & { period: "month" | "year" },
  locale: Locale = "en",
): string {
  const amount = money(m);
  if (locale === "en") return `${amount} a ${m.period}`;
  // Chinese puts the period in front: 每月 / 每年.
  return `${m.period === "month" ? "每月" : "每年"} ${amount}`;
}

/**
 * "23 July 2026" — spelled out, because a reader checking freshness scans for
 * it. In Chinese that is 2026年7月23日, which `zh-CN` produces natively.
 *
 * The month name is exactly the kind of string that looks translated because
 * everything around it is, and is not: a Chinese page reading "27 July 2026"
 * under a Chinese heading was the last English left on the PVIP guide.
 */
export function reviewDate(iso: string, locale: Locale = "en"): string {
  const intlLocale = locale === "en" ? "en-GB" : "zh-CN";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "20 years" / "20 年" */
export function years(n: number, locale: Locale = "en"): string {
  if (locale === "en") return n === 1 ? "1 year" : `${n} years`;
  return `${n} 年`;
}
