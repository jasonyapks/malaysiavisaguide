import { localeByHost } from "../src/lib/i18n";

/**
 * Collector for Content-Security-Policy violation reports.
 *
 * ## Why this exists
 *
 * `public/_headers` has carried the full policy in
 * `Content-Security-Policy-Report-Only` for months, with a comment saying to
 * promote it "once the reports are clean". Nothing was collecting them. The
 * policy named no `report-uri` and no `report-to`, so every browser that
 * dutifully generated a violation had nowhere to send it, and "clean" was a
 * state nobody could ever observe. The policy could not be enforced, and could
 * not be shown to be safe to enforce — it was decoration.
 *
 * This is the missing half. It is deliberately the smallest thing that closes
 * that loop: collect, filter the noise, log one line per real violation.
 *
 * ## Why same-origin rather than a hosted collector
 *
 * A third-party collector would have to be added to the very policy it is
 * meant to validate, and would take a feed of every URL our readers visit off
 * to a vendor. A Pages Function costs nothing, adds no origin, and keeps the
 * reports inside the same account as the logs.
 *
 * ## Why `report-uri` and not `report-to`
 *
 * `_headers` applies one rule block to all three hosts. `Reporting-Endpoints`
 * takes a URL, so an absolute one would funnel cn. and tw. reports to the apex
 * and drag CORS preflight into it; `report-uri` takes a relative path, so each
 * host reports to itself with no preflight. It is deprecated in favour of
 * `report-to` but still honoured by Chrome, Firefox and Safari, and a week of
 * collection is all this needs to do.
 */

type PagesContext = { request: Request };

/** Reports larger than this are junk or an attack. A real report is ~1 KB. */
const MAX_BODY_BYTES = 16_384;

/**
 * Noise that is not ours and never will be.
 *
 * This is the single reason report-only CSP data is usually abandoned as
 * unreadable. A reader with an ad blocker, a password manager or a translation
 * extension generates violations continuously — the extension injects a script
 * or a stylesheet into our page, our policy correctly refuses to sanction it,
 * and a report arrives. None of it is actionable: we cannot allow-list an
 * extension, and we would not want to. Left in, it buries the handful of
 * reports that describe a real gap in the policy.
 */
const NOISE_SCHEMES = [
  "chrome-extension:",
  "moz-extension:",
  "safari-extension:",
  "safari-web-extension:",
  "webkit-masked-url:",
  "about:",
  "blob:",
];

type Normalised = {
  documentUri: string;
  blockedUri: string;
  directive: string;
  sample: string;
};

/**
 * Flatten both report shapes into one.
 *
 * Browsers send either the legacy `application/csp-report` envelope (one
 * report, hyphenated keys) or the Reporting API's `application/reports+json`
 * (an array, camelCased keys). Normalising here keeps the filtering and the
 * log line from having to know which browser produced them.
 */
function normalise(payload: unknown): Normalised[] {
  const out: Normalised[] = [];

  const legacy = (payload as { "csp-report"?: Record<string, unknown> })?.[
    "csp-report"
  ];
  if (legacy) {
    out.push({
      documentUri: String(legacy["document-uri"] ?? ""),
      blockedUri: String(legacy["blocked-uri"] ?? ""),
      directive: String(
        legacy["effective-directive"] ?? legacy["violated-directive"] ?? "",
      ),
      sample: String(legacy["script-sample"] ?? ""),
    });
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      if (entry?.type !== "csp-violation") continue;
      const b = (entry.body ?? {}) as Record<string, unknown>;
      out.push({
        documentUri: String(b.documentURL ?? entry.url ?? ""),
        blockedUri: String(b.blockedURL ?? ""),
        directive: String(b.effectiveDirective ?? ""),
        sample: String(b.sample ?? ""),
      });
    }
  }

  return out;
}

/** Ours, and worth acting on. */
function isActionable(r: Normalised): boolean {
  let host: string;
  try {
    host = new URL(r.documentUri).hostname;
  } catch {
    return false;
  }
  // The endpoint is public: anyone can POST to it. A report that does not name
  // one of our own pages as the document did not come from our site.
  if (!(host in localeByHost)) return false;

  const blocked = r.blockedUri.toLowerCase();
  return !NOISE_SCHEMES.some((scheme) => blocked.startsWith(scheme));
}

/**
 * One handler, branching on method itself.
 *
 * Pages also supports method-suffixed exports (`onRequestPost`), but exporting
 * both those and a catch-all `onRequest` leaves which one wins to a routing
 * rule this file would rather not depend on. Branching here is explicit and
 * behaves the same whatever that rule is.
 */
export async function onRequest(context: PagesContext): Promise<Response> {
  const { request } = context;

  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  try {
    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) return new Response(null, { status: 204 });

    for (const report of normalise(JSON.parse(body))) {
      if (!isActionable(report)) continue;
      // One line per violation, structured, so the observability API can group
      // by directive — which is the question being asked: what would break if
      // this policy were enforced today?
      console.log(
        JSON.stringify({
          tag: "csp-violation",
          directive: report.directive,
          blocked: report.blockedUri,
          document: report.documentUri,
          // Truncated: a sample is a fragment of the offending inline script,
          // useful for identifying it and not worth storing in full.
          sample: report.sample.slice(0, 200),
        }),
      );
    }
  } catch {
    // A malformed report is not worth an error path. The browser is not
    // listening to the response and nothing downstream depends on it.
  }

  // 204 unconditionally. The reporting endpoint must never be a signal to the
  // page, to a scanner, or to whoever is POSTing junk at it.
  return new Response(null, { status: 204 });
}
