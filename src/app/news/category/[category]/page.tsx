import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryStrip } from "@/components/CategoryStrip";
import { GuideHead } from "@/components/GuideHead";
import { NewsCard, NewsLeadCard } from "@/components/NewsCard";
import {
  CATEGORY_BLURB,
  CATEGORY_GUIDE,
  CATEGORY_LABEL,
  categoryPath,
  categoryTitle,
  getCategoryIndex,
  type NewsArticle,
  type NewsCategory,
} from "@/lib/news";
import { site } from "@/lib/site";

/**
 * One index per news category — /news/category/<category>/.
 *
 * The point is browsing: /news is a single reverse-chronological feed, and a
 * reader who cares about Sarawak MM2H should not have to read past PVIP and
 * Employment Pass stories to find the three that concern them.
 *
 * It earns its place for crawlers too. Every category page is a real internal
 * link hub — it points at every story in the category and at the programme
 * guide, which is exactly the shape a topic cluster wants, and it gives each
 * programme a news URL that can rank for "<programme> news" without competing
 * with the guide for "<programme>".
 *
 * The route lives under /news/category/ rather than at /news/<category>/
 * because the latter is the same shape as /news/<slug>/ — a story whose slug
 * happened to be "mm2h" and the MM2H category would be the same URL.
 */

// Every category is known at build time; a static export cannot render one on
// demand. Anything else under this segment is a 404, which is what we want:
// there is no such thing as a category we did not generate.
export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategoryIndex();

  // Same failure mode as /news/[slug] — under `output: "export"` a dynamic
  // route yielding zero paths fails the build with a message that blames a
  // missing generateStaticParams, which is not what has gone wrong.
  if (categories.length === 0) {
    throw new Error(
      "No published news articles, so /news/category/[category] has no pages to " +
        "generate — and a static export cannot build a dynamic route with zero " +
        "paths.\n\nPublish at least one article and rebuild; see the same note in " +
        "src/app/news/[slug]/page.tsx.",
    );
  }

  return categories.map(({ category }) => ({ category }));
}

/** The categories that have a page, as a lookup. */
async function findCategory(category: string) {
  const categories = await getCategoryIndex();
  return categories.find((c) => c.category === category) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const found = await findCategory(category);
  if (!found) return {};

  const label = categoryTitle(found.category);
  return {
    title: label,
    description: CATEGORY_BLURB[found.category],
    alternates: { canonical: categoryPath(found.category) },
    openGraph: {
      type: "website",
      title: `${label} — ${site.name}`,
      description: CATEGORY_BLURB[found.category],
      url: categoryPath(found.category),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const found = await findCategory(category);
  if (!found) notFound();

  const categories = await getCategoryIndex();
  const label = CATEGORY_LABEL[found.category];
  const heading = categoryTitle(found.category);
  const guide = CATEGORY_GUIDE[found.category];
  const [lead, ...rest] = found.articles;

  return (
    <div className="space-y-12">
      <ListSchema category={found.category} articles={found.articles} />

      <nav aria-label="Breadcrumb" className="text-[0.85rem] text-ink-muted">
        <Link href="/news/" className="text-forest-700 underline">
          News
        </Link>
        <span aria-hidden> › </span>
        <span>{label}</span>
      </nav>

      <header className="space-y-6">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">{heading}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          {CATEGORY_BLURB[found.category]}
        </p>
        <p className="text-[0.95rem] text-ink-muted">
          {found.articles.length === 1
            ? "One story so far."
            : `${found.articles.length} stories, newest first.`}{" "}
          Every one is hand-reviewed before it appears and cites the reporting it
          is based on.
        </p>
      </header>

      <CategoryStrip categories={categories} current={found.category} />

      <NewsLeadCard article={lead} showCategory={false} />

      {rest.length > 0 && (
        <section className="space-y-8">
          <GuideHead
            eyebrow={`More on ${label}`}
            title={
              <>
                Everything else{" "}
                <span className="font-display accent-text font-medium italic">
                  in this category
                </span>
              </>
            }
          />
          <ul className="space-y-6">
            {rest.map((a) => (
              <li key={a.slug}>
                {/* Chip suppressed: every card here is already this category. */}
                <NewsCard article={a} showCategory={false} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The handoff. News answers what changed; the guide answers what to do
          about it, and that is the page this reader actually wants next. */}
      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {guide ? (
          <>
            News is a starting point, not advice. For what these changes mean for
            your own case, read{" "}
            <Link href={guide.path} className="font-semibold underline">
              {guide.title}
            </Link>{" "}
            or{" "}
            <Link
              href="/tools/eligibility/"
              className="font-semibold underline"
            >
              run the eligibility checker
            </Link>
            .
          </>
        ) : (
          <>
            News is a starting point, not advice. For what a rule actually means
            for your case, read the{" "}
            <Link href="/compare/" className="font-semibold underline">
              programme guides
            </Link>{" "}
            or{" "}
            <Link
              href="/tools/eligibility/"
              className="font-semibold underline"
            >
              run the eligibility checker
            </Link>
            .
          </>
        )}
      </p>
    </div>
  );
}

/** Tells a crawler this is an index and hands it the ordered set of article URLs. */
function ListSchema({
  category,
  articles,
}: {
  category: NewsCategory;
  articles: NewsArticle[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryTitle(category),
    itemListElement: articles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/news/${a.slug}/`,
      name: a.headline,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
