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
export function CookiePreferences() {
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
      ? "Checking your current setting…"
      : choice === "granted"
        ? "Analytics cookies are ON for this browser."
        : choice === "denied"
          ? "Analytics cookies are OFF for this browser."
          : effective === "granted"
            ? "You haven't chosen yet. Analytics cookies are on by default where you are — turning them off is one click."
            : "You haven't chosen yet, so analytics cookies are off.";

  return (
    <div className="rounded-xl border border-sand-200 bg-sand-100 p-6">
      <h3 className="font-serif text-body font-semibold text-ink">
        Your cookie setting
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
          {saved && " Saved."}
        </span>
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => set("denied")}
          disabled={effective === "denied"}
          className="min-h-11 rounded-full border-2 border-forest-700 px-7 py-2.5 text-body-sm font-bold text-forest-700 transition-[background-color,transform] duration-150 hover:bg-forest-50 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-sand-400 disabled:text-ink-muted disabled:opacity-100 disabled:hover:bg-transparent"
        >
          Turn off
        </button>
        <button
          type="button"
          onClick={() => set("granted")}
          disabled={effective === "granted"}
          className="min-h-11 rounded-full border-2 border-forest-700 bg-forest-700 px-7 py-2.5 text-body-sm font-bold text-sand-50 transition-[background-color,transform] duration-150 hover:border-forest-900 hover:bg-forest-900 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-sand-400 disabled:bg-sand-400 disabled:opacity-100"
        >
          Turn on
        </button>
      </div>

      {/* A disabled button should say why it's disabled, not just grey out. Keyed
          to `effective`, so the explanation appears for the visitor whose
          analytics are on by regional default and who has chosen nothing —
          previously that person saw a greyed button with no reason given. */}
      {effective !== undefined && (
        <p className="mt-3 text-caption text-ink-muted">
          {effective === "granted"
            ? "“Turn on” is inactive because analytics are already on."
            : "“Turn off” is inactive because analytics are already off."}
        </p>
      )}

      <p className="mt-3 text-caption text-ink-muted">
        This setting is stored in this browser only, so it won&apos;t follow you
        to another device. Turning analytics off stops any further data being
        sent; it does not erase cookies already placed — clear them in your
        browser settings if you want them gone.
      </p>
    </div>
  );
}
