"use client";

import { useState, useSyncExternalStore } from "react";
import {
  applyChoice,
  effectiveChoice,
  readStoredChoice,
  subscribeToChoice,
  type Choice,
} from "@/lib/consent";

/**
 * Change-your-mind control for /privacy/.
 *
 * The banner only appears until a visitor answers it once, so without this the
 * choice would be permanent — and withdrawing consent has to be as easy as
 * giving it. This is that route back.
 *
 * Declining here does not delete cookies GA4 already set; the copy says so
 * rather than implying a clean wipe we can't perform from this origin.
 */

/**
 * Strings arrive as props, for the same reason as `ConsentStrings` on the
 * banner: this is a client component, and importing the locale dictionary here
 * would ship all three languages' chrome to every browser to render one
 * panel's worth of one of them.
 */
export type CookiePreferencesStrings = {
  heading: string;
  /** The status line, one per state the panel can be in. */
  checking: string;
  on: string;
  off: string;
  /** No choice recorded, and analytics is on / off by regional default. */
  unchosenOn: string;
  unchosenOff: string;
  /** Appended to the status line after a click. Keep the leading space. */
  saved: string;
  turnOff: string;
  turnOn: string;
  /** Why the greyed button is greyed. Named for the button that is inactive. */
  turnOnInactive: string;
  turnOffInactive: string;
  storageNote: string;
};

export function CookiePreferences({
  strings,
}: {
  strings: CookiePreferencesStrings;
}) {
  // `undefined` = not read yet (server render and first paint). Distinguishing
  // it from `null` (read, no choice recorded) keeps the status line honest
  // instead of flashing "not chosen" at everyone. Read through the store rather
  // than mirrored into state — see the comment on subscribeToChoice.
  const choice = useSyncExternalStore(
    subscribeToChoice,
    readStoredChoice,
    () => undefined,
  );
  const [saved, setSaved] = useState(false);

  // What analytics is actually doing, which is NOT the same as what the visitor
  // chose: someone outside the EEA, UK and Switzerland who has never answered
  // the banner has analytics ON. Every piece of state below reads from this
  // rather than from `choice`, so the dot, the buttons and the sentence cannot
  // disagree with the tag.
  const effective = choice === undefined ? undefined : effectiveChoice();

  function set(next: Choice) {
    applyChoice(next);
    setSaved(true);
  }

  const status =
    choice === undefined
      ? strings.checking
      : choice === "granted"
        ? strings.on
        : choice === "denied"
          ? strings.off
          : effective === "granted"
            ? strings.unchosenOn
            : strings.unchosenOff;

  return (
    <div className="rounded-xl border border-sand-200 bg-sand-100 p-6">
      <h3 className="font-serif text-body font-semibold text-ink">
        {strings.heading}
      </h3>

      <p
        aria-live="polite"
        className="mt-2 flex items-start gap-2 text-body-sm leading-relaxed text-ink-muted"
      >
        {/* Symbol as well as wording — state must not rest on colour alone. */}
        {effective !== undefined && (
          <span aria-hidden>{effective === "granted" ? "●" : "○"}</span>
        )}
        <span>
          {status}
          {saved && strings.saved}
        </span>
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => set("denied")}
          disabled={effective === "denied"}
          className="min-h-11 rounded-full border-2 border-forest-700 px-7 py-2.5 text-body-sm font-bold text-forest-700 transition-[background-color,transform] duration-150 hover:bg-forest-50 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-sand-400 disabled:text-ink-muted disabled:opacity-100 disabled:hover:bg-transparent"
        >
          {strings.turnOff}
        </button>
        <button
          type="button"
          onClick={() => set("granted")}
          disabled={effective === "granted"}
          className="min-h-11 rounded-full border-2 border-forest-700 bg-forest-700 px-7 py-2.5 text-body-sm font-bold text-sand-50 transition-[background-color,transform] duration-150 hover:border-forest-900 hover:bg-forest-900 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-sand-400 disabled:bg-sand-400 disabled:opacity-100"
        >
          {strings.turnOn}
        </button>
      </div>

      {/* A disabled button should say why it's disabled, not just grey out. Keyed
          to `effective`, so the explanation appears for the visitor whose
          analytics are on by regional default and who has chosen nothing —
          previously that person saw a greyed button with no reason given. */}
      {effective !== undefined && (
        <p className="mt-3 text-caption text-ink-muted">
          {effective === "granted"
            ? strings.turnOnInactive
            : strings.turnOffInactive}
        </p>
      )}

      <p className="mt-3 text-caption text-ink-muted">{strings.storageNote}</p>
    </div>
  );
}
