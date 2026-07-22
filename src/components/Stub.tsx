/**
 * Placeholder for a route that exists but has no content yet.
 *
 * Every route in SPEC.md §3 is scaffolded so the shape of the site is real and
 * the sitemap is complete. Content lands in build-order steps 4–6. Delete this
 * component once the last stub is replaced.
 */
export function Stub({
  title,
  intent,
  step,
}: {
  title: string;
  /** One line on what this page will do, from the spec. */
  intent: string;
  /** SPEC.md §5 build-order step that fills this in. */
  step: string;
}) {
  return (
    <article className="space-y-6">
      <h1 className="text-4xl font-semibold">{title}</h1>
      <p className="text-ink-muted">{intent}</p>
      <p className="rounded-md border border-sand-200 bg-sand-100 px-5 py-4 text-[0.95rem] text-ink-muted">
        Not written yet — SPEC.md §5, step {step}. No figures appear anywhere on
        this site until they are verified against an official source and
        recorded in <code className="font-mono">src/lib/data/programmes.ts</code>.
      </p>
    </article>
  );
}
