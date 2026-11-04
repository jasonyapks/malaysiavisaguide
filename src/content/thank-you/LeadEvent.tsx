"use client";

import { useEffect } from "react";
import { LEAD_TOPIC_KEY, track } from "@/lib/analytics";

/**
 * Sends `generate_lead` once the thank-you page has loaded.
 *
 * An effect, not an inline <script>. The inline version sat in the page body
 * ABOVE RootShell's gtag bootstrap, so `window.gtag` was still undefined when
 * it ran and the event never fired — from launch until 2026-11-04. An effect
 * runs after hydration, by which point the bootstrap has defined gtag.
 *
 * `lead_topic` ("quote" | "general") comes from the contact form via
 * sessionStorage and is cleared, so a reload does not re-attribute. Consent is
 * gtag's concern: a denied reader sends nothing.
 */
export function LeadEvent() {
  useEffect(() => {
    let topic: string | null = null;
    try {
      topic = sessionStorage.getItem(LEAD_TOPIC_KEY);
      sessionStorage.removeItem(LEAD_TOPIC_KEY);
    } catch {
      // Private mode: the lead still counts, just without a topic.
    }
    track("generate_lead", { form: "contact", lead_topic: topic ?? "general" });
  }, []);
  return null;
}
