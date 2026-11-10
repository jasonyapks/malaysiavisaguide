import type { Programme } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";

/**
 * The permanent change log on a programme guide (audit task B5-3).
 *
 * The same facts used to live only inside the "Show what changed" disclosure at
 * the top of the page — collapsed, with no heading and no anchor, so nothing
 * could link to it and a reader skimming the contents rail never knew it was
 * there. This is a real section with a real table: date, what changed, what it
 * means for an applicant, and whose word it rests on.
 *
 * It reads `programme.superseded`, the one place a change is recorded, so the
 * log and the notice at the top cannot disagree. A guide with nothing recorded
 * says so plainly rather than leaving the section out: "nothing has changed"
 * is an answer, and its absence would read as "we did not look".
 */
export function ChangeLog({
  programme: p,
  name,
  published,
  locale,
}: {
  programme: Programme;
  /** The programme's short name, for the question heading. */
  name: string;
  /** ISO date the guide was first published. */
  published?: string;
  locale: Locale;
}) {
  const c = getUi(locale).guide.changeLog;
  const s = p.superseded;
  const cell = "px-4 py-3 align-top sm:px-5";

  return (
    <section id="change-log" className="scroll-mt-24 space-y-4">
      <h2 className="font-serif text-h3 font-semibold text-forest-900">
        {c.heading(name)}
      </h2>
      {!s ? (
        <p className="max-w-3xl text-body-sm leading-relaxed text-ink-muted">
          {c.none(
            published ? reviewDate(published, locale) : "",
            reviewDate(p.lastVerified, locale),
          )}
        </p>
      ) : (
        <>
          <p className="max-w-3xl text-body-sm leading-relaxed text-ink-muted">
            {c.lead}
          </p>
          <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
            <table className="w-full min-w-[40rem] border-collapse text-left text-body-sm">
              <thead>
                <tr className="border-b border-sand-200 text-ink-muted">
                  <th scope="col" className={`${cell} font-medium`}>{c.date}</th>
                  <th scope="col" className={`${cell} font-medium`}>{c.whatChanged}</th>
                  <th scope="col" className={`${cell} font-medium`}>{c.effect}</th>
                  <th scope="col" className={`${cell} font-medium`}>{c.source}</th>
                </tr>
              </thead>
              <tbody>
                {s.whatChanged.map((change, i) => (
                  <tr key={change} className="border-b border-sand-200 last:border-b-0">
                    <th scope="row" className={`${cell} whitespace-nowrap font-semibold text-forest-900`}>
                      <time dateTime={s.changedOn}>
                        {reviewDate(s.changedOn, locale)}
                      </time>
                    </th>
                    <td className={cell}>{change}</td>
                    <td className={cell}>{s.effects[i]}</td>
                    <td className={`${cell} text-ink-muted`}>
                      {c.sourceLine(
                        s.attribution.by,
                        reviewDate(s.attribution.asAt, locale),
                      )}{" "}
                      <a
                        href={p.source}
                        className="text-forest-700 underline"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {c.officialNotUpdated(p.authority)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
