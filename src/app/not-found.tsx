import Link from "next/link";
import { Lozenge } from "@/components/GuideHead";
import { navGroups, navRoutes } from "@/lib/site";

/**
 * The 404 page.
 *
 * Without this file Next serves its own, which is black — on a cool cobalt
 * site that reads as a crash rather than a missing page. It also matters more
 * than it used to: /news/<slug> URLs are generated at build time, so an article
 * that has been written but not yet deployed lands here, as does any old link
 * once a slug changes.
 *
 * So it is built to recover the visit rather than apologise for it: the full set
 * of programme guides, one click away.
 */
export default function NotFound() {
  const groups = navGroups.map((g) => ({ ...g, routes: navRoutes(g.key) }));

  return (
    <div className="space-y-10 py-6">
      <header className="space-y-4">
        <p className="eyebrow">Error 404</p>
        <h1 className="text-h1 font-extrabold">
          That page isn&apos;t{" "}
          <span className="font-display accent-text font-medium italic">here</span>
        </h1>
        <div className="diamond-rule max-w-xs">
          <Lozenge />
        </div>
        <p className="max-w-xl text-lead leading-relaxed text-ink-muted">
          The link may be out of date, or the page may have moved. Everything the
          guide covers is below.
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
                  <Link href={r.path} className="text-forest-900 hover:text-forest-700">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        Looking for something specific? Read the{" "}
        <Link href="/news/" className="font-semibold underline">
          latest news
        </Link>
        , or{" "}
        <Link href="/contact/" className="font-semibold underline">
          ask a question
        </Link>{" "}
        and you&apos;ll get a reply from the person who writes these guides.
      </p>
    </div>
  );
}
