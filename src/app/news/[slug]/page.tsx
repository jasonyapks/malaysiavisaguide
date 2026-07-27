import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Byline } from "@/components/Byline";
import { Figure } from "@/components/Figure";
import { GuideHead, Lozenge } from "@/components/GuideHead";
import { CategoryChip } from "@/components/NewsCard";
import { articleImage, articleOgImage, newsImageKey } from "@/lib/articleImages";
import {
  CATEGORY_GUIDE,
  CATEGORY_LABEL,
  categoryPath,
  getArticle,
  getNewsIndex,
  newsDate,
  type FullNewsArticle,
} from "@/lib/news";
import { site } from "@/lib/site";

/**
 * One page per news story — SPEC.md §3.
 *
 * Prerendered at build time from the news Worker, so a crawler is served real
 * HTML with the whole article in it. That is the difference between this and the
 * client-hydrated feed it replaced: the old /news could not rank, because there
 * was nothing in the response to rank.
 *
 * The article text is our own writing about the story, not the publisher's copy
 * — see the header of worker/src/article.ts for why that is both the legal and
 * the higher-ranking answer. The publisher gets a named credit, one attributed
 * quote, and a followed link out.
 */

// Every slug is known at build time. Without this, a request for an unknown
// slug would try to render on demand — which a static export cannot do.
export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await getNewsIndex();

  // Next refuses to build a dynamic route that yields zero paths under
  // `output: "export"`, and says only that generateStaticParams is "missing",
  // which sends you looking for a bug in this file. It is not a bug in this
  // file: there is simply nothing published yet. Say so.
  if (items.length === 0) {
    throw new Error(
      "No published news articles, so /news/[slug] has no pages to generate — " +
        "and a static export cannot build a dynamic route with zero paths.\n\n" +
        "Publish at least one article: open the dashboard, pick an item from the " +
        "pending queue and press “Write article & publish”, then rebuild. To check " +
        "the blog against a local Worker first:\n" +
        "  cd worker && npx wrangler dev\n" +
        "  NEWS_API_URL=http://localhost:8787/api/news npm run build",
    );
  }

  return items.map((it) => ({ slug: it.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const url = `/news/${article.slug}/`;

  // The article's own social card when it has one, otherwise the site card from
  // the root layout — an article-specific image is most of the click-through on
  // a shared link, and the fallback keeps a card on every story regardless.
  const og = articleOgImage(newsImageKey(article.slug));

  return {
    title: article.headline,
    description: article.dek.slice(0, 300),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.headline,
      description: article.dek,
      url,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt ?? undefined,
      authors: ["Jason Yap"],
      section: CATEGORY_LABEL[article.category],
      ...(og && {
        images: [{ url: og, width: 1200, height: 630, alt: article.headline }],
      }),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const guide = CATEGORY_GUIDE[article.category];
  const published = newsDate(article.publishedAt);
  const updated = newsDate(article.updatedAt);
  const hero = articleImage(newsImageKey(article.slug));

  return (
    <article className="space-y-10">
      <Schemas article={article} />

      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <Link href="/news/" className="text-forest-700 underline">
          News
        </Link>
        <span aria-hidden> › </span>
        <Link href={categoryPath(article.category)} className="text-forest-700 underline">
          {CATEGORY_LABEL[article.category]}
        </Link>
      </nav>

      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-eyebrow">
          <CategoryChip category={article.category} />
          {article.publishedAt && published && (
            <time className="text-ink-muted" dateTime={article.publishedAt}>
              {published}
            </time>
          )}
          <span className="text-ink-muted">{article.readingMinutes} min read</span>
        </div>

        <h1 className="text-h1 font-extrabold leading-tight">
          {article.headline}
        </h1>

        <p className="text-lead leading-relaxed text-ink-muted">{article.dek}</p>
      </header>

      {/* The hero, when one has been generated. It sits under the standfirst
          rather than above the h1 so the headline is still the first thing on
          screen — this reader arrived from a search result and is checking they
          landed on the right story. `priority` because it is then the LCP. */}
      {hero && <Figure image={hero} aspect="aspect-[16/9]" priority />}

      {/* The takeaways, first and scannable. This is the block a reader in a
          hurry reads, and the block AI Overviews lift when they cite a page. */}
      {article.body.keyPoints.length > 0 && (
        <section
          aria-labelledby="key-points"
          className="card-flat border-l-4 border-l-forest-600 px-7 py-6"
        >
          <h2
            id="key-points"
            className="font-serif text-eyebrow font-bold uppercase tracking-[0.22em] text-forest-700"
          >
            The short version
          </h2>
          <ul className="mt-4 space-y-3 text-body-sm text-forest-900">
            {article.body.keyPoints.map((p) => (
              <li key={p} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2.5 size-1.5 shrink-0 rotate-45 rounded-[1px] bg-forest-600/70"
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-9">
        {article.body.sections.map((s) => (
          <section key={s.heading} className="space-y-4">
            <h2 className="font-serif text-h3 font-extrabold">{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="text-body-sm leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      {/* The publisher's one quote, unmistakably theirs: attributed inline, set
          apart typographically, and followed by a link to the original. */}
      {article.sourceExcerpt && (
        <figure className="border-l-4 border-sand-400 bg-sand-100 py-5 pl-6 pr-5">
          <blockquote className="font-serif text-lead italic leading-relaxed text-forest-900">
            {`“${article.sourceExcerpt}”`}
          </blockquote>
          <figcaption className="mt-3 text-caption text-ink-muted">
            Quoted from{" "}
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-forest-700 underline"
            >
              {article.sourceName}
            </a>
          </figcaption>
        </figure>
      )}

      {/* Jason's read. Wire copy does not have this, which is exactly why the
          page is worth landing on rather than the publisher's. */}
      {article.body.whatItMeans.length > 0 && (
        <section className="on-navy space-y-6 rounded-2xl bg-forest-900 px-7 py-8 text-sand-50">
          <GuideHead
            eyebrow="What it means"
            title={
              <span className="!text-white">
                What this changes{" "}
                <span className="font-display accent-text font-medium italic">
                  for an applicant
                </span>
              </span>
            }
          />
          <ul className="space-y-4 text-body-sm leading-relaxed">
            {article.body.whatItMeans.map((p) => (
              <li key={p} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2.5 size-1.5 shrink-0 rotate-45 rounded-[1px] bg-[#82c8e5]"
                />
                <span className="text-sand-50/90">{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Provenance, stated plainly. The independence claim on every other page
          is only credible if the news pages are equally explicit about what is
          ours and what is the publisher's. */}
      <section className="rounded-xl border border-sand-200 bg-sand-50 px-6 py-5 text-body-sm leading-relaxed text-ink-muted">
        <h2 className="font-serif text-eyebrow font-bold uppercase tracking-[0.22em] text-forest-700">
          Source
        </h2>
        <p className="mt-3">
          This article was written by Malaysia Visa Guide, based on reporting by{" "}
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-forest-700 underline"
          >
            {article.sourceName}
          </a>
          . We summarise and explain the news in our own words; we do not
          reproduce it. Read the original report for the publisher&apos;s full
          account.
        </p>
        {updated && article.updatedAt !== article.publishedAt && (
          <p className="mt-2">Last updated {updated}.</p>
        )}
      </section>

      <Byline
        lastVerified={(article.updatedAt ?? article.publishedAt)?.slice(0, 10) ?? null}
      />

      {/* One CTA, pointing at the guide that actually answers the question the
          news raised. Also the internal link that keeps the blog from being a
          crawl dead end. */}
      <section className="relative overflow-hidden rounded-2xl border border-sand-200 bg-linear-to-br from-sand-100 via-sand-50 to-[#dce8f6] px-7 py-7">
        <div aria-hidden className="ring-decor -right-24 -bottom-32 size-[22rem] opacity-70" />
        <div className="relative space-y-4">
          <div className="diamond-rule max-w-xs">
            <Lozenge />
          </div>
          <p className="text-lead font-semibold text-forest-900">
            News is a starting point, not advice.
          </p>
          <p className="text-ink-muted">
            For what this means in your own case, the verified figures live in{" "}
            {guide ? (
              <Link href={guide.path} className="font-semibold text-forest-700 underline">
                {guide.title}
              </Link>
            ) : (
              <Link href="/compare/" className="font-semibold text-forest-700 underline">
                the programme comparison
              </Link>
            )}
            , or{" "}
            <Link
              href="/tools/eligibility/"
              className="font-semibold text-forest-700 underline"
            >
              run the eligibility checker
            </Link>
            .
          </p>
        </div>
      </section>
    </article>
  );
}

/**
 * NewsArticle + BreadcrumbList — SPEC.md §4.4.
 *
 * `isBasedOn` and `citation` are the honest schema description of what this page
 * is: our own article derived from someone else's reporting. Search engines read
 * that as attribution rather than as a duplicate-content signal, which is the
 * outcome we want on both counts.
 */
function Schemas({ article }: { article: FullNewsArticle }) {
  const url = `${site.url}/news/${article.slug}/`;
  // Google's article rich result wants an image, and the 1200×630 card is the
  // one that meets its minimum width. Absolute — a relative path in JSON-LD is
  // ignored rather than resolved.
  const og = articleOgImage(newsImageKey(article.slug));

  const newsArticle = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headline,
    description: article.dek,
    url,
    ...(og && { image: [`${site.url}${og}`] }),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? article.publishedAt ?? undefined,
    articleSection: CATEGORY_LABEL[article.category],
    wordCount: article.body.sections
      .flatMap((s) => s.paragraphs)
      .join(" ")
      .split(/\s+/).length,
    author: {
      "@type": "Person",
      name: "Jason Yap",
      jobTitle: "Managing Director, MYPVIP",
      url: `${site.url}/about/`,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    isBasedOn: article.sourceUrl,
    citation: {
      "@type": "CreativeWork",
      url: article.sourceUrl,
      publisher: { "@type": "Organization", name: article.sourceName },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: "News", item: `${site.url}/news/` },
      { "@type": "ListItem", position: 3, name: article.headline, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
