"use client";

import { useEffect, useState } from "react";
import { localisedNavRoutes, navRoutes } from "@/lib/site";
import { localeName, localeOrigin, type Locale } from "@/lib/i18n";
import { getContactCopy } from "./copy";

/**
 * Contact form — SPEC.md §5 step 6.
 *
 * ## Two submit paths, and which one is live
 *
 * Originally this POSTed from the browser straight to Web3Forms, so a fully
 * static export could take enquiries with no backend. That works, but it puts
 * the access key in the bundle and leaves a honeypot as the only bot control.
 *
 * When NEXT_PUBLIC_TURNSTILE_SITE_KEY is set at build time, the form instead
 * renders a Turnstile widget and posts to `/api/contact`, a Pages Function that
 * verifies the token server-side and forwards to Web3Forms with a key that
 * never reaches the client. That path needs TURNSTILE_SECRET_KEY and
 * WEB3FORMS_ACCESS_KEY set on the Pages project.
 *
 * Both paths are kept because the switchover is a configuration change, not a
 * deploy: until the sitekey exists the old path is still the working one, and
 * shipping this file cannot break a form that is currently taking enquiries.
 *
 * The access key is a publishable value — it only identifies which inbox a
 * submission lands in — so `NEXT_PUBLIC_` was never a leak in the way a secret
 * would be. Moving it server-side removes the ability to POST to that inbox
 * without passing the challenge, which is the part that mattered.
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const FALLBACK_EMAIL = "admin@malaysiavisaguide.com";

/** The subset of the Turnstile browser API this file uses. */
declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void };
  }
}

/**
 * Our locale codes are not Turnstile's.
 *
 * Turnstile takes `zh-cn` / `zh-tw`; ours are script-based (`zh-hans` /
 * `zh-hant`) for the reason given in i18n.ts. Left unmapped the widget falls
 * back to English, which is a jarring thing to meet at the end of an otherwise
 * Chinese page.
 */
function turnstileLanguage(locale: Locale): string {
  if (locale === "zh-hans") return "zh-cn";
  if (locale === "zh-hant") return "zh-tw";
  return "en";
}

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({ locale }: { locale: Locale }) {
  // Resolved here, not passed in: `errorNetwork` is a function. See ./copy.ts.
  const copy = getContactCopy(locale);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  /*
   * Load the Turnstile script once, and only where it is used.
   *
   * Injected here rather than rendered as JSX or put in the document head: the
   * widget belongs to this one form, so a reader who never opens /contact/
   * should not pay for the request. Guarded by src because React re-runs
   * effects on remount in development.
   */
  useEffect(() => {
    if (!SITE_KEY) return;
    const src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // With the proxy live the client no longer needs an access key of its own —
  // the sitekey is enough to know the form has somewhere to go.
  if (!ACCESS_KEY && !SITE_KEY) {
    return (
      <div className="rounded-xl border border-sand-400 bg-sand-100 p-6 text-body-sm leading-relaxed text-ink-muted">
        {copy.notConnected.before}{" "}
        <a
          href={`mailto:${FALLBACK_EMAIL}`}
          className="font-semibold text-forest-700 underline"
        >
          {FALLBACK_EMAIL}
        </a>
        {copy.notConnected.after}
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(
        SITE_KEY ? "/api/contact" : "https://api.web3forms.com/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      const json = await res.json();

      // Web3Forms reports the outcome in `success`, and puts the human-readable
      // reason at `body.message` — not at the top level. Testing res.status
      // alone reports a rejected submission as sent, and `json.message` is
      // always undefined, so every failure fell back to the generic string.
      //
      // The proxy answers in the same shape, with the reason flattened to
      // `message`, so both paths read the same here.
      if (json?.success) {
        setStatus("success");
        setMessage(copy.success);
        form.reset();
      } else {
        setStatus("error");
        setMessage(json?.body?.message ?? json?.message ?? copy.errorGeneric);
      }
    } catch {
      setStatus("error");
      setMessage(copy.errorNetwork(FALLBACK_EMAIL));
    } finally {
      /*
       * A Turnstile token is single-use, and this form stays on the page after
       * a submission instead of navigating away. Without a reset, the widget
       * still shows its tick, the reader presses send again, and the second
       * attempt is rejected with a verification error they cannot act on.
       * Reset on every outcome — a failed send is exactly when someone retries.
       */
      window.turnstile?.reset();
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-forest-300 bg-forest-50 p-6 text-body-sm leading-relaxed text-forest-900"
      >
        {message}
      </div>
    );
  }

  /*
   * Two lists, on purpose.
   *
   * The reader picks from `labels`, in their own language. What gets SUBMITTED
   * is the English title at the same index, because this value lands in Jason's
   * inbox and an enquiry queue where the same programme arrives under three
   * different names is a queue nobody can filter. The locale is already flagged
   * in the subject line, so nothing is lost by keeping the value stable.
   *
   * `navRoutes` and `localisedNavRoutes` walk the same `routes` array in the
   * same order, so the indices correspond.
   */
  const canonical = [...navRoutes("programmes"), ...navRoutes("work-study")];
  const labels = [
    ...localisedNavRoutes("programmes", locale),
    ...localisedNavRoutes("work-study", locale),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Only on the legacy path. On the proxy path the key lives in the
          Function's environment and must not be in the page at all. */}
      {!SITE_KEY && <input type="hidden" name="access_key" value={ACCESS_KEY} />}
      <input type="hidden" name="subject" value={subject(locale)} />
      <input type="hidden" name="from_name" value="Malaysia Visa Guide" />

      {/* Honeypot — Web3Forms spam protection. Hidden from real users. */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      {/* The length caps below bound honest input; they are not a security
          control and should not be mistaken for one. This form POSTs straight
          from the browser to Web3Forms with a publishable access key, so anyone
          determined can skip the DOM entirely and post whatever they like. What
          these do is stop a paste accident becoming a 2 MB submission, and give
          the reader a limit their browser enforces while they type. The real
          bot control has to run where we do not: on Web3Forms' side, or behind
          a proxy of our own. */}
      <Field label={copy.fields.name} htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          className={inputClass}
        />
      </Field>

      <Field label={copy.fields.email} htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          // 254 is the maximum length of an address that can be delivered.
          maxLength={254}
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      <Field label={copy.fields.programme} htmlFor="programme">
        <select
          id="programme"
          name="programme"
          defaultValue=""
          className={inputClass}
        >
          <option value="">{copy.fields.programmeAny}</option>
          {canonical.map((p, i) => (
            <option key={p.path} value={p.title}>
              {labels[i]?.title ?? p.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label={copy.fields.message} htmlFor="message">
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          rows={6}
          className={`${inputClass} resize-y`}
        />
      </Field>

      {/* Implicit rendering: the script picks this up by class and writes the
          token into a `cf-turnstile-response` field inside the form, which the
          FormData sweep above then carries to the proxy. */}
      {SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={SITE_KEY}
          data-language={turnstileLanguage(locale)}
        />
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        className="rounded-lg bg-forest-900 px-6 py-3 font-semibold text-sand-50 transition hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600/50 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {status === "submitting" ? copy.submitting : copy.submit}
      </button>

      {status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 text-body-sm font-medium text-alert-600"
        >
          {/* Icon, not colour alone — a red-only error is invisible to
              colourblind users. */}
          <span aria-hidden>⚠</span>
          <span>{message}</span>
        </p>
      )}

      <p className="text-caption text-ink-muted">{copy.privacyNote}</p>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-sand-400 bg-white px-4 py-3 text-body-sm text-ink outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-600/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block font-semibold text-forest-900">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * The Web3Forms subject line — what Jason sees in his inbox before opening
 * anything.
 *
 * Derived rather than translated, for two reasons. "New enquiry" is
 * deliberately English in every locale so the inbox sorts and filters as one
 * stream; and the parts that do vary are facts about the locale, not prose, so
 * they come from `i18n.ts` where they are already correct. Written into the
 * copy files instead, the Traditional one came out of the script converter as
 * "简体中文" turned into "簡體中文" and still pointing at cn. — right characters,
 * wrong language, wrong host.
 *
 * The flag matters operationally: an enquiry written in Chinese needs a reply
 * in Chinese, and that is worth knowing from the subject line.
 */
function subject(locale: Locale): string {
  const host = new URL(localeOrigin[locale]).host;
  if (locale === "en") return `New enquiry — ${host}`;
  return `New enquiry (${localeName[locale]}) — ${host}`;
}
