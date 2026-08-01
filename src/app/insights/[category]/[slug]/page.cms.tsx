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
import { getCmsIndex, getInsightDoc } from "@/lib/insights";
import { site } from "@/lib/site";

/**
 * /insights/<category>/<slug>/ for every CMS-authored article.
 *
 * ## This file is the SOURCE. The route is a copy of it.
 *
 * `scripts/sync-insight-routes.mjs` copies this file to
 * `src/app/insights/[category]/[slug]/page.tsx` before a build, and deletes it
 * again when the CMS has no articles. That indirection buys one specific thing,
 * and it is not optional:
 *
 * Under `output: "export"`, Next hard-fails any dynamic route whose
 * `generateStaticParams` yields zero paths — `if (config.output === 'export' &&
 * isDynamic && !hasGenerateStaticParams) throw` in next/dist/build/index.js, with
 * no escape hatch. On day one the CMS is empty, so a committed route here would
 * mean a repo that cannot build until somebody publishes an article. The whole
 * point of this phase is that it ships invisibly, with zero articles and a
 * byte-identical `out/`.
 *
 * Keeping the source under src/lib/ rather than as a string inside the script
 * keeps it typechecked, linted and reviewable. Every import is `@/`-absolute, so
 * the copy compiles identically wherever it lands.
 *
 * ## Coexistence with the two hand-written folders
 *
 * Measured on Next 16.2.11: a dynamic route adds children into a directory that
 * already has literal children, and where a param collides with a literal the
 * literal wins deterministically. See src/lib/data/insights.ts. The danger is
 * that the collision is *silent*, so `getCmsIndex()` throws on one rather than
 * filtering it out.
 */

// Every slug is known at build time. Without this, a request for an unknown
// slug would try to render on demand — which a static export cannot do.
export const dynamicParams = false;

export async function generateStaticParams() {
  // Also the point at which a colliding slug throws, and at which an
  // unreachable CMS fails the build. Both live in getCmsIndex().
  const items = await getCmsIndex();

  // Next refuses to build a dynamic route that yields zero paths under
  // `output: "export"`, and says only that generateStaticParams is "missing",
  // which sends you looking for a bug in this file. It is not a bug in this
  // file: there is simply nothing published yet. Say so.
  //
  // In practice sync-insight-routes.mjs does not put this route in place until
  // there is at least one article, so this should be unreachable. It stays
  // because "should be unreachable" is not a guarantee, and the failure it
  // preempts costs an hour to diagnose from Next's own message.
  if (items.length === 0) {
    throw new Error(
      "No CMS insight articles, so /insights/[category]/[slug] has no pages to " +
        "generate — and a static export cannot build a dynamic route with zero " +
        "paths.\n\n" +
        "Publish at least one article: open the dashboard, write it in the " +
        "Insights section and press Publish, then rebuild. To check the section " +
        "against a local Worker first:\n" +
        "  cd worker && npx wrangler dev\n" +
        "  INSIGHTS_API_URL=http://localhost:8787/api/cms/insights npm run build",
    );
  }

  return items.map((it) => ({ category: it.category, slug: it.slug }));
}

/**
 * The document envelope in the shape every existing consumer already takes.
 *
 * `InsightLayout`, `InsightCard`, the sitemap and the Article schema were all
 * written against `Insight` from the hand-authored registry. A CMS article
 * satisfies the same type, which is why none of them changed.
 */
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
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const doc = await getInsightDoc(category, slug);
  if (!doc) return {};
  const article = toInsight(doc);

  return {
    title: article.title,
    description: article.dek,
    alternates: { canonical: insightPath(article) },
    robots: article.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: `${article.title} — ${site.name}`,
      description: article.dek,
      url: insightPath(article),
      ...insightOpenGraphImages(article),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const doc = await getInsightDoc(category, slug);
  if (!doc) notFound();

  const article = toInsight(doc);

  return (
    <InsightLayout article={article} sources={doc.sources} faq={doc.faq}>
      <InsightBlocks blocks={doc.blocks} docPath={`${category}/${slug}`} />
    </InsightLayout>
  );
}
