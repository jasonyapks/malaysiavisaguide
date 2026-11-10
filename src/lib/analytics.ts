/**
 * Custom GA4 events — the lead funnel, named so each one can be marked as a
 * key event in GA4 Admin → Events.
 *
 * - `quote_cta_click` — a reader pressed the quote CTA (<QuoteCta />).
 * - `agency_click`    — a reader followed a link to MYPVIP's own site or
 *                       WhatsApp (<OutboundLeadTracker />).
 * - `generate_lead`   — a contact form was sent. Fired by the thank-you
 *                       page; see content/thank-you/LeadEvent.tsx.
 *
 * Browser-only. `window.gtag` is absent until RootShell's bootstrap has run and
 * is a no-op under denied consent, so a missing tag is not an error.
 */
export type AnalyticsEvent =
  | "quote_cta_click"
  // Added 10 Nov 2026 (audit task B4-1). `newsletter_signup` is reserved for
  // B4-4 and nothing fires it yet.
  | "tool_complete"
  | "handoff_click"
  | "whatsapp_click"
  | "form_submit"
  | "newsletter_signup"
  | "agency_click"
  | "generate_lead";

export function track(name: AnalyticsEvent, params: Record<string, string>) {
  window.gtag?.("event", name, params);
}

/**
 * Hosts whose outbound clicks count as `agency_click`. Matched on the end of
 * the hostname, so `www.mypvip.com` counts too.
 */
export const AGENCY_HOSTS = ["mypvip.com", "wa.me", "api.whatsapp.com"];

/**
 * sessionStorage key carrying the enquiry topic from the contact form to the
 * thank-you page, so `generate_lead` can say whether it was a quote request.
 * Read and cleared by content/thank-you/LeadEvent.tsx.
 */
export const LEAD_TOPIC_KEY = "mvg-lead-topic";
