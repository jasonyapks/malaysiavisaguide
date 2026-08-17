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
    /**
     * Declared as overloads rather than one signature: `gtag` is variadic in a
     * way TypeScript cannot express usefully, so each call shape this app makes
     * is spelled out. Anything else is a type error, which is the point — the
     * real gtag would accept it silently and drop it.
     */
    gtag?: {
      (
        command: "consent",
        action: "update",
        params: { analytics_storage: Choice },
      ): void;
      (
        command: "event",
        name: "page_view",
        params: { page_location: string; page_title: string },
      ): void;
    };
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
  // Read this BEFORE the write below changes the answer.
  //
  // True means every page_view fired so far in this page's life went out under
  // denied consent — no stored choice, and a region whose default is denied, so
  // there has been nothing else it could have been. See the recovery below.
  const unmeasured =
    readStoredChoice() === null && regionDefault(readRegion()) === "denied";

  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // If we can't persist it, still honour the choice for this page view.
  }
  window.gtag?.("consent", "update", { analytics_storage: choice });

  /**
   * Re-send the page_view for the page they are standing on.
   *
   * Consent Mode's `wait_for_update: 500` holds the opening page_view for half
   * a second in case a consent decision is about to arrive from a CMP. Nobody
   * reads a banner and clicks in 500ms, so for a human visitor that window has
   * always closed: the page_view has already gone out as a `gcs=G100` cookieless
   * ping, GA4 bins it below its modelling thresholds, and consenting does not
   * retroactively rescue it. The result was that the EEA, UK and Swiss readers
   * who explicitly agreed to be measured were the ones GA4 never showed —
   * the landing page, the one that says how they found the site, was always the
   * page that went missing.
   *
   * Gated on `unmeasured`, which is the narrow provable case: no stored choice
   * plus a denied-by-default region. It cannot double-count. Somebody in an
   * opt-out country accepting the banner had a consented page_view already and
   * gets nothing extra here, and a second grant can never satisfy the condition
   * because the first one wrote the key.
   *
   * `page_location` and `page_title` are passed explicitly. A manual page_view
   * does not inherit them, and after a client-side navigation the tag's own
   * config still holds the URL of whichever page was loaded first.
   */
  if (choice === "granted" && unmeasured) {
    window.gtag?.("event", "page_view", {
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  for (const listener of listeners) listener();
}

const listeners = new Set<() => void>();

/**
 * Subscribe to changes in the stored choice.
 *
 * Both consent controls render straight from localStorage via
 * `useSyncExternalStore` rather than mirroring it into component state. That is
 * not ceremony: localStorage does not exist during the static prerender, so the
 * value genuinely cannot be known until after hydration, and reading it in an
 * effect and calling setState is the cascading-render pattern
 * `react-hooks/set-state-in-effect` exists to stop. useSyncExternalStore is
 * built for this shape — a server snapshot for the prerender, a live one after.
 *
 * Only `applyChoice` notifies, because it is the only thing in the app that
 * writes the key. A second tab writing it does not fire `storage` listeners
 * here by design: retroactively hiding a banner someone is mid-read of, in a
 * tab they are not looking at, is worse than leaving it alone.
 */
export function subscribeToChoice(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Which region's banner copy to show, or null for no banner at all.
 *
 * The banner is for people who have not answered. Once they have, the control
 * on /privacy/ is the way back.
 */
export function bannerRegion(): ConsentRegion | null {
  return readStoredChoice() === null ? readRegion() : null;
}

/**
 * What analytics is actually doing for this visitor right now — their stored
 * choice if they made one, otherwise their region's default.
 *
 * The distinction from `readStoredChoice` matters to the copy on /privacy/:
 * "you have not chosen" and "analytics is off" stopped being the same sentence
 * the moment the default became regional.
 */
export function effectiveChoice(): Choice {
  return readStoredChoice() ?? regionDefault(readRegion());
}
