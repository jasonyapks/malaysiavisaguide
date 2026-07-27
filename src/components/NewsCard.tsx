import Link from "next/link";
import { Figure } from "@/components/Figure";
import { articleImage, newsImageKey } from "@/lib/articleImages";
import {
  CATEGORY_LABEL,
  categoryPath,
  newsDate,
  type NewsArticle,
} from "@/lib/news";

/**
 * The story cards, shared by /news and by each /news/category/<category>/ page.
 *
 * They live here rather than in the index page because there are now two
 * indexes rendering the same list. Two copies of this markup would drift the
 * first time either one is restyled, and the drift would show up as two
 * different-looking feeds on the same site.
 */

/** The most recent story, given the room it deserves. */
export function NewsLeadCard({
  article,
  showCategory = true,
}: {
  article: NewsArticle;
  showCategory?: boolean;
}) {
  const image = articleImage(newsImageKey(article.slug));

  return (
    <article className="card-outline px-7 py-7 sm:px-9 sm:py-8">
      {/* Only the lead card carries a picture. Every card having one turns the
          index into a grid of thumbnails competing with each other; one does the
          job a lead is for, which is to say where the eye starts. The alt is
          empty because the headline immediately below is the link — a screen
          reader hearing the scene described first would be hearing furniture. */}
      {image && (
        <Link href={`/news/${article.slug}/`} className="mb-5 block" tabIndex={-1} aria-hidden>
          <Figure
            image={{ ...image, alt: "", credit: undefined }}
            aspect="aspect-[16/9]"
            sizes="(min-width: 1024px) 680px, 100vw"
          />
        </Link>
      )}
      <NewsMeta article={article} showCategory={showCategory} />
      <h2 className="mt-3 text-h2 font-extrabold leading-tight">
        <Link href={`/news/${article.slug}/`} className="hover:text-forest-700">
          {article.headline}
        </Link>
      </h2>
      <p className="mt-3 text-lead leading-relaxed text-ink-muted">
        {article.dek}
      </p>
      <ReadLink slug={article.slug} />
    </article>
  );
}

export function NewsCard({
  article,
  /** Off on a category page, where the chip would repeat the page's own <h1>. */
  showCategory = true,
}: {
  article: NewsArticle;
  showCategory?: boolean;
}) {
  return (
    <article className="border-b border-sand-200 pb-6">
      <NewsMeta article={article} showCategory={showCategory} />
      <h2 className="mt-2 font-serif text-lead font-bold text-ink">
        <Link href={`/news/${article.slug}/`} className="hover:text-forest-700">
          {article.headline}
        </Link>
      </h2>
      <p className="mt-1.5 text-body-sm leading-relaxed text-ink-muted">
        {article.dek}
      </p>
      <ReadLink slug={article.slug} />
    </article>
  );
}

/**
 * The byline strip above every headline.
 *
 * `showCategory` is off on a category page: every card there is already in that
 * category, so the chip would repeat the page's own <h1> once per card and,
 * worse, link every card back to the page the reader is standing on.
 */
export function NewsMeta({
  article,
  showCategory = true,
}: {
  article: NewsArticle;
  showCategory?: boolean;
}) {
  const date = newsDate(article.publishedAt);
  return (
    <div className="flex flex-wrap items-center gap-3 text-eyebrow">
      {showCategory && <CategoryChip category={article.category} />}
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

/**
 * The category label as a link to that category's index.
 *
 * It was a plain <span> until the category pages existed. Making it a link is
 * most of what "browse by category" means in practice: the reader forms the
 * intent while looking at a story, and the chip is already where they are
 * looking.
 */
export function CategoryChip({
  category,
  className = "",
}: {
  category: NewsArticle["category"];
  className?: string;
}) {
  return (
    // Sized to sit inline in the byline row rather than to the 44px standalone
    // target — WCAG 2.5.8 exempts a target inline in a run of text, and forcing
    // it to 44px here would break the row it belongs to. Hover carries an
    // underline as well as a fill change, so the state is not colour alone.
    <Link
      href={categoryPath(category)}
      className={`rounded-full bg-forest-50 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-forest-700 transition-colors duration-150 hover:bg-forest-100 hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700 ${className}`}
    >
      {CATEGORY_LABEL[category]}
    </Link>
  );
}

function ReadLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/news/${slug}/`}
      className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-forest-700 underline"
    >
      Read the full story
      <span aria-hidden>→</span>
    </Link>
  );
}
