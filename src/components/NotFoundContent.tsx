import Link from "next/link";
import { Lozenge } from "@/components/GuideHead";
import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { localisedNavRoutes } from "@/lib/site";
import { getUi } from "@/lib/ui";

/**
 * The body of the 404 page, shared by `app/global-not-found.tsx` and the
 * per-tree `not-found.tsx` files.
 *
 * It is built to recover the visit rather than apologise for it: the full set
 * of programme guides, one click away. That matters more than it used to —
 * /news/<slug> URLs are generated at build time, so an article written but not
 * yet deployed lands here, as does any old link once a slug changes.
 */
export function NotFoundContent({ locale }: { locale: Locale }) {
  const ui = getUi(locale);
  const groups = (["programmes", "work-study", "tools", "reading"] as const).map(
    (key) => ({
      key,
      label: ui.navGroups[key],
      routes: localisedNavRoutes(key, locale),
    }),
  );

  return (
    <div className="space-y-10 py-6">
      <header className="space-y-4">
        <p className="eyebrow">{ui.notFound.eyebrow}</p>
        <h1 className="text-h1 font-extrabold">
          {ui.notFound.heading}{" "}
          <span className="font-display accent-text font-medium italic">
            {ui.notFound.headingAccent}
          </span>
        </h1>
        <div className="diamond-rule max-w-xs">
          <Lozenge />
        </div>
        <p className="max-w-xl text-lead leading-relaxed text-ink-muted">
          {ui.notFound.lead}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        {groups.map((g) => (
          <nav key={g.key} className="card-outline p-6" aria-label={g.label}>
            <h2 className="font-serif text-eyebrow font-bold uppercase tracking-[0.18em] text-forest-700">
              {g.label}
            </h2>
            <ul className="mt-4 space-y-2.5 text-body-sm">
              {g.routes.map((r) => (
                <li key={r.path}>
                  <Link
                    href={r.path}
                    className="text-forest-900 hover:text-forest-700"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {ui.notFound.tailBefore}
        <Link
          href={linkPath("/news/", locale)}
          className="font-semibold underline"
        >
          {ui.notFound.tailNews}
        </Link>
        {ui.notFound.tailBetween}
        <Link
          href={linkPath("/contact/", locale)}
          className="font-semibold underline"
        >
          {ui.notFound.tailContact}
        </Link>
        {ui.notFound.tailAfter}
      </p>
    </div>
  );
}
