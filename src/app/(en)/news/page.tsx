import type { Metadata } from "next";
import Link from "next/link";
import { CategoryStrip } from "@/components/CategoryStrip";
import { GuideHead } from "@/components/GuideHead";
import { NewsCard, NewsLeadCard } from "@/components/NewsCard";
import { getCategoryIndex, getNewsIndex, type NewsArticle } from "@/lib/news";
import { site } from "@/lib/site";

/**
 * The blog index — SPEC.md §3.
 *
 * Prerendered from the news Worker at build time. It used to hydrate this list
 * client-side, which meant the response a crawler received contained no
 * headlines at all: the page could not rank, and neither could the stories on
 * it, because there was nothing linking to them. Now every card is real HTML and
 * every card is a link to a page of our own.
 */

export const metadata: Metadata = {
  title: "Malaysia visa news",
  description:
    "Malaysia long-stay visa news, explained — PVIP, MM2H, Sarawak MM2H, DE Rantau and the work and study passes. Each story written up in full, with its source cited.",
  alternates: { canonical: "/news/" },
};

export default async function Page() {
  const items = await getNewsIndex();
  const categories = await getCategoryIndex();
  const [lead, ...rest] = items;

  return (
    <div className="space-y-12">
      {items.length > 0 && <ListSchema items={items} />}

      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">
          Malaysia visa news
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          What changes in Malaysia&apos;s long-stay visa programmes, written up in
          full — the figures, and what each change actually means if you are
          applying. Every story is hand-reviewed before it appears, and every
          story cites the reporting it is based on.
        </p>
      </header>

      <CategoryStrip categories={categories} />

      {items.length === 0 ? (
        <p className="rounded-xl border border-sand-200 bg-sand-50 px-5 py-6 text-ink-muted">
          No stories published yet — the programme guides carry the current
          verified figures in the meantime.
        </p>
      ) : (
        <>
          <NewsLeadCard article={lead} />

          {rest.length > 0 && (
            <section className="space-y-8">
              <GuideHead
                eyebrow="More updates"
                title={
                  <>
                    Everything else{" "}
                    <span className="font-display accent-text font-medium italic">
                      worth knowing
                    </span>
                  </>
                }
              />
              <ul className="space-y-6">
                {rest.map((a) => (
                  <li key={a.slug}>
                    <NewsCard article={a} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        News is a starting point, not advice. For what a rule actually means for
        your case, read the{" "}
        <Link href="/compare/" className="font-semibold underline">
          programme guides
        </Link>{" "}
        or{" "}
        <Link href="/tools/eligibility/" className="font-semibold underline">
          run the eligibility checker
        </Link>
        .
      </p>
    </div>
  );
}

/**
 * ItemList of the stories on this page. It tells a crawler that /news is an
 * index and gives it the ordered set of article URLs, which is how a new story
 * gets discovered from here rather than waiting on the sitemap.
 */
function ListSchema({ items }: { items: NewsArticle[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Malaysia visa news",
    itemListElement: items.map((a, i) => ({
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
