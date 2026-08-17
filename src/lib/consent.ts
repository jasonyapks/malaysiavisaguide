/**
 * Cookie-consent state, shared by the banner (<CookieConsent />) and the
 * change-your-mind control on /privacy/ (<CookiePreferences />).
 *
 * Browser-only — every function here touches localStorage or window, so call
 * them from effects and event handlers, never during render.
 *
 * The stored value is also read by the inline bootstrap script in
 * `src/app/layout.tsx`, which runs before gtag.js and sets the Consent Mode v2
 * default. STORAGE_KEY must stay identical in both places.
 */

export const STORAGE_KEY = "mvg-consent";

export type Choice = "granted" | "denied";

/**
 * Which consent regime the visitor falls under, decided at the edge.
 *
 * "strict" — EEA, UK, Switzerland: analytics stays off until they say yes.
 * "open"  — everywhere else: analytics is on, and the banner is how they say no.
 *
 * Set on <head> by functions/_middleware.ts, which is the only layer that knows
 * the country: the site is a static export, so the HTML itself cannot.
 */
export type ConsentRegion = "strict" | "open";

declare global {
  interface Window {
    gtag?: (
      command: "consent",
      action: "update",
      params: { analytics_storage: Choice },
    ) => void;
    __mvgConsentRegion?: ConsentRegion;
  }
}

/**
 * Anything but the literal "open" means strict. Same defensive read as the
 * bootstrap script in RootShell.tsx — if the marker is missing because a file
 * was served without the Function in front of it, the safe answer is opt-in.
 */
export function readRegion(): ConsentRegion {
  return window.__mvgConsentRegion === "open" ? "open" : "strict";
}

/** What analytics_storage is set to for someone who has not answered yet. */
export function regionDefault(region: ConsentRegion): Choice {
  return region === "open" ? "granted" : "denied";
}

/** The visitor's recorded choice, or null if they have not answered yet. */
export function readStoredChoice(): Choice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Safari private mode and friends. Treat as "no choice recorded".
    return null;
  }
}

/**
 * Persist a choice and tell the already-loaded Google tag about it.
 *
 * Only `analytics_storage` moves. This site runs no advertising tags, so the
 * ad_* signals stay denied for everyone, consented or not.
 */
export function applyChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // If we can't persist it, still honour the choice for this page view.
  }
  window.gtag?.("consent", "update", { analytics_storage: choice });
}
