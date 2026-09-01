import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InsightsIndex,
  insightsIndexMetadata,
} from "@/content/insights/InsightsIndex";
import { isPrefixedLocale } from "@/lib/i18n";
import { liveInsightCategories, publishedInsights } from "@/lib/insights";

/**
 * /insights/ on the Chinese hosts.
 *
 * `.zhins.tsx` — the whole translated /insights subtree is switched on together
 * by `scripts/sync-insight-routes.mjs`, because the two routes under it are
 * dynamic and a translated tree is legitimately empty until an article has been
 * through scripts/translate-content.mjs. Same mechanism as the `.cms.tsx` and
 * `.zhnews.tsx` routes; the long version is in next.config.ts.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return insightsIndexMetadata(locale);
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  const [articles, categories] = await Promise.all([
    publishedInsights(locale),
    liveInsightCategories(locale),
  ]);

  return (
    <InsightsIndex locale={locale} articles={articles} categories={categories} />
  );
}
