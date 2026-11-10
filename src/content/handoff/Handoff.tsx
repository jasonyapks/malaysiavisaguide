"use client";

import { track } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";
import { getHandoffCopy } from "./copy";

/**
 * The hand-off to MYPVIP (audit task B4-3).
 *
 * One box, two buttons: the consultation page on mypvip.com and WhatsApp. It is
 * labelled as the publisher's own agency, sits outside the guide's prose, and
 * is optional by design — no pop-up, no gate, one per position.
 *
 * ## What leaves the site in the URL
 *
 * The UTM convention (B4-2) and, at most, a programme NAME:
 *
 *   utm_source=mvg · utm_medium=referral · utm_campaign=<page slug> · utm_content=<module>
 *
 * Never anything the reader typed or chose in a tool — no age, income, family
 * size or nationality. A URL ends up in server logs, browser history and
 * referrers, so personal data must not be in one.
 *
 * These links are commercial and tagged, so they are `nofollow`. The identity
 * links in the byline and footer are the clean, followed ones — see
 * `outboundRel` in src/lib/site.ts.
 */

const CONSULT_URL: Record<Locale, string> = {
  en: "https://mypvip.com/en/free-consultation/",
  "zh-hans": "https://mypvip.com/zh-cn/free-consultation/",
  "zh-hant": "https://mypvip.com/zh-tw/free-consultation/",
};
const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=60179625588";

/** The short English name passed to MYPVIP, by programme slug. */
export function handoffProgrammeName(slug: string): string {
  if (slug === "pvip") return "PVIP";
  if (slug.startsWith("mm2h-")) return "MM2H";
  if (slug === "smm2h") return "Sarawak MM2H";
  if (slug === "de-rantau") return "DE Rantau";
  if (slug === "employment-pass") return "Employment Pass";
  return "Student Pass";
}

export type HandoffModule =
  | "guide-mid"
  | "guide-end"
  | "eligibility-result"
  | "calculator-result";

export function Handoff({
  locale,
  campaign,
  module,
  programme,
  variant = "handles",
}: {
  locale: Locale;
  /** The page slug, e.g. "visas-pvip". Becomes utm_campaign. */
  campaign: string;
  module: HandoffModule;
  /** English programme name, e.g. "PVIP". The only detail passed along. */
  programme?: string;
  /** "handles": MYPVIP files this programme. "other": it may not.
   *  "confirm": the result screen of a tool. */
  variant?: "handles" | "other" | "confirm";
}) {
  const copy = getHandoffCopy(locale);

  const consult = new URL(CONSULT_URL[locale]);
  consult.searchParams.set("utm_source", "mvg");
  consult.searchParams.set("utm_medium", "referral");
  consult.searchParams.set("utm_campaign", campaign);
  consult.searchParams.set("utm_content", module);
  if (programme) consult.searchParams.set("programme", programme);

  const whatsapp = new URL(WHATSAPP_URL);
  whatsapp.searchParams.set("text", copy.whatsappText(programme));

  const params = { placement: module, programme: programme ?? "any", campaign };
  const confirm = variant === "confirm";

  return (
    <aside className="card-flat max-w-3xl space-y-4 border-l-4 border-l-forest-600 px-7 py-6">
      {!confirm && <p className="eyebrow">{copy.eyebrow}</p>}
      <h2 className="text-h3 font-semibold text-forest-900">
        {confirm ? copy.confirmHeading : copy.heading}
      </h2>
      <p className="text-body-sm leading-relaxed text-ink">
        {confirm
          ? copy.confirmBody
          : variant === "other"
            ? copy.bodyOther
            : copy.bodyHandles}
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={consult.href}
          target="_blank"
          rel="nofollow noopener"
          onClick={() => track("handoff_click", params)}
          className="accent-fill inline-flex min-h-11 items-center rounded-full px-7 py-3 font-bold transition-transform hover:-translate-y-px"
        >
          {copy.consult}
        </a>
        <a
          href={whatsapp.href}
          target="_blank"
          rel="nofollow noopener"
          onClick={() => track("whatsapp_click", params)}
          className="inline-flex min-h-11 items-center rounded-full border border-forest-700 px-7 py-3 font-bold text-forest-700 transition-transform hover:-translate-y-px"
        >
          {copy.whatsapp}
        </a>
      </div>
      <p className="text-caption text-ink-muted">{copy.disclosure}</p>
    </aside>
  );
}
