import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  NewsCategoryIndex,
  newsCategoryMetadata,
} from "@/content/news/NewsCategory";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { getCategoryIndex } from "@/lib/news";

/**
 * /news/category/<category>/ on the Chinese hosts.
 *
 * `.zhnews.tsx` for the same reason as the article route beside it — the
 * category set of a translated tree can be empty, and a static export cannot
 * build a dynamic route with no paths. See next.config.ts.
 */

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isPrefixedLocale(locale)) return [];
  return (await getCategoryIndex(locale)).map(({ category }) => ({ category }));
}

async function findCategory(category: string, locale: PrefixedLocale) {
  const categories = await getCategoryIndex(locale);
  return categories.find((c) => c.category === category) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const found = await findCategory(category, locale);
  return found ? newsCategoryMetadata(found.category, locale) : {};
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  const found = await findCategory(category, locale);
  if (!found) notFound();

  return (
    <NewsCategoryIndex
      found={found}
      categories={await getCategoryIndex(locale)}
      locale={locale}
    />
  );
}
