import Link from "next/link";
import { type AgentProgramme } from "@/lib/data/agents";
import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { AgentDirectory } from "./AgentDirectory";
import { VettingChecklist } from "./AgentsHub";
import type { AgentsCopy } from "./types";

/**
 * /agents/mm2h/ and /agents/pvip/, shared by all three locales. Same layout,
 * one register each. Every word comes in through `copy`; register data is
 * printed as published.
 */
export function AgentListPage({
  programme,
  locale,
  copy,
}: {
  programme: AgentProgramme;
  locale: Locale;
  copy: AgentsCopy;
}) {
  const c = copy.list[programme];
  const href = (path: string) => linkPath(path, locale);
  return (
    // Wider than the site's reading column, to fit the card grid: the page
    // takes the header's max-w-6xl so every block shares the logo's left edge.
    // Paragraphs share the full width too, aligned with the filters and cards
    // (Jason's call, 2026-10-01).
    <article className="full-bleed">
      <div className="mx-auto max-w-6xl space-y-10 px-6">
        <header className="space-y-6">
          <p className="text-caption text-ink-muted">
            <Link href={href("/agents/")} className="text-forest-700 underline">
              {copy.list.breadcrumb}
            </Link>{" "}
            / {programme === "mm2h" ? "MM2H" : "PVIP"}
          </p>
          <h1 className="text-h1 font-semibold">{c.title}</h1>
          <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
            {c.standfirst}
          </p>
        </header>

        <AgentDirectory programme={programme} locale={locale} copy={copy} />

        <VettingChecklist locale={locale} copy={copy} />

        <p className="text-body-sm text-ink-muted">
          {copy.list.guideLine(
            <Link
              href={href(
                programme === "mm2h" ? "/visas/mm2h/" : "/visas/pvip/",
              )}
              className="text-forest-700 underline"
            >
              {c.guideLabel}
            </Link>,
          )}
        </p>
      </div>
    </article>
  );
}
