import type { Money } from "@/lib/data/programmes";

/**
 * Every figure on the site renders through here, so the same amount never
 * appears two different ways on two different pages.
 *
 * MYR renders as RM1,000,000 — no space, the way it is written in Malaysia.
 * USD renders as USD 150,000 rather than $150,000, because the audience is
 * international and $ is ambiguous across half the source markets.
 */
export function money(m: Money): string {
  const n = m.amount.toLocaleString("en-MY");
  return m.currency === "MYR" ? `RM${n}` : `USD ${n}`;
}

/** "RM40,000 a month" */
export function moneyPer(m: Money & { period: "month" | "year" }): string {
  return `${money(m)} a ${m.period}`;
}

/** "23 July 2026" — spelled out, because a reader checking freshness scans for it. */
export function reviewDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function years(n: number): string {
  return n === 1 ? "1 year" : `${n} years`;
}
