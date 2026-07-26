import type { Programme } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";

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
export function SupersededNotice({ programme: p }: { programme: Programme }) {
  const s = p.superseded;
  if (!s) return null;

  return (
    <aside
      aria-label={`${p.name}: terms have changed`}
      className="rounded-xl border-l-4 border-alert-600 bg-sand-100 px-6 py-5"
    >
      <p className="text-[1.05rem] font-semibold text-forest-900">
        {p.name} terms changed on {s.changedOn}
        {s.figuresPending && " — the figures below are the previous ones"}
      </p>

      <ul className="mt-3 space-y-2 text-[1rem] leading-relaxed">
        {s.whatChanged.map((c) => (
          <li key={c} className="ml-5 list-disc">
            {c}
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-sand-200 pt-3 text-[0.9rem] leading-relaxed text-ink-muted">
        Confirmed by <strong>{s.attribution.by}</strong>, current as at{" "}
        {reviewDate(s.attribution.asAt)}. The{" "}
        <a
          href={p.source}
          className="underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          official {p.authority} document
        </a>{" "}
        has not yet been updated, so these terms cannot be cited to a government
        source.{" "}
        {s.figuresPending &&
          "Until it is, treat every figure on this page as needing confirmation before you act on it."}
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
