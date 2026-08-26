import type { Programme } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getUi } from "@/lib/ui";

/**
 * The visible half of the `superseded` mechanism in programmes.ts.
 *
 * A programme whose official source has fallen behind gets a dated, attributed
 * notice rather than a silently stale card. Two rules make this honest rather
 * than a hedge:
 *
 *   1. It is impossible to miss. The reader who would otherwise act on a wrong
 *      fee sees the warning in the same glance as the fee.
 *   2. It names whose word the new terms rest on and states what the official
 *      document still says. Attribution is not a substitute for a source; it is
 *      a source of a weaker, declared kind, and the reader gets to weigh it.
 *
 * Renders nothing when the programme's source is current, so it can be dropped
 * into any page that shows figures without a conditional at the call site.
 */

/**
 * One notice, for one change, covering every programme it applies to.
 *
 * ## Why this takes a list of names
 *
 * A change is a property of a *document*, not of a programme. One MOTAC guide
 * revision changed MM2H Silver, Gold and Platinum on the same day, on the same
 * authority, with the same two bullets — so rendering it per-programme printed
 * the identical paragraph three times, and a page showing every tier opened
 * with four near-identical red blocks and no hierarchy to read. Grouped, the
 * reader gets one line per real event, with the tiers it hits named where they
 * are actually scanned for.
 */
function Notice({
  names,
  superseded: s,
  source,
  authority,
  locale,
}: {
  names: string[];
  superseded: NonNullable<Programme["superseded"]>;
  source: string;
  authority: string;
  locale: Locale;
}) {
  const sup = getUi(locale).guide.superseded;
  const nameList = joinNames(names, sup.nameSeparator);

  /*
   * URGENCY decides what shows unprompted — not the viewport.
   *
   * While `figuresPending` is true the numbers on the page are the superseded
   * ones, so nothing here is optional reading: the panel starts open, and the
   * attribution is part of what a reader needs before acting on any figure.
   *
   * Once the figures are corrected this becomes background, and the summary
   * carries what a scanning reader needs — which programmes, and when. What
   * changed, and whose word it rests on, are one tap away.
   *
   * The attribution used to sit outside the disclosure, always visible. That
   * made the longest and least urgent text the permanent cost of the notice:
   * four lines per programme, before the reader had asked for any of it.
   * Moving it inside applies the same reasoning that collapsed the bullets in
   * the first place — a caveat nobody scrolls past is not a caveat anyone
   * reads — and `figuresPending` is what keeps it honest, because the case
   * where the detail is load-bearing is exactly the case that stays open.
   *
   * <details>/<summary> rather than a JS toggle because it is keyboard-
   * operable, screen-reader-announced and open by default for printing and for
   * Find-in-page, with no state to manage.
   */
  return (
    <aside
      aria-label={sup.termsChangedLabel(nameList)}
      className="rounded-xl border-l-4 border-alert-600 bg-sand-100 px-5 py-4"
    >
      <details open={s.figuresPending} className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-2 gap-y-1 text-body-sm [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="self-center text-alert-600">
            ⚠
          </span>
          {/* The programmes first. This is the word a reader scans for — "does
              this affect the one I am looking at?" — and it used to sit in the
              middle of the sentence. */}
          <span className="font-semibold text-forest-900">{nameList}</span>
          <span className="text-ink-muted">
            {sup.changedOn(reviewDate(s.changedOn, locale))}
            {s.figuresPending && sup.figuresArePrevious}
          </span>
          <span className="ml-auto shrink-0 font-medium text-forest-700 underline decoration-alert-600 decoration-2 underline-offset-4 group-open:hidden">
            {sup.showWhatChanged}
          </span>
          <span className="ml-auto hidden shrink-0 font-medium text-forest-700 underline decoration-alert-600 decoration-2 underline-offset-4 group-open:inline">
            {sup.hide}
          </span>
        </summary>

        <ul className="mt-3 space-y-2 text-body-sm leading-relaxed">
          {s.whatChanged.map((c) => (
            <li key={c} className="ml-5 list-disc">
              {c}
            </li>
          ))}
        </ul>

        <p className="mt-4 border-t border-sand-200 pt-3 text-caption leading-relaxed text-ink-muted">
          {sup.confirmedByBefore}
          <strong>{s.attribution.by}</strong>
          {sup.confirmedByAfter(reviewDate(s.attribution.asAt, locale))}
          <a
            href={source}
            className="underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {sup.officialDocument(authority)}
          </a>
          {sup.notYetUpdated}
          {s.figuresPending && sup.treatAsUnconfirmed}
        </p>
      </details>
    </aside>
  );
}

/**
 * Join the programme names, eliding a shared leading word.
 *
 * The three MM2H tiers grouped into one notice read "MM2H Silver, MM2H Gold,
 * MM2H Platinum" — the prefix three times, on the line whose whole job is to be
 * scanned. "MM2H Silver, Gold, Platinum" is how anyone would say it out loud,
 * and it keeps the row on one line at the width the notice actually gets.
 *
 * Only when every name shares that first word, so a group spanning two
 * programme families is never silently mangled into implying one.
 */
function joinNames(names: string[], separator: string): string {
  if (names.length < 2) return names.join(separator);
  const [first] = names[0].split(" ");
  const sharesPrefix = names.every(
    (n) => n.split(" ")[0] === first && n.split(" ").length > 1,
  );
  if (!sharesPrefix) return names.join(separator);
  return [
    names[0],
    ...names.slice(1).map((n) => n.slice(first.length + 1)),
  ].join(separator);
}

/** The notice for a single programme — the guide pages and the insight blocks. */
export function SupersededNotice({
  programme: p,
  locale = "en",
}: {
  programme: Programme;
  /** Defaults to English so untranslated call sites read unchanged. */
  locale?: Locale;
}) {
  if (!p.superseded) return null;
  return (
    <Notice
      names={[p.name]}
      superseded={p.superseded}
      source={p.source}
      authority={p.authority}
      locale={locale}
    />
  );
}

/**
 * The notice for a page that shows several programmes at once — the comparison
 * table, the calculator, the quiz. Renders nothing when every programme's
 * source is current.
 *
 * Programmes sharing one change are merged into a single notice. The identity
 * of a change is its date, its authority, its attribution and what it says —
 * not the date alone, because two programmes corrected on the same day by
 * different authorities are two events and have to stay two notices.
 */
export function SupersededNotices({
  programmes,
  locale = "en",
}: {
  programmes: Programme[];
  /* Defaulted rather than required so the English call sites read unchanged —
     but it must be passed on a translated page, or the one notice warning a
     reader that a figure is out of date arrives in a language they may not
     read. The singular above has always taken it; the plural used to drop it. */
  locale?: Locale;
}) {
  const groups = new Map<string, { names: string[]; programme: Programme }>();

  for (const p of programmes) {
    const s = p.superseded;
    if (!s) continue;
    const key = JSON.stringify([
      s.changedOn,
      s.figuresPending,
      s.attribution.by,
      s.attribution.asAt,
      s.whatChanged,
      p.authority,
      p.source,
    ]);
    const existing = groups.get(key);
    if (existing) existing.names.push(p.name);
    else groups.set(key, { names: [p.name], programme: p });
  }

  if (groups.size === 0) return null;

  return (
    <div className="space-y-3">
      {[...groups.entries()].map(([key, g]) => (
        <Notice
          key={key}
          names={g.names}
          superseded={g.programme.superseded!}
          source={g.programme.source}
          authority={g.programme.authority}
          locale={locale}
        />
      ))}
    </div>
  );
}
