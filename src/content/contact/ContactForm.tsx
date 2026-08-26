"use client";

import { useState } from "react";
import { localisedNavRoutes, navRoutes } from "@/lib/site";
import { localeName, localeOrigin, type Locale } from "@/lib/i18n";
import { getContactCopy } from "./copy";

/**
 * Contact form — SPEC.md §5 step 6. Posts client-side to Web3Forms, so a fully
 * static export can still take enquiries with no backend and no API route.
 *
 * The access key is a public, publishable value (it only identifies which inbox
 * a submission lands in), so `NEXT_PUBLIC_` is correct and safe. It is inlined
 * at build time; until Jason adds it to `.env.local` as NEXT_PUBLIC_WEB3FORMS_KEY,
 * the form degrades to an email fallback rather than silently failing.
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const FALLBACK_EMAIL = "admin@malaysiavisaguide.com";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({ locale }: { locale: Locale }) {
  // Resolved here, not passed in: `errorNetwork` is a function. See ./copy.ts.
  const copy = getContactCopy(locale);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  if (!ACCESS_KEY) {
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
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      // Web3Forms reports the outcome in `success`, and puts the human-readable
      // reason at `body.message` — not at the top level. Testing res.status
      // alone reports a rejected submission as sent, and `json.message` is
      // always undefined, so every failure fell back to the generic string.
      if (json?.success) {
        setStatus("success");
        setMessage(copy.success);
        form.reset();
      } else {
        setStatus("error");
        setMessage(json?.body?.message ?? copy.errorGeneric);
      }
    } catch {
      setStatus("error");
      setMessage(copy.errorNetwork(FALLBACK_EMAIL));
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
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
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

      <Field label={copy.fields.name} htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
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
          rows={6}
          className={`${inputClass} resize-y`}
        />
      </Field>

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
