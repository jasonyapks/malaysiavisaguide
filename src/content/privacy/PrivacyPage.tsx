import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { reviewDate } from "@/lib/format";
import { CookiePreferences } from "@/components/CookiePreferences";
import type { PrivacyCopy } from "./types";

/**
 * The privacy page layout, shared by all three locales.
 *
 * Everything here is structure. Every word comes in through `copy` — except the
 * two cookie identifiers and the date below, which are facts about the site
 * rather than prose and are single-sourced here for that reason.
 */

/** Update whenever the substance of the policy changes, not on a re-word. */
export const LAST_UPDATED = "2026-07-28";

const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";

export function PrivacyPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: PrivacyCopy;
}) {
  const href = (path: string) => linkPath(path, locale);

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{copy.title}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.standfirst}
        </p>
      </header>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.who.heading}
        </h2>
        {copy.who.body(href)}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.measured.heading}
        </h2>
        {copy.measured.body}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.stored.heading}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-sand-400">
                <th scope="col" className="py-2 pr-4 font-semibold text-ink">
                  {copy.stored.columns.name}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-ink">
                  {copy.stored.columns.what}
                </th>
                <th scope="col" className="py-2 font-semibold text-ink">
                  {copy.stored.columns.when}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand-200">
                <td className="py-3 pr-4 align-top font-mono text-caption">
                  mvg-consent
                </td>
                <td className="py-3 pr-4 align-top">
                  {copy.stored.consentCookie.what}
                </td>
                <td className="py-3 align-top">
                  {copy.stored.consentCookie.when}
                </td>
              </tr>
              <tr className="border-b border-sand-200">
                <td className="py-3 pr-4 align-top font-mono text-caption">
                  _ga, _ga_*
                </td>
                <td className="py-3 pr-4 align-top">
                  {copy.stored.analyticsCookies.what}
                </td>
                <td className="py-3 align-top">
                  {copy.stored.analyticsCookies.when}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {copy.stored.after}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.enquiry.heading}
        </h2>
        {copy.enquiry.body(href)}
      </section>

      <section className={`${PROSE} space-y-5`}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.control.heading}
        </h2>
        {copy.control.intro}
        <CookiePreferences strings={copy.control.preferences} />
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.rights.heading}
        </h2>
        {copy.rights.body}
      </section>

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.changes.heading}
        </h2>
        {copy.changes.body}
        <p className="text-caption">
          <strong>{copy.changes.lastUpdatedLabel}</strong>{" "}
          {reviewDate(LAST_UPDATED, locale)}
        </p>
      </section>
    </article>
  );
}
