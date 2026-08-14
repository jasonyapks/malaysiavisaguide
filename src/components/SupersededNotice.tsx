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
export function SupersededNotice({
  programme: p,
  locale = "en",
}: {
  programme: Programme;
  /** Defaults to English so the comparison table, calculator and quiz — which
   *  are not translated yet — keep working unchanged. */
  locale?: Locale;
}) {
  const sup = getUi(locale).guide.superseded;
  const s = p.superseded;
  if (!s) return null;

  return (
    <aside
      aria-label={`${p.name}: terms have changed`}
      className="rounded-xl border-l-4 border-alert-600 bg-sand-100 px-6 py-5"
    >
      {/*
       * A disclosure, and URGENCY decides whether it starts open — not the
       * viewport. While `figuresPending` is true the numbers on the page are
       * the superseded ones, so the detail is not optional reading and the
       * panel is open everywhere. Once the figures are corrected it becomes
       * background: the headline and the attribution still show unprompted,
       * and the three bullets are one tap away.
       *
       * That distinction is what stops this being a dark pattern. Before it
       * was collapsed, this notice cost a full 390px screen ahead of the
       * comparison table on the site's most important page — a caveat nobody
       * scrolls past is not a caveat anyone reads.
       *
       * <details>/<summary> is used rather than a JS toggle because it is
       * keyboard-operable, screen-reader-announced and open-by-default for
       * printing and for Find-in-page, with no state to manage.
       */}
      <details open={s.figuresPending} className="group">
        <summary className="cursor-pointer list-none text-body-sm font-semibold text-forest-900 [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-alert-600 decoration-2 underline-offset-4">
            {sup.termsChangedOn(p.name, s.changedOn)}
          </span>
          {s.figuresPending && sup.figuresArePrevious}
          <span className="ml-2 font-normal text-ink-muted group-open:hidden">
            {sup.showWhatChanged}
          </span>
          <span className="ml-2 hidden font-normal text-ink-muted group-open:inline">
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
      </details>

      <p className="mt-4 border-t border-sand-200 pt-3 text-caption leading-relaxed text-ink-muted">
        {sup.confirmedByBefore}
        <strong>{s.attribution.by}</strong>
        {sup.confirmedByAfter(reviewDate(s.attribution.asAt, locale))}
        <a
          href={p.source}
          className="underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          {sup.officialDocument(p.authority)}
        </a>
        {sup.notYetUpdated}
        {s.figuresPending && sup.treatAsUnconfirmed}
      </p>
    </aside>
  );
}

/**
 * The same notice for a page that shows several programmes at once — the
 * comparison table, the calculator, the quiz. Renders nothing when every
 * programme's source is current.
 */
export function SupersededNotices({
  programmes,
}: {
  programmes: Programme[];
}) {
  const affected = programmes.filter((p) => p.superseded);
  if (affected.length === 0) return null;

  return (
    <div className="space-y-4">
      {affected.map((p) => (
        <SupersededNotice key={p.slug} programme={p} />
      ))}
    </div>
  );
}
