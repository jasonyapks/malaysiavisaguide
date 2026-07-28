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

declare global {
  interface Window {
    gtag?: (
      command: "consent",
      action: "update",
      params: { analytics_storage: Choice },
    ) => void;
  }
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
