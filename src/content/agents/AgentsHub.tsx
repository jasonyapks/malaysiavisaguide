import Link from "next/link";
import {
  registerCount,
  registers,
  type AgentProgramme,
} from "@/lib/data/agents";
import { reviewDate } from "@/lib/format";
import { type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { AgentDisclosure } from "./AgentDirectory";
import type { AgentsCopy } from "./types";

/**
 * /agents/ — why the register matters, the two lists, and how to vet an
 * agent. Shared by all three locales; every word comes in through `copy`.
 */
const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";

export function AgentsHub({
  locale,
  copy,
}: {
  locale: Locale;
  copy: AgentsCopy;
}) {
  const href = (path: string) => linkPath(path, locale);
  const programmes: AgentProgramme[] = ["mm2h", "pvip"];

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{copy.hub.title}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.hub.standfirst}
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {programmes.map((p) => (
          <li key={p}>
            <Link
              href={href(`/agents/${p}/`)}
              className="group block h-full rounded-xl border border-sand-200 bg-white px-6 py-5 transition-colors duration-150 hover:border-forest-600 hover:bg-forest-50 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-700"
            >
              <span className="block font-serif text-h3 font-semibold text-forest-900 underline-offset-4 group-hover:underline">
                {copy.hub.cardTitle[p]} &rarr;
              </span>
              <span className="mt-2 block text-body-sm text-ink-muted">
                {copy.hub.cardBody(
                  registerCount(p),
                  copy.publisher[p],
                  reviewDate(registers[p].lastVerified, locale),
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <AgentDisclosure locale={locale} copy={copy} />

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          {copy.hub.why.heading}
        </h2>
        {copy.hub.why.body(href)}
      </section>

      <VettingChecklist locale={locale} copy={copy} />
    </article>
  );
}

/** Shared by the hub and both list pages. */
export function VettingChecklist({
  locale,
  copy,
}: {
  locale: Locale;
  copy: AgentsCopy;
}) {
  return (
    <section className={PROSE}>
      {copy.checklist((path) => linkPath(path, locale))}
    </section>
  );
}
