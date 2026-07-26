/**
 * Centred eyebrow + display heading + slate lozenge rule — the section rhythm
 * the guide pages borrow from connectinasia.com/mm2h.
 *
 * Lives in its own file rather than in GuideLayout because <Faq> uses it too,
 * and GuideLayout already imports <Faq> — putting it there would make the two
 * modules import each other.
 */
export function GuideHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mx-auto max-w-3xl text-3xl sm:text-4xl">{title}</h2>
      {sub && <p className="mx-auto max-w-2xl text-ink-muted">{sub}</p>}
      <div className="diamond-rule mx-auto max-w-xs pt-1">
        <Lozenge />
      </div>
    </div>
  );
}

/** The small sky-blue diamond that sits at the centre of a hairline rule. */
export function Lozenge() {
  return (
    <span
      aria-hidden
      className="size-1.5 shrink-0 rotate-45 rounded-[1px] bg-forest-600/70"
    />
  );
}
