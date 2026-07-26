"use client";

import { useState } from "react";
import { navRoutes } from "@/lib/site";

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

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  if (!ACCESS_KEY) {
    return (
      <div className="rounded-xl border border-sand-400 bg-sand-100 p-6 text-[1.0625rem] leading-relaxed text-ink-muted">
        The enquiry form isn&apos;t connected yet. In the meantime, email{" "}
        <a
          href={`mailto:${FALLBACK_EMAIL}`}
          className="font-semibold text-forest-700 underline"
        >
          {FALLBACK_EMAIL}
        </a>{" "}
        and you&apos;ll get a reply from the same person who writes these guides.
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
        setMessage(
          "Thanks — your message is on its way. You'll hear back at the email you gave.",
        );
        form.reset();
      } else {
        setStatus("error");
        setMessage(
          json?.body?.message ??
            "Something went wrong. Please try again in a moment.",
        );
      }
    } catch {
      setStatus("error");
      setMessage(
        `Couldn't send that. Please email ${FALLBACK_EMAIL} directly instead.`,
      );
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-forest-300 bg-forest-50 p-6 text-[1.0625rem] leading-relaxed text-forest-900"
      >
        {message}
      </div>
    );
  }

  const programmes = [...navRoutes("programmes"), ...navRoutes("work-study")];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
      <input
        type="hidden"
        name="subject"
        value="New enquiry — malaysiavisaguide.com"
      />
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

      <Field label="Your name" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      <Field label="Which programme is this about?" htmlFor="programme">
        <select
          id="programme"
          name="programme"
          defaultValue=""
          className={inputClass}
        >
          <option value="">Not sure yet / general question</option>
          {programmes.map((p) => (
            <option key={p.path} value={p.title}>
              {p.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Your question" htmlFor="message">
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
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>

      {status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 text-[1rem] font-medium text-alert-600"
        >
          {/* Icon, not colour alone — a red-only error is invisible to
              colourblind users. */}
          <span aria-hidden>⚠</span>
          <span>{message}</span>
        </p>
      )}

      <p className="text-[0.9rem] text-ink-muted">
        Your details are used only to reply to this enquiry. This is an
        independent guide — sending a question does not start a visa application.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-sand-400 bg-white px-4 py-3 text-[1.0625rem] text-ink outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-600/30";

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
