import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsIndex, newsIndexMetadata } from "@/content/news/NewsIndex";
import { isPrefixedLocale } from "@/lib/i18n";
import { getCategoryIndex, getNewsIndex } from "@/lib/news";

/**
 * /news/ on the Chinese hosts. Same component as the apex; the difference is
 * which content tree it reads and which dictionary it renders.
 *
 * `.zhnews.tsx` — the whole Chinese /news subtree is switched on together by
 * `scripts/sync-insight-routes.mjs`, not just the two dynamic routes under it.
 * An index that existed while nothing was translated would be a Chinese page
 * carrying an empty state, which is thin content, and it would contradict
 * `lib/translated.ts` — whose manifest only calls /news/ translated once there
 * is something in it. One switch, one answer. See next.config.ts.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return newsIndexMetadata(locale);
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  const [items, categories] = await Promise.all([
    getNewsIndex(locale),
    getCategoryIndex(locale),
  ]);

  return <NewsIndex locale={locale} items={items} categories={categories} />;
}
