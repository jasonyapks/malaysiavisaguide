import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightBlocks } from "@/components/InsightBlocks";
import {
  InsightLayout,
  insightOpenGraphImages,
} from "@/components/InsightLayout";
import {
  insightPath,
  type Insight,
  type InsightCategory,
} from "@/lib/data/insights";
import { isPrefixedLocale, localeUrl, type PrefixedLocale } from "@/lib/i18n";
import { getCmsIndex, getInsightDoc } from "@/lib/insights";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

/**
 * /insights/<category>/<slug>/ on the Chinese hosts.
 *
 * The body is the same `InsightLayout` + `InsightBlocks` pair the apex renders.
 * The figures inside it are not translated and never were: a `{{programme:…}}`
 * token is a node in the block tree, resolved from programmes.ts at build in
 * whatever locale the page is being built for, so the number on the Chinese
 * page is the same number, formatted by the same code, with Chinese labels
 * around it. See the header of scripts/translate-content.mjs.
 */

export const dynamicParams = false;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isPrefixedLocale(locale)) return [];
  return (await getCmsIndex(locale)).map((it) => ({
    category: it.category,
    slug: it.slug,
  }));
}

/** The document envelope in the shape `InsightLayout` already takes. */
function toInsight(doc: {
  slug: string;
  category: string;
  title: string;
  dek: string;
  published: string;
  reviewed: string;
  readingMinutes: number;
  relatedGuides: { path: string; title: string }[];
  draft?: boolean;
}): Insight {
  return {
    slug: doc.slug,
    category: doc.category as InsightCategory,
    title: doc.title,
    dek: doc.dek,
    published: doc.published,
    reviewed: doc.reviewed,
    readingMinutes: doc.readingMinutes,
    relatedGuides: doc.relatedGuides,
    ...(doc.draft && { draft: true }),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  if (!isPrefixedLocale(locale)) return {};

  const doc = await getInsightDoc(category, slug, locale as PrefixedLocale);
  if (!doc) return {};
  const article = toInsight(doc);

  return {
    ...pageMetadata({
      canonicalPath: insightPath(article),
      locale,
      title: article.title,
      description: article.dek,
    }),
    robots: article.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: `${article.title} — ${site.name}`,
      description: article.dek,
      url: localeUrl(insightPath(article), locale),
      ...insightOpenGraphImages(article),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  const doc = await getInsightDoc(category, slug, locale);
  if (!doc) notFound();

  return (
    <InsightLayout
      article={toInsight(doc)}
      sources={doc.sources}
      faq={doc.faq}
      locale={locale}
    >
      <InsightBlocks
        blocks={doc.blocks}
        docPath={`${category}/${slug}`}
        locale={locale}
      />
    </InsightLayout>
  );
}
