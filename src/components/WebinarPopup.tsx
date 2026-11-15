"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * First-visit webinar pop-up. Shows the next upcoming webinar once per visitor,
 * then never again for that webinar.
 *
 * ## Why the date check is in the browser
 *
 * The site is a static export, so anything decided at build time is frozen
 * until the next deploy. RootShell hands over every event that was upcoming
 * when the page was built; this component drops the ones that have started by
 * the reader's clock, so the pop-up stops on its own once a session begins —
 * no redeploy needed. An event ends its run at its start time.
 *
 * ## Why a native <dialog>
 *
 * `showModal()` gives focus containment, Escape-to-close, an inert page behind
 * it and the top layer (so it sits above the z-50 cookie banner) for free.
 *
 * ## Why the delay
 *
 * Google treats a pop-up that covers content the instant a reader lands from
 * search as an intrusive interstitial. A short delay and a one-tap close keep
 * it on the right side of that, and let the page's LCP happen first.
 *
 * Never shown on the event's own news story or on /events/ — the reader is
 * already looking at it.
 */

export type PopupWebinar = {
  id: string;
  /** ISO start instant with offset, e.g. 2026-11-18T20:00:00+08:00. */
  startsAt: string;
  title: string;
  format: string;
  when: string;
  speakers: string;
  registrationUrl: string;
  detailsHref: string;
  /** Paths on which this pop-up must not open. */
  skipPaths: string[];
};

export type PopupStrings = {
  eyebrow: string;
  register: string;
  details: string;
  close: string;
};

const SEEN_KEY = "mvg-webinar-seen";
const DELAY_MS = 4000;

function readSeen(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function markSeen(id: string) {
  try {
    const seen = readSeen();
    if (!seen.includes(id)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]));
    }
  } catch {
    // Storage blocked: the reader may see it again next visit. Acceptable.
  }
}

export function WebinarPopup({
  webinars,
  strings,
}: {
  webinars: PopupWebinar[];
  strings: PopupStrings;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<PopupWebinar | null>(null);

  useEffect(() => {
    // window.location, not usePathname: the latter is the build path
    // (/zh-hans/...), the former is what the reader's host actually serves.
    const path = window.location.pathname;
    if (path.startsWith("/admin")) return;
    const seen = readSeen();
    const now = Date.now();
    const next = webinars.find(
      (w) =>
        Date.parse(w.startsAt) > now &&
        !seen.includes(w.id) &&
        !w.skipPaths.includes(path),
    );
    if (!next) return;
    const t = window.setTimeout(() => setCurrent(next), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [webinars]);

  useEffect(() => {
    const d = ref.current;
    if (!current || !d || d.open) return;
    d.showModal();
    markSeen(current.id);
    track("webinar_popup", { action: "shown", event_id: current.id });
  }, [current]);

  if (!current) return null;

  function close(action: string) {
    ref.current?.close();
    if (current) track("webinar_popup", { action, event_id: current.id });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="webinar-popup-title"
      // Escape fires `cancel`; route it through close() so it is counted.
      onCancel={(e) => {
        e.preventDefault();
        close("dismiss");
      }}
      // A click on the dialog element itself is a click on the backdrop: the
      // inner div fills the whole box, so content clicks never land here.
      onClick={(e) => {
        if (e.target === e.currentTarget) close("dismiss");
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-sand-200 bg-sand-50 p-0 text-ink shadow-[0_12px_48px_rgba(14,22,34,0.28)] backdrop:bg-forest-900/55 backdrop:backdrop-blur-[2px]"
    >
      <div className="relative space-y-4 p-6 sm:p-8">
        <button
          type="button"
          onClick={() => close("dismiss")}
          aria-label={strings.close}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ink-muted hover:bg-sand-200 hover:text-ink focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="eyebrow pr-10">{strings.eyebrow}</p>
        <h2 id="webinar-popup-title" className="pr-6 text-h3 font-bold leading-snug text-forest-900">
          {current.title}
        </h2>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-2 pl-4 pr-3 text-body-sm font-semibold text-forest-900">
          {current.when}
          <span className="block font-normal text-ink-muted">{current.format}</span>
        </p>
        <p className="text-caption leading-relaxed text-ink-muted">{current.speakers}</p>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <a
            href={current.registrationUrl}
            // Zoom, so always nofollow — same as outboundRel() in lib/site.ts,
            // which is not imported here to keep site.ts out of the client bundle.
            rel="nofollow noopener"
            target="_blank"
            onClick={() => close("register")}
            className="accent-fill min-h-11 rounded-full px-6 py-2.5 text-center text-body-sm font-bold transition-transform hover:-translate-y-px focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700"
          >
            {strings.register}
          </a>
          <a
            href={current.detailsHref}
            onClick={() => close("details")}
            className="min-h-11 px-2 py-2.5 text-center text-body-sm font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-900 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700"
          >
            {strings.details}
          </a>
        </div>
      </div>
    </dialog>
  );
}
