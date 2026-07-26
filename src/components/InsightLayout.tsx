import Link from "next/link";
import { Byline } from "@/components/Byline";
import { Faq, type FaqItem } from "@/components/Faq";
import {
  CATEGORY_LABEL,
  categoryPath,
  insightPath,
  type Insight,
  type InsightCategory,
} from "@/lib/data/insights";
import { reviewDate } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * The shell every /insights/ article renders inside, plus the card and browse
 * strip its indexes use.
 *
 * Deliberately not GuideLayout: that component takes a `Programme` and builds
 * the answer-first / key-facts / who-it-suits shape around it, which is right
 * for a page about one programme and wrong for an article about the choice
 * between three. What carries over is the furniture that earns trust — the
 * byline with its review date, the FAQ, the sources block — because for a 45+,
 * scam-alert reader that furniture is the conversion mechanism (SPEC.md §4.3).
 */

export function InsightLayout({
  article,
  sources,
  faq,
  children,
}: {
  article: Insight;
  /** Every figure in the body traces to one of these. Rendered, not optional. */
  sources: { label: string; url: string; verified: string }[];
  faq: FaqItem[];
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-10">
      <ArticleSchema article={article} />

      <nav aria-label="Breadcrumb" className="text-[0.85rem] text-ink-muted">
        <Link href="/insights/" className="text-forest-700 underline">
          Insights
        </Link>
        <span aria-hidden> › </span>
        <Link
          href={categoryPath(article.category)}
          className="text-forest-700 underline"
        >
          {CATEGORY_LABEL[article.category]}
        </Link>
      </nav>

      <header className="space-y-6">
        <p className="eyebrow">{CATEGORY_LABEL[article.category]}</p>
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          {article.title}
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          {article.dek}
        </p>
        <p className="text-[0.95rem] text-ink-muted">
          {article.readingMinutes} min read · Published{" "}
          {reviewDate(article.published)}
        </p>
      </header>

      <Byline lastVerified={article.reviewed} />

      {/* The prose. Sizing lives here rather than on each child so an article
          body stays plain semantic markup and inherits the reading measure. */}
      <div className="space-y-7 text-[1.0625rem] leading-[1.75]">{children}</div>

      <Faq items={faq} />

      <Sources sources={sources} />

      <Handoff article={article} />
    </article>
  );
}

/** A body heading. Articles use these instead of raw h2s so spacing is uniform. */
export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-4 text-[1.75rem] font-semibold leading-snug text-forest-900">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-2 text-[1.3rem] font-semibold leading-snug text-forest-700">
      {children}
    </h3>
  );
}

/**
 * The sentence the reader is meant to nod at. One per article at most — its
 * whole effect comes from being the only thing on the page that looks like this.
 */
export function Pullquote({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display accent-text border-l-4 border-forest-300 pl-6 text-[1.35rem] font-medium italic leading-snug">
      {children}
    </p>
  );
}

/** Tabular comparison. Scrolls on its own rather than pushing the page sideways. */
export function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-[0.95rem]">
        <caption className="pb-3 text-left text-[0.9rem] text-ink-muted">
          {caption}
        </caption>
        <thead>
          <tr className="bg-forest-900 text-sand-50">
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-sand-200 align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Every figure traces to an official document, with the date it was checked.
 * This block is the reason the page is citable — by a reader and by a model.
 */
function Sources({
  sources,
}: {
  sources: { label: string; url: string; verified: string }[];
}) {
  return (
    <section className="rounded-xl bg-sand-100 px-6 py-6">
      <h2 className="text-[1.1rem] font-semibold text-forest-900">Sources</h2>
      <p className="mt-2 text-[0.9rem] text-ink-muted">
        Every figure above comes from an official government document. Where an
        official source is silent, this site says so rather than fill the gap —
        see{" "}
        <Link href="/editorial-policy/" className="text-forest-700 underline">
          how we research and date pages
        </Link>
        .
      </p>
      <ul className="mt-4 space-y-2 text-[0.9rem]">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              className="text-forest-700 underline"
              rel="nofollow noopener"
              target="_blank"
            >
              {s.label}
            </a>
            <span className="text-ink-muted">
              {" "}
              — checked {reviewDate(s.verified)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Never end on a full stop. The article answers a question; this asks the next one. */
function Handoff({ article }: { article: Insight }) {
  return (
    <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
      This is a comparison, not advice on your own case. Read{" "}
      {article.relatedGuides.map((g, i) => (
        <span key={g.path}>
          {i > 0 && (i === article.relatedGuides.length - 1 ? " or " : ", ")}
          <Link href={g.path} className="font-semibold underline">
            {g.title}
          </Link>
        </span>
      ))}
      , or{" "}
      <Link href="/tools/eligibility/" className="font-semibold underline">
        run the eligibility checker
      </Link>{" "}
      against your own numbers.
    </p>
  );
}

function ArticleSchema({ article }: { article: Insight }) {
  const url = `${site.url}${insightPath(article)}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    url,
    datePublished: article.published,
    dateModified: article.reviewed,
    author: {
      "@type": "Person",
      name: "Jason Yap",
      jobTitle: "Managing Director, MYPVIP",
      url: `${site.url}/about/`,
    },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    isPartOf: {
      "@type": "WebPage",
      url: `${site.url}${categoryPath(article.category)}`,
      name: CATEGORY_LABEL[article.category],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function InsightCard({
  article,
  showCategory = true,
}: {
  article: Insight;
  showCategory?: boolean;
}) {
  return (
    <Link
      href={insightPath(article)}
      className="card-lux block px-6 py-6 transition-colors hover:border-forest-300"
    >
      {showCategory && (
        <p className="eyebrow">{CATEGORY_LABEL[article.category]}</p>
      )}
      <h3 className="mt-2 text-[1.35rem] font-semibold leading-snug text-forest-900">
        {article.title}
      </h3>
      <p className="mt-3 text-[1rem] leading-relaxed text-ink">{article.dek}</p>
      <p className="mt-4 text-[0.85rem] text-ink-muted">
        {article.readingMinutes} min read · Reviewed{" "}
        {reviewDate(article.reviewed)}
      </p>
    </Link>
  );
}

/** Browse-by-category strip. Only ever renders categories that have a page. */
export function InsightStrip({
  categories,
  current,
}: {
  categories: { category: InsightCategory; articles: Insight[] }[];
  current?: InsightCategory;
}) {
  if (categories.length === 0) return null;
  return (
    <nav aria-label="Browse by category" className="flex flex-wrap gap-3">
      {categories.map(({ category, articles }) => {
        const isCurrent = category === current;
        return (
          <Link
            key={category}
            href={categoryPath(category)}
            aria-current={isCurrent ? "page" : undefined}
            className={
              isCurrent
                ? "rounded-full bg-forest-900 px-4 py-2 text-[0.9rem] font-semibold text-sand-50"
                : "rounded-full border border-sand-200 px-4 py-2 text-[0.9rem] text-forest-700 transition-colors hover:border-forest-300"
            }
          >
            {CATEGORY_LABEL[category]}
            <span className="text-ink-muted"> ({articles.length})</span>
          </Link>
        );
      })}
    </nav>
  );
}
