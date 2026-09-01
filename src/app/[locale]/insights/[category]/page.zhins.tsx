import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InsightsCategory,
  insightsCategoryMetadata,
} from "@/content/insights/InsightsCategory";
import type { InsightCategory } from "@/lib/data/insights";
import { isPrefixedLocale } from "@/lib/i18n";
import {
  cmsOnlyCategories,
  insightsByCategory,
  liveInsightCategories,
} from "@/lib/insights";

/**
 * /insights/<category>/ on the Chinese hosts.
 *
 * Every live category, not just the ones English routes dynamically: the
 * translated trees have no literal folders, so `comparisons` comes through here
 * too. That is what the locale argument to `cmsOnlyCategories()` decides.
 */

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isPrefixedLocale(locale)) return [];
  return (await cmsOnlyCategories(locale)).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return insightsCategoryMetadata(category as InsightCategory, locale);
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  const c = category as InsightCategory;
  const [articles, categories] = await Promise.all([
    insightsByCategory(c, locale),
    liveInsightCategories(locale),
  ]);

  return (
    <InsightsCategory
      category={c}
      articles={articles}
      categories={categories}
      locale={locale}
    />
  );
}
