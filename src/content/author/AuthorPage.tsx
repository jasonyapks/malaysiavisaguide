import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { images } from "@/lib/images";
import { insightPath } from "@/lib/data/insights";
import { publishedInsights } from "@/lib/insights";
import { getNewsIndex } from "@/lib/news";
import { personSchema } from "@/lib/schema";
import { localisedNavRoutes, site } from "@/lib/site";
import { Figure } from "@/components/Figure";
import type { AuthorCopy } from "./types";

/**
 * /about/jason-yap/ — the author page, shared by all three locales.
 *
 * This is the page the Person node in the JSON-LD lives on (its `@id` is this
 * URL + `#person`), and the page every byline links to. /about/ stays "About
 * this guide"; the two link to each other.
 *
 * The list of work is read from the route table and the published articles at
 * build time, so it cannot fall behind the site.
 */

const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";
const H2 = "font-serif text-h3 font-semibold text-ink";

export async function AuthorPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: AuthorCopy;
}) {
  const guides = [
    ...localisedNavRoutes("programmes", locale),
    ...localisedNavRoutes("work-study", locale),
  ];
  const insights = await publishedInsights(locale);
  const news = await getNewsIndex(locale);

  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@id": site.author.id },
  };

  return (
    <article className="space-y-12">
      <header className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-start">
        <Figure
          image={{ ...images.about, alt: copy.portraitAlt }}
          aspect="aspect-[4/5]"
          rounded="rounded-xl"
          sizes="200px"
          className="max-w-[200px]"
          priority
        />
        <div className="space-y-4">
          <h1 className="text-h1 font-semibold">{site.author.name}</h1>
          <p className="eyebrow">{copy.qualifier}</p>
          <div className={PROSE}>{copy.bio}</div>
        </div>
      </header>

      <section className={PROSE}>
        <h2 className={H2}>{copy.roles.heading}</h2>
        <ul className="space-y-2">
          {copy.roles.items.map((r, i) => (
            <li key={i}>
              <strong>{r.role}</strong>, {r.where}
            </li>
          ))}
        </ul>
      </section>

      <section className={PROSE}>
        <h2 className={H2}>{copy.languages.heading}</h2>
        <p>{copy.languages.body}</p>
      </section>

      <section className={PROSE}>
        <h2 className={H2}>{copy.work.heading}</h2>
        <p>{copy.work.intro}</p>
        <h3 className="font-semibold text-ink">{copy.work.guides}</h3>
        <ul className="ml-5 list-disc space-y-1">
          {guides.map((g) => (
            <li key={g.path}>
              <Link href={g.path}>{g.title}</Link>
            </li>
          ))}
        </ul>
        {insights.length > 0 && (
          <>
            <h3 className="font-semibold text-ink">{copy.work.insights}</h3>
            <ul className="ml-5 list-disc space-y-1">
              {insights.map((a) => (
                <li key={insightPath(a)}>
                  <Link href={insightPath(a)}>{a.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {news.length > 0 && <p>{copy.work.news(news.length)}</p>}
      </section>

      <section className={PROSE}>
        <h2 className={H2}>{copy.conflicts.heading}</h2>
        {copy.conflicts.body}
      </section>

      <section className={PROSE}>
        <h2 className={H2}>{copy.contact.heading}</h2>
        <p>{copy.contact.body}</p>
        <p>{copy.aboutLink}</p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            personSchema(locale, copy.schemaDescription),
            profileSchema,
          ]),
        }}
      />
    </article>
  );
}
