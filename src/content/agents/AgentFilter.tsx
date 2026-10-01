"use client";

import { useId, useState } from "react";

/**
 * State dropdown + name search over a server-rendered list.
 *
 * The cards are rendered on the server so every agent is in the static HTML
 * for crawlers and no-JS readers. This component only toggles `hidden` on them
 * by their data attributes; it never receives the agent data, which keeps a
 * 250-row register out of the client bundle and the RSC payload.
 */
/** Collapses the four licence states into the dropdown's two choices. */
const GROUP: Record<string, string> = {
  valid: "current",
  expiring: "current",
  expired: "lapsed",
  unlisted: "lapsed",
};

export function AgentFilter({
  listId,
  states,
  total,
  statusCounts,
  placeholder,
}: {
  listId: string;
  states: string[];
  total: number;
  /** MM2H only: companies per licence status, for the status dropdown. */
  /** Search box hint, e.g. "e.g. MM2H company". */
  placeholder: string;
  statusCounts: Partial<
    Record<"valid" | "expiring" | "expired" | "unlisted", number>
  > | null;
}) {
  const [state, setState] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [shown, setShown] = useState(total);
  const id = useId();

  // Filtering runs in the handlers, not an effect: the cards are server
  // markup outside React's tree, so there is nothing for a render to sync.
  const apply = (nextState: string, nextQuery: string, nextStatus = status) => {
    setState(nextState);
    setQuery(nextQuery);
    setStatus(nextStatus);
    const list = document.getElementById(listId);
    if (!list) return;
    // Punctuation-blind, so "ns vision" finds "N.S VISION" and "sdn bhd"
    // finds both spellings the registers use.
    const q = nextQuery.toLowerCase().replace(/[^a-z0-9]/g, "");
    let count = 0;
    for (const el of list.querySelectorAll<HTMLElement>("[data-agent]")) {
      const match =
        (!nextState ||
          (el.dataset.states ?? "").split("|").includes(nextState)) &&
        (!q || (el.dataset.search ?? "").includes(q)) &&
        (!nextStatus || GROUP[el.dataset.status ?? ""] === nextStatus);
      el.hidden = !match;
      if (match) count++;
    }
    setShown(count);
  };

  const filtered = state !== "" || query !== "" || status !== "";
  const n = (k: keyof NonNullable<typeof statusCounts>) =>
    statusCounts?.[k] ?? 0;

  return (
    <div className="space-y-3 rounded-xl border border-sand-200 bg-sand-50 p-4 sm:p-5">
      <div
        className={`grid gap-3 ${statusCounts ? "sm:grid-cols-2 lg:grid-cols-[1fr_12rem_16rem]" : "sm:grid-cols-[1fr_14rem]"}`}
      >
        <div className="space-y-1">
          <label
            htmlFor={`${id}-q`}
            className="block text-caption font-medium text-ink"
          >
            Search by company name
          </label>
          <input
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(e) => apply(state, e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className="min-h-11 w-full rounded-lg border border-sand-400 bg-white px-3 text-body-sm text-ink placeholder:text-ink-muted transition-colors duration-150 hover:border-forest-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-700"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`${id}-s`}
            className="block text-caption font-medium text-ink"
          >
            State
          </label>
          <select
            id={`${id}-s`}
            value={state}
            onChange={(e) => apply(e.target.value, query)}
            className="min-h-11 w-full rounded-lg border border-sand-400 bg-white px-3 text-body-sm text-ink transition-colors duration-150 hover:border-forest-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-700"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {statusCounts && (
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label
              htmlFor={`${id}-v`}
              className="block text-caption font-medium text-ink"
            >
              Licence status
            </label>
            <select
              id={`${id}-v`}
              value={status}
              onChange={(e) => apply(state, query, e.target.value)}
              className="min-h-11 w-full rounded-lg border border-sand-400 bg-white px-3 text-body-sm text-ink transition-colors duration-150 hover:border-forest-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-700"
            >
              <option value="">Any status</option>
              <option value="current">
                Valid now ({n("valid") + n("expiring")})
              </option>
              <option value="lapsed">
                Expired or not on current register (
                {n("expired") + n("unlisted")})
              </option>
            </select>
          </div>
        )}
      </div>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-caption text-ink-muted">
          {filtered
            ? `Showing ${shown} of ${total} companies`
            : `${total} companies`}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={() => apply("", "", "")}
            className="min-h-11 rounded-lg px-3 text-caption font-medium text-forest-700 underline underline-offset-2 transition-colors duration-150 hover:bg-forest-50 hover:text-forest-900 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-700"
          >
            Clear filters
          </button>
        )}
      </div>
      {filtered && shown === 0 && (
        <p className="rounded-lg border border-sand-200 bg-white px-4 py-3 text-body-sm text-ink">
          No company on this register matches. Check the spelling against the
          name on the agent&apos;s contract or letterhead. If it is still not
          here, it is not on the register this page was copied from. Check the
          official source linked above before you pay anything.
        </p>
      )}
    </div>
  );
}
