"use client";

import { useEffect } from "react";
import { AGENCY_HOSTS, track } from "@/lib/analytics";

/**
 * Sends `agency_click` when a reader follows a link to MYPVIP or WhatsApp.
 *
 * One delegated listener rather than an onClick on each link: those links are
 * written inside markdown articles and copy files, which render plain anchors
 * this component never sees. Capture phase, so it runs before navigation.
 * Renders nothing.
 */
export function OutboundLeadTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      const host = url.hostname.replace(/^www\./, "");
      if (!AGENCY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return;
      track("agency_click", {
        link_domain: host,
        link_url: url.href,
        page_path: window.location.pathname,
      });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
