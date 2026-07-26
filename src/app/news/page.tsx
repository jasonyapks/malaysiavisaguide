import type { Metadata } from "next";
import Link from "next/link";
import { GuideHead } from "@/components/GuideHead";
import {
  CATEGORY_LABEL,
  getNewsIndex,
  newsDate,
  type NewsArticle,
} from "@/lib/news";
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
  const [lead, ...rest] = items;

  return (
    <div className="space-y-12">
      {items.length > 0 && <ListSchema items={items} />}

      <header className="space-y-6">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          Malaysia visa news
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          What changes in Malaysia&apos;s long-stay visa programmes, written up in
          full — the figures, and what each change actually means if you are
          applying. Every story is hand-reviewed before it appears, and every
          story cites the reporting it is based on.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-sand-200 bg-sand-50 px-5 py-6 text-ink-muted">
          No stories published yet — the programme guides carry the current
          verified figures in the meantime.
        </p>
      ) : (
        <>
          <LeadCard article={lead} />

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
                    <Card article={a} />
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

/** The most recent story, given the room it deserves. */
function LeadCard({ article }: { article: NewsArticle }) {
  return (
    <article className="card-lux px-7 py-7 sm:px-9 sm:py-8">
      <Meta article={article} />
      <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight sm:text-[2rem]">
        <Link href={`/news/${article.slug}/`} className="hover:text-forest-700">
          {article.headline}
        </Link>
      </h2>
      <p className="mt-3 text-[1.1rem] leading-relaxed text-ink-muted">
        {article.dek}
      </p>
      <ReadLink slug={article.slug} />
    </article>
  );
}

function Card({ article }: { article: NewsArticle }) {
  return (
    <article className="border-b border-sand-200 pb-6">
      <Meta article={article} />
      <h2 className="mt-2 font-serif text-xl font-bold text-ink">
        <Link href={`/news/${article.slug}/`} className="hover:text-forest-700">
          {article.headline}
        </Link>
      </h2>
      <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-ink-muted">
        {article.dek}
      </p>
      <ReadLink slug={article.slug} />
    </article>
  );
}

function Meta({ article }: { article: NewsArticle }) {
  const date = newsDate(article.publishedAt);
  return (
    <div className="flex flex-wrap items-center gap-3 text-[0.8rem]">
      <span className="rounded-full bg-forest-50 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-forest-700">
        {CATEGORY_LABEL[article.category]}
      </span>
      {article.publishedAt && date && (
        <time className="text-ink-muted" dateTime={article.publishedAt}>
          {date}
        </time>
      )}
      <span className="text-ink-muted">{article.readingMinutes} min read</span>
      <span className="text-ink-muted">via {article.sourceName}</span>
    </div>
  );
}

function ReadLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/news/${slug}/`}
      className="mt-3 inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-forest-700 underline"
    >
      Read the full story
      <span aria-hidden>→</span>
    </Link>
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
