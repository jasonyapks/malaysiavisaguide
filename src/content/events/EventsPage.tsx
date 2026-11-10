import Link from "next/link";
import { reviewDate } from "@/lib/format";
import { localeUrl, type Locale } from "@/lib/i18n";
import { events, type SiteEvent } from "@/lib/data/events";
import { outboundRel } from "@/lib/site";
import { publisherRef } from "@/lib/schema";
import { NewsVideo } from "@/content/news/NewsStory";
import type { EventsCopy } from "./types";

/**
 * /events/ — the permanent home for webinars (audit task B4-6).
 *
 * A webinar used to exist only as two news stories, which scroll off the news
 * index within weeks. This page keeps every session: upcoming ones with their
 * registration link, past ones with the recording. "Upcoming" is decided at
 * build time, so an event moves to the replay list on the first deploy after
 * its date.
 */

const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline";

export function EventsPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: EventsCopy;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const byDate = (a: SiteEvent, b: SiteEvent) => a.date.localeCompare(b.date);
  const upcoming = events.filter((e) => e.date >= today).sort(byDate);
  const past = events.filter((e) => e.date < today).sort(byDate).reverse();

  const schema = past
    .filter((e) => e.youtubeId)
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: copy.events[e.id].title,
      description: copy.events[e.id].speakers,
      uploadDate: `${e.date}T${e.time}:00+08:00`,
      thumbnailUrl: `https://i.ytimg.com/vi/${e.youtubeId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${e.youtubeId}`,
      url: localeUrl("/events/", locale),
      publisher: publisherRef,
    }));

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{copy.heading}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.lead}
        </p>
        <p className="text-caption text-ink-muted">{copy.disclosure}</p>
      </header>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.upcoming.heading}
        </h2>
        {upcoming.length === 0 && <p>{copy.upcoming.none}</p>}
        {upcoming.map((e) => (
          <div key={e.id} className="card-outline space-y-3 p-6">
            <h3 className="text-lead font-semibold text-ink">
              {copy.events[e.id].title}
            </h3>
            <p>
              {reviewDate(e.date, locale)} · {e.time} (UTC+8) ·{" "}
              {copy.events[e.id].format}
            </p>
            <p>{copy.events[e.id].speakers}</p>
            {e.registrationUrl && (
              <a
                href={e.registrationUrl}
                target="_blank"
                rel={outboundRel(e.registrationUrl)}
                className="accent-fill inline-flex min-h-11 items-center rounded-full px-7 py-3 font-bold !text-forest-900 !no-underline"
              >
                {copy.upcoming.register}
              </a>
            )}
          </div>
        ))}
      </section>

      {past.length > 0 && (
        <section className="space-y-8">
          <h2 className="font-serif text-h3 font-semibold text-ink">
            {copy.past.heading}
          </h2>
          {past.map((e) => {
            const c = copy.events[e.id];
            return (
              <div key={e.id} id={e.id} className="scroll-mt-24 space-y-5">
                <h3 className="text-lead font-semibold text-ink">{c.title}</h3>
                <p className="text-caption text-ink-muted">
                  {copy.past.held(reviewDate(e.date, locale))} · {c.format}
                </p>
                {e.youtubeId && <NewsVideo id={e.youtubeId} title={c.title} />}
                <div className={PROSE}>
                  <p>{c.speakers}</p>
                  {c.summary}
                  <ul className="ml-5 list-disc space-y-1">
                    {e.guidePath && (
                      <li>
                        <Link href={e.guidePath}>{copy.past.readGuide}</Link>
                      </li>
                    )}
                    {e.newsPaths[0] && (
                      <li>
                        <Link href={e.newsPaths[0]}>{copy.past.announcement}</Link>
                      </li>
                    )}
                    {e.newsPaths[1] && (
                      <li>
                        <Link href={e.newsPaths[1]}>{copy.past.replayStory}</Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {schema.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </article>
  );
}
