import { localeByHost } from "../../src/lib/i18n";

/**
 * Contact form proxy: verify a Turnstile token, then forward to Web3Forms.
 *
 * ## Why a proxy at all
 *
 * The form used to POST from the browser straight to Web3Forms, which left two
 * problems that no amount of client-side code can fix:
 *
 *   1. The only bot control was a honeypot checkbox, and the Web3Forms access
 *      key sat in the client bundle. Anyone could read the key and POST to
 *      Web3Forms directly, skipping the page entirely.
 *   2. There was nowhere to verify a CAPTCHA. A Turnstile widget with no
 *      server-side siteverify call is decoration — Cloudflare's own docs are
 *      blunt about it: "the widget appears on the page but does not protect
 *      the request".
 *
 * Putting one Pages Function in front fixes both. The access key moves into the
 * environment, and there is finally a server to validate on.
 *
 * ## Configuration
 *
 * Two environment values, both set on the Pages project, both required
 * together:
 *
 *   TURNSTILE_SECRET_KEY   secret. Pairs with NEXT_PUBLIC_TURNSTILE_SITE_KEY,
 *                          which the client reads at build time.
 *   WEB3FORMS_ACCESS_KEY   secret. The key that used to be public.
 *
 * The client only routes here when the sitekey is present at build time, so
 * this endpoint is not on the critical path until it is fully configured. See
 * ContactForm.tsx.
 */

type PagesContext = {
  request: Request;
  env: {
    TURNSTILE_SECRET_KEY?: string;
    WEB3FORMS_ACCESS_KEY?: string;
  };
};

/** Matches the caps the form advertises, enforced here where it counts. */
const LIMITS = { name: 100, email: 254, message: 5000, programme: 120 } as const;

/** Turnstile tokens are bounded; anything longer is not one. */
const MAX_TOKEN = 2048;

type Payload = Record<string, unknown>;

function bad(message: string, status = 400): Response {
  return Response.json({ success: false, message }, { status });
}

/**
 * Verify the token with Turnstile.
 *
 * Two checks beyond `success`, both load-bearing:
 *
 * - `hostname` must be one of ours. Without it, a token minted by the same
 *   sitekey on any other page can be replayed here.
 * - a network failure is a rejection, not a pass. Failing open on a timeout
 *   would mean an attacker who can stall siteverify has removed the control.
 *
 * Tokens are single-use, which is why the client resets the widget after every
 * attempt rather than reusing the token it already has.
 */
async function verifyTurnstile(
  secret: string,
  token: string,
  remoteip: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({ secret, response: token, remoteip }),
      },
    );
    if (!res.ok) return false;
    const result = (await res.json()) as {
      success?: boolean;
      hostname?: string;
    };
    return (
      result.success === true &&
      typeof result.hostname === "string" &&
      result.hostname in localeByHost
    );
  } catch {
    return false;
  }
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return bad("Malformed request.");
  }

  const str = (key: string): string =>
    typeof body[key] === "string" ? (body[key] as string) : "";

  /*
   * The honeypot answers with success.
   *
   * Telling a bot it was caught teaches whoever wrote it to stop filling the
   * field in. A plain success costs nothing and teaches nothing.
   */
  if (str("botcheck")) return Response.json({ success: true });

  const name = str("name").trim();
  const email = str("email").trim();
  const message = str("message").trim();
  const programme = str("programme").trim();

  if (!name || !email || !message) return bad("Missing required fields.");
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message ||
    programme.length > LIMITS.programme
  ) {
    return bad("That submission is too long.");
  }

  // Deliberately permissive: the address has to survive a round trip to a
  // human, not satisfy a regex. Anything shaped wrong bounces later, and a
  // strict pattern here rejects real addresses.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Check the email address.");

  const secret = env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const token = str("cf-turnstile-response");
    if (!token || token.length > MAX_TOKEN) return bad("Verification failed.", 403);
    const ok = await verifyTurnstile(
      secret,
      token,
      request.headers.get("CF-Connecting-IP") ?? "",
    );
    if (!ok) return bad("Verification failed.", 403);
  } else {
    // Not yet configured. The client does not route here in that state, so
    // reaching this branch means the two settings have drifted apart — worth a
    // log line, and worth not silently pretending a check happened.
    console.log(JSON.stringify({ tag: "contact-no-turnstile-secret" }));
  }

  const accessKey = env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.log(JSON.stringify({ tag: "contact-missing-access-key" }));
    return bad("The form is not configured. Please email us instead.", 500);
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        access_key: accessKey,
        subject: str("subject"),
        from_name: str("from_name"),
        name,
        email,
        programme,
        message,
      }),
    });
    const json = (await res.json()) as { success?: boolean; message?: string };
    return Response.json(
      { success: json.success === true, message: json.message },
      { status: json.success === true ? 200 : 502 },
    );
  } catch {
    return bad("Could not reach the mail service. Please try again.", 502);
  }
}
