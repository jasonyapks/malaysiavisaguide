import type { Metadata } from "next";
import Link from "next/link";
import { Byline } from "@/components/Byline";
import { Figure } from "@/components/Figure";
import { GuideHead, Lozenge } from "@/components/GuideHead";
import { CategoryChip } from "@/components/NewsCard";
import {
  articleImage,
  articleOgImage,
  newsImageKey,
} from "@/lib/articleImages";
import { htmlLang, localeUrl, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import {
  CATEGORY_GUIDE,
  categoryPath,
  newsDate,
  type FullNewsArticle,
} from "@/lib/news";
import { site } from "@/lib/site";
import { getUi } from "@/lib/ui";

/**
 * One page per news story — SPEC.md §3. One component, three hostnames.
 *
 * Prerendered at build time from the content tree, so a crawler is served real
 * HTML with the whole article in it. That is the difference between this and the
 * client-hydrated feed it replaced: the old /news could not rank, because there
 * was nothing in the response to rank.
 *
 * The article text is our own writing about the story, not the publisher's copy
 * — see the header of worker/src/article.ts for why that is both the legal and
 * the higher-ranking answer. The publisher gets a named credit, one attributed
 * quote, and a followed link out.
 *
 * ## The quote, in a language the publisher did not write in
 *
 * `sourceExcerpt` is a real quotation. On a translated page it is a translated
 * quotation, which has to be said rather than implied — `quoteTranslated` in the
 * UI dictionary is empty in English and carries the note in Chinese. Putting
 * words in a minister's mouth in a language he did not use them in, unlabelled,
 * is the one thing this page must not do.
 */

export function newsStoryMetadata(
  article: FullNewsArticle,
  locale: Locale,
): Metadata {
  const copy = getUi(locale).news;

  // The article's own social card when it has one, otherwise the site card from
  // the root layout — an article-specific image is most of the click-through on
  // a shared link, and the fallback keeps a card on every story regardless.
  const og = articleOgImage(newsImageKey(article.slug));

  return {
    ...pageMetadata({
      canonicalPath: `/news/${article.slug}/`,
      locale,
      title: article.headline,
      description: article.dek.slice(0, 300),
    }),
    openGraph: {
      type: "article",
      title: article.headline,
      description: article.dek,
      url: localeUrl(`/news/${article.slug}/`, locale),
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt ?? undefined,
      authors: ["Jason Yap"],
      section: copy.categoryLabel[article.category],
      ...(og && {
        images: [{ url: og, width: 1200, height: 630, alt: article.headline }],
      }),
    },
  };
}

export function NewsStory({
  article,
  locale,
}: {
  article: FullNewsArticle;
  locale: Locale;
}) {
  const copy = getUi(locale).news;
  const guide = CATEGORY_GUIDE[article.category];
  const published = newsDate(article.publishedAt, locale);
  const updated = newsDate(article.updatedAt, locale);
  const hero = articleImage(newsImageKey(article.slug));

  return (
    <article className="space-y-10">
      <Schemas article={article} locale={locale} />

      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <Link href="/news/" className="text-forest-700 underline">
          {copy.article.breadcrumbNews}
        </Link>
        <span aria-hidden> › </span>
        <Link
          href={categoryPath(article.category)}
          className="text-forest-700 underline"
        >
          {copy.categoryLabel[article.category]}
        </Link>
      </nav>

      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-eyebrow">
          <CategoryChip category={article.category} locale={locale} />
          {article.publishedAt && published && (
            <time className="text-ink-muted" dateTime={article.publishedAt}>
              {published}
            </time>
          )}
          <span className="text-ink-muted">
            {copy.card.minRead(article.readingMinutes)}
          </span>
        </div>

        <h1 className="text-h1 font-bold leading-tight">{article.headline}</h1>

        <p className="text-lead leading-relaxed text-ink-muted">
          {article.dek}
        </p>
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
          <h2 id="key-points" className="eyebrow">
            {copy.article.shortVersion}
          </h2>
          <ul className="mt-4 space-y-3 text-body-sm text-forest-900">
            {article.body.keyPoints.map((p) => (
              <li key={p} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2.5 size-1.5 shrink-0 rotate-45 rounded-[1px] bg-gold-500"
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
            <h2 className="font-serif text-h3 font-bold">{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p
                key={p}
                className="text-body-sm leading-relaxed text-ink-muted"
              >
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
            {copy.article.quotedFrom}{" "}
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-forest-700 underline"
            >
              {article.sourceName}
            </a>
            {copy.article.quoteTranslated && (
              <span> {copy.article.quoteTranslated}</span>
            )}
          </figcaption>
        </figure>
      )}

      {/* Jason's read. Wire copy does not have this, which is exactly why the
          page is worth landing on rather than the publisher's. */}
      {article.body.whatItMeans.length > 0 && (
        <section className="on-navy space-y-6 rounded-2xl bg-forest-900 px-7 py-8 text-sand-50">
          <GuideHead
            eyebrow={copy.article.whatItMeansEyebrow}
            title={
              <span className="!text-white">
                {copy.article.whatItMeansTitle}{" "}
                <span className="font-display accent-text font-medium italic">
                  {copy.article.whatItMeansAccent}
                </span>
              </span>
            }
          />
          <ul className="space-y-4 text-body-sm leading-relaxed">
            {article.body.whatItMeans.map((p) => (
              <li key={p} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2.5 size-1.5 shrink-0 rotate-45 rounded-[1px] bg-[#d4a017]"
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
        <h2 className="eyebrow">{copy.article.sourceHeading}</h2>
        <p className="mt-3">
          {copy.article.sourceBefore}
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-forest-700 underline"
          >
            {article.sourceName}
          </a>
          {copy.article.sourceAfter}
        </p>
        {updated && article.updatedAt !== article.publishedAt && (
          <p className="mt-2">{copy.article.lastUpdated(updated)}</p>
        )}
      </section>

      <Byline
        lastVerified={
          (article.updatedAt ?? article.publishedAt)?.slice(0, 10) ?? null
        }
        locale={locale}
      />

      {/* One CTA, pointing at the guide that actually answers the question the
          news raised. Also the internal link that keeps the blog from being a
          crawl dead end. */}
      <section className="relative overflow-hidden rounded-2xl border border-sand-200 bg-linear-to-br from-sand-100 via-sand-50 to-[#e9edf4] px-7 py-7">
        <div
          aria-hidden
          className="compass-arc [--arc-spin:80deg] -right-24 -bottom-32 size-[22rem] opacity-70"
        />
        <div className="relative space-y-4">
          <div className="diamond-rule max-w-xs">
            <Lozenge />
          </div>
          <p className="text-lead font-semibold text-forest-900">
            {copy.article.ctaLead}
          </p>
          <p className="text-ink-muted">
            {copy.article.ctaBefore}
            <Link
              href={guide ? guide.path : "/compare/"}
              className="font-semibold text-forest-700 underline"
            >
              {guide
                ? copy.guideTitle[article.category]
                : copy.comparisonTitle}
            </Link>
            {copy.article.ctaBetween}
            <Link
              href="/tools/eligibility/"
              className="font-semibold text-forest-700 underline"
            >
              {copy.eligibilityLink}
            </Link>
            {copy.article.ctaAfter}
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
 *
 * Every URL is the locale's own. `inLanguage` is stated for the same reason the
 * `<html lang>` is: this is a translation of our article, and a crawler that
 * assumes English of a Chinese page has been misled by us, not by itself.
 */
function Schemas({
  article,
  locale,
}: {
  article: FullNewsArticle;
  locale: Locale;
}) {
  const copy = getUi(locale).news;
  const origin = localeUrl("/", locale).replace(/\/$/, "");
  const url = localeUrl(`/news/${article.slug}/`, locale);
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
    inLanguage: htmlLang[locale],
    ...(og && { image: [`${origin}${og}`] }),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? article.publishedAt ?? undefined,
    articleSection: copy.categoryLabel[article.category],
    wordCount: article.body.sections
      .flatMap((s) => s.paragraphs)
      .join(" ")
      .split(/\s+/).length,
    author: {
      "@type": "Person",
      name: "Jason Yap",
      jobTitle: copy.article.authorJobTitle,
      url: localeUrl("/about/", locale),
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
      {
        "@type": "ListItem",
        position: 1,
        name: copy.article.breadcrumbHome,
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.article.breadcrumbNews,
        item: `${origin}/news/`,
      },
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
