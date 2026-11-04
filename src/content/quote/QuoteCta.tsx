"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { getQuoteCopy } from "./copy";

/**
 * The quote CTA — the site's one closing step, placed only on pages a reader
 * reaches when they are ready to act: the agent directory and the two tools.
 * Guides keep their own single CTA, which points at those tools.
 *
 * Links to /contact/ with `topic=quote`, which the form reads to relabel the
 * message field and flag the enquiry. `programme` must be a nav title
 * ("PVIP", "MM2H") — the form's select values — or it is ignored.
 *
 * The disclosure is part of the component, not optional copy: the CTA routes
 * readers to MYPVIP, and the site's rule is to say so wherever it does.
 */
export function QuoteCta({
  locale,
  placement,
  programme,
}: {
  locale: Locale;
  /** Reported to GA4, so the funnel shows which page the lead came from. */
  placement: "agents" | "calculator" | "eligibility";
  programme?: "PVIP" | "MM2H";
}) {
  const copy = getQuoteCopy(locale);
  const query = new URLSearchParams({ topic: "quote" });
  if (programme) query.set("programme", programme);
  const href = `${linkPath("/contact/", locale)}?${query}`;

  return (
    <section className="card-flat space-y-4 border-l-4 border-l-forest-600 px-7 py-6">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 className="text-h3 font-semibold text-forest-900">{copy.heading}</h2>
      <p className="max-w-3xl text-body leading-relaxed text-ink">{copy.body}</p>
      <Link
        href={href}
        onClick={() =>
          track("quote_cta_click", { placement, programme: programme ?? "any" })
        }
        className="accent-fill inline-block rounded-full px-8 py-3.5 font-bold transition-transform hover:-translate-y-px"
      >
        {copy.button}
      </Link>
      <p className="max-w-3xl text-caption text-ink-muted">{copy.disclosure}</p>
    </section>
  );
}
