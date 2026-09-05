import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsStory, newsStoryMetadata } from "@/content/news/NewsStory";
import { isPrefixedLocale } from "@/lib/i18n";
import { getArticle, getNewsIndex } from "@/lib/news";

/**
 * /news/<slug>/ on the Chinese hosts.
 *
 * ## Why the extension is `.zhnews.tsx`
 *
 * Under `output: "export"` a dynamic route whose `generateStaticParams` yields
 * zero paths is a hard build failure, and this route legitimately has zero
 * paths until an article has been translated — a fresh clone, or the first
 * build of a locale. Next only treats a file as a page if its extension is in
 * `pageExtensions`, so `scripts/sync-insight-routes.mjs` decides before every
 * build and `next.config.ts` composes the list. Same mechanism, and the same
 * argument, as the `.cms.tsx` insight routes; the long version is in
 * next.config.ts.
 *
 * The file is otherwise an ordinary committed, typechecked, linted route.
 */

export const dynamicParams = false;

/**
 * Slugs for the locale the parent generated — top-down, per the note on
 * multiple dynamic segments in Next's generateStaticParams reference.
 * `[locale]/layout.tsx` yields the locales; this yields each one's articles,
 * which are not the same set: an article is translated a few minutes after it
 * is published, so the Chinese tree is legitimately a subset of the English one.
 */
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isPrefixedLocale(locale)) return [];
  return (await getNewsIndex(locale)).map((it) => ({ slug: it.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const article = await getArticle(slug, locale);
  return article ? newsStoryMetadata(article, locale) : {};
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  const article = await getArticle(slug, locale);
  if (!article) notFound();

  return <NewsStory article={article} locale={locale} />;
}
