import type { Metadata } from "next";
import Link from "next/link";
import { GuideHead } from "@/components/GuideHead";
import { InsightCard, InsightStrip } from "@/components/InsightLayout";
import { insightPath, type Insight } from "@/lib/data/insights";
import { liveInsightCategories, publishedInsights } from "@/lib/insights";
import { site } from "@/lib/site";

/**
 * /insights/ — the index of Jason's own articles.
 *
 * Separate from /news/ on purpose. News is perishable and machine-fed; these
 * are evergreen, written from 500+ cases, and they are the pages meant to be
 * cited. Mixing the two in one feed would bury an article that stays true for
 * three years under a story that stops mattering in three weeks.
 */

const DESCRIPTION =
  "Comparisons, decision guides and first-person notes on Malaysia's long-stay visas — written by Jason Yap from 500+ relocation cases, with every figure traced to an official source.";

export const metadata: Metadata = {
  title: "Insights",
  description: DESCRIPTION,
  alternates: { canonical: "/insights/" },
  openGraph: {
    type: "website",
    title: `Insights — ${site.name}`,
    description: DESCRIPTION,
    url: "/insights/",
  },
};

export default async function Page() {
  const categories = await liveInsightCategories();
  const articles = await publishedInsights();
  const [lead, ...rest] = articles;

  return (
    <div className="space-y-12">
      <ListSchema articles={articles} />

      <header className="space-y-6">
        <p className="eyebrow">Insights</p>
        <h1 className="text-h1 font-semibold">
          Which programme is{" "}
          <span className="font-display accent-text font-medium italic">
            actually yours
          </span>
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {DESCRIPTION}
        </p>
      </header>

      <InsightStrip categories={categories} />

      {lead ? (
        <>
          <InsightCard article={lead} />

          {rest.length > 0 && (
            <section className="space-y-8">
              <GuideHead
                eyebrow="More"
                title={
                  <>
                    Everything else{" "}
                    <span className="font-display accent-text font-medium italic">
                      worth reading
                    </span>
                  </>
                }
              />
              <ul className="space-y-6">
                {rest.map((a) => (
                  <li key={a.slug}>
                    <InsightCard article={a} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        /* Unreachable while the registry has an entry, and kept deliberately:
           a build that quietly rendered an empty index would ship a URL with a
           heading and nothing under it. */
        <p className="text-ink-muted">No articles published yet.</p>
      )}

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        Looking for what changed rather than what to choose? That is{" "}
        <Link href="/news/" className="font-semibold underline">
          the news feed
        </Link>
        . For the programme reference pages, start with{" "}
        <Link href="/compare/" className="font-semibold underline">
          the comparison table
        </Link>
        .
      </p>
    </div>
  );
}

function ListSchema({ articles }: { articles: Insight[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Insights",
    itemListElement: articles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}${insightPath(a)}`,
      name: a.title,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
