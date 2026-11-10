import type { Locale } from "./i18n";
import { imageAlt as zhHans } from "@/locales/image-alt/zh-hans";
import { imageAlt as zhHant } from "@/locales/image-alt/zh-hant";

const tables: Partial<Record<Locale, Record<string, string>>> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

/**
 * An image with its alt text in the page's language.
 *
 * `fallback` is for a figure inside an article: its caption is already
 * translated, and a translated caption is a better alt on a Chinese page than
 * an English description nobody translated. English pages are returned as-is.
 */
export function localiseImage<T extends { alt: string }>(
  image: T,
  locale: Locale,
  fallback?: string,
): T {
  if (locale === "en") return image;
  const alt = tables[locale]?.[image.alt] ?? fallback;
  return alt ? { ...image, alt } : image;
}
