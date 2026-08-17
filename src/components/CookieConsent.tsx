"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  applyChoice,
  readRegion,
  readStoredChoice,
  type Choice,
  type ConsentRegion,
} from "@/lib/consent";

/**
 * Cookie consent banner — the UI half of Google Consent Mode v2.
 *
 * The other half lives in `src/components/RootShell.tsx`, in the inline script
 * that runs BEFORE gtag.js loads. That script replays a stored choice if there is
 * one, and otherwise applies the visitor's regional default. That ordering is the
 * whole point: in the EEA, UK and Switzerland it means GA4 sets no cookies until
 * a visitor opts in, rather than setting them and apologising in a banner
 * afterwards.
 *
 * This component therefore only ever does two things — write the stored choice
 * and push a `consent update` into the dataLayer for the current page view.
 *
 * What changes by region is only the copy. The banner shows to everyone who has
 * not answered, and both buttons do the same thing everywhere; a reader in Kuala
 * Lumpur is being told analytics is already on and offered the off switch, not
 * asked a question that was silently answered for them.
 */

/**
 * Strings arrive as props rather than being looked up from the locale here.
 * This is a client component, so importing the dictionary would ship all three
 * languages' chrome to every visitor's browser to display one banner's worth
 * of one of them.
 */
export type ConsentStrings = {
  heading: string;
  /** Opt-in regions: analytics is off, the banner asks permission. */
  body: string;
  /** Opt-out regions: analytics is on, the banner offers the switch. */
  bodyOptOut: string;
  privacyLink: string;
  decline: string;
  accept: string;
};

export default function CookieConsent({
  strings,
  privacyHref,
}: {
  strings: ConsentStrings;
  privacyHref: string;
}) {
  // Never render on the server: the banner's visibility depends on
  // localStorage, and prerendering it would flash the banner at every visitor
  // who has already answered — on every page of a static export. The region is
  // read in the same effect for the same reason: it is stamped onto the
  // document per request, so it is not knowable at build time either.
  const [region, setRegion] = useState<ConsentRegion | null>(null);

  useEffect(() => {
    if (readStoredChoice() === null) setRegion(readRegion());
  }, []);

  function choose(choice: Choice) {
    applyChoice(choice);
    setRegion(null);
  }

  if (region === null) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-heading"
      data-bottom-overlay
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sand-200 bg-sand-50 shadow-[0_-4px_24px_rgba(14,22,34,0.10)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="space-y-1">
          <h2
            id="cookie-consent-heading"
            className="font-serif text-body font-semibold text-ink"
          >
            {strings.heading}
          </h2>
          <p className="text-caption leading-relaxed text-ink-muted">
            {region === "open" ? strings.bodyOptOut : strings.body}{" "}
            <Link
              href={privacyHref}
              className="text-forest-700 underline underline-offset-2 hover:text-forest-900 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700"
            >
              {strings.privacyLink}
            </Link>
            .
          </p>
        </div>

        {/*
          Equal size and equal prominence by design. The house style calls for a
          clear primary/secondary weight difference, but EDPB guidance is that
          rejecting must be no harder than accepting — a quiet "decline" next to
          a loud "accept" is the dark pattern regulators actually fine people
          for. Law wins; the two are distinguished by fill vs outline instead.
        */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="min-h-11 rounded-full border-2 border-forest-700 px-7 py-2.5 text-body-sm font-bold text-forest-700 transition-[background-color,transform] duration-150 hover:bg-forest-50 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700 active:scale-[0.98] active:bg-forest-100"
          >
            {strings.decline}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="min-h-11 rounded-full border-2 border-forest-700 bg-forest-700 px-7 py-2.5 text-body-sm font-bold text-sand-50 transition-[background-color,transform] duration-150 hover:bg-forest-900 hover:border-forest-900 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-forest-700 active:scale-[0.98]"
          >
            {strings.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
