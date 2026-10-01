import Link from "next/link";
import { registerCount, type AgentProgramme } from "@/lib/data/agents";
import { AgentDirectory } from "./AgentDirectory";
import { VettingChecklist } from "./AgentsHub";

/**
 * /agents/mm2h/ and /agents/pvip/. Same layout, one register each.
 * English only for now: the cn. and tw. hosts fall back to these pages.
 */
const COPY: Record<
  AgentProgramme,
  {
    title: string;
    standfirst: React.ReactNode;
    guide: string;
    guideLabel: string;
  }
> = {
  mm2h: {
    title: "Licensed MM2H agents",
    standfirst: (
      <>
        MOTAC&apos;s current guide routes every MM2H application through a
        tour-operating company it has licensed for MM2H. If the company you are
        talking to is not on its register, it cannot take your file to MOTAC.
        Search the full register below by name, or narrow it by state.
      </>
    ),
    guide: "/visas/mm2h/",
    guideLabel: "MM2H guide",
  },
  pvip: {
    title: "Authorised PVIP agencies",
    standfirst: (
      <>
        Immigration does not accept PVIP applications directly. Every
        application goes through an agency the government has appointed, and
        Immigration publishes the list. If the company you are talking to is not
        on it, it cannot lodge your application. Search the full list below by
        name, or narrow it by state.
      </>
    ),
    guide: "/visas/pvip/",
    guideLabel: "PVIP guide",
  },
};

export const listMeta: Record<
  AgentProgramme,
  { title: string; description: string }
> = {
  mm2h: {
    title: "Licensed MM2H agents: the MOTAC register",
    description: `All ${registerCount("mm2h")} MOTAC-licensed MM2H companies, searchable by name and state, with licence numbers, validity status and contact details, cross-checked against mm2h.gov.my.`,
  },
  pvip: {
    title: "Authorised PVIP agents: Immigration's list",
    description: `All ${registerCount("pvip")} Immigration-authorised PVIP application agencies, searchable by name and state, with addresses and contact details copied from the official list.`,
  },
};

export function AgentListPage({ programme }: { programme: AgentProgramme }) {
  const c = COPY[programme];
  return (
    // Wider than the site's reading column, to fit the card grid: the page
    // takes the header's max-w-6xl so every block shares the logo's left edge.
    // Paragraphs share the full width too, aligned with the filters and cards
    // (Jason's call, 2026-10-01).
    <article className="full-bleed">
      <div className="mx-auto max-w-6xl space-y-10 px-6">
        <header className="space-y-6">
          <p className="text-caption text-ink-muted">
            <Link href="/agents/" className="text-forest-700 underline">
              Licensed agents
            </Link>{" "}
            / {programme === "mm2h" ? "MM2H" : "PVIP"}
          </p>
          <h1 className="text-h1 font-semibold">{c.title}</h1>
          <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
            {c.standfirst}
          </p>
        </header>

        <AgentDirectory programme={programme} />

        <VettingChecklist />

        <p className="text-body-sm text-ink-muted">
          Costs, requirements and timelines are in the{" "}
          <Link href={c.guide} className="text-forest-700 underline">
            {c.guideLabel}
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
