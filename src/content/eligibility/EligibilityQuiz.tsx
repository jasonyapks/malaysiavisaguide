"use client";

import Link from "next/link";
import { useState } from "react";
import {
  evaluate,
  INDICATIVE_USD_TO_MYR,
  type Answers,
  type Goal,
  type Result,
} from "@/lib/eligibility";
import { linkPath } from "@/lib/translated";
import type { Locale } from "@/lib/i18n";
import { getEligibilityCopy } from "./copy";
import type { EligibilityCopy, StepId } from "./types";

function sequenceFor(goal: Goal | undefined): StepId[] {
  if (!goal) return ["goal"];
  switch (goal) {
    case "live":
    case "remote":
      return ["goal", "age", "capital", "income", "property"];
    case "job":
      return ["goal", "income", "sponsor"];
    case "study":
      return ["goal", "sponsor"];
  }
}

export function EligibilityQuiz({ locale }: { locale: Locale }) {
  // Resolved here rather than passed in: the copy holds functions, which cannot
  // cross the server/client boundary. See ./copy.ts.
  const copy = getEligibilityCopy(locale);
  const [draft, setDraft] = useState<Partial<Answers>>({});
  const [index, setIndex] = useState(0);

  const sequence = sequenceFor(draft.goal);
  const finished = draft.goal != null && index >= sequence.length;

  function choose(patch: Partial<Answers>) {
    setDraft((d) => ({ ...d, ...patch }));
    setIndex((i) => i + 1);
  }

  function back() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function restart() {
    setDraft({});
    setIndex(0);
  }

  if (finished) {
    return (
      <Results
        answers={draft as Answers}
        onRestart={restart}
        locale={locale}
        copy={copy}
      />
    );
  }

  const stepId = sequence[index];
  const step = copy.steps[stepId];
  const total = draft.goal ? sequence.length : null;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-caption text-ink-muted">
          <span>
            {total ? copy.progress.counter(index + 1, total) : copy.progress.start}
          </span>
          {index > 0 && (
            <button
              type="button"
              onClick={back}
              className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-900"
            >
              ← {copy.progress.back}
            </button>
          )}
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-sand-200"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-forest-600 transition-all"
            style={{ width: `${(index / (total ?? 5)) * 100}%` }}
          />
        </div>
      </div>

      <fieldset className="space-y-5">
        <legend className="space-y-2">
          <h2 className="font-serif text-h3 font-semibold text-forest-900">
            {step.prompt}
          </h2>
          {step.help && <p className="text-ink-muted">{step.help}</p>}
        </legend>

        <div className="grid gap-3">
          {step.choices.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => choose(c.patch)}
              className="group rounded-xl border border-sand-200 bg-white px-5 py-4 text-left transition-colors hover:border-forest-600 hover:bg-forest-50 focus-visible:border-forest-600 focus-visible:outline-none"
            >
              <span className="block font-medium text-ink group-hover:text-forest-900">
                {c.label}
              </span>
              {c.hint && (
                <span className="mt-0.5 block text-caption text-ink-muted">
                  {c.hint}
                </span>
              )}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function Results({
  answers,
  onRestart,
  locale,
  copy,
}: {
  answers: Answers;
  onRestart: () => void;
  locale: Locale;
  copy: EligibilityCopy;
}) {
  // The requirement lines come back already in `locale` — see gatesFor().
  const { qualified, nearMiss } = evaluate(answers, locale);
  const href = (path: string) => linkPath(path, locale);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h2 className="font-serif text-h2 font-semibold text-forest-900">
          {copy.results.heading}
        </h2>
        <p className="text-ink-muted">
          {copy.results.goalIntro[answers.goal]}
        </p>
      </header>

      {qualified.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-serif text-lead font-semibold text-forest-900">
            {copy.results.fitsHeading(qualified.length)}
          </h3>
          <ul className="grid gap-4">
            {qualified.map((r) => (
              <QualifiedCard
                key={r.slug}
                result={r}
                href={href(r.href)}
                readGuide={copy.results.readGuide}
              />
            ))}
          </ul>
        </section>
      )}

      {nearMiss.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-serif text-lead font-semibold text-forest-900">
            {copy.results.nearMissHeading}
          </h3>
          <p className="text-body-sm text-ink-muted">
            {copy.results.nearMissLead}
          </p>
          <ul className="grid gap-3">
            {nearMiss.map((r) => (
              <li
                key={r.slug}
                className="rounded-xl border border-sand-200 bg-sand-50 px-5 py-4"
              >
                <Link
                  href={href(r.href)}
                  className="font-serif text-lead font-semibold text-forest-900 underline underline-offset-2"
                >
                  {r.name}
                </Link>
                <p className="mt-1 text-body-sm text-ink-muted">
                  {copy.results.needsOnly}{" "}
                  <span className="text-ink">{r.blockers[0]}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {qualified.length === 0 && nearMiss.length === 0 && (
        <section className="rounded-xl border border-sand-200 bg-sand-50 px-6 py-6">
          <p className="text-ink">{copy.results.nothingFits}</p>
        </section>
      )}

      <div className="space-y-3 rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        <p className="font-serif text-lead font-semibold text-sand-50">
          {copy.cta.title}
        </p>
        <p className="text-sand-100">{copy.cta.body}</p>
        <div className="flex flex-wrap gap-4 pt-1">
          <Link
            href={href("/contact/")}
            className="rounded-lg bg-hibiscus-500 px-5 py-2.5 font-semibold text-sand-50 hover:bg-hibiscus-600"
          >
            {copy.cta.ask}
          </Link>
          <Link
            href={href("/compare/")}
            className="rounded-lg border border-sand-100/40 px-5 py-2.5 font-semibold text-sand-50 hover:bg-forest-700"
          >
            {copy.cta.compare}
          </Link>
        </div>
      </div>

      <div className="space-y-2 border-t border-sand-200 pt-5 text-caption text-ink-muted">
        <p>{copy.disclaimer(INDICATIVE_USD_TO_MYR.toFixed(2))}</p>
        <button
          type="button"
          onClick={onRestart}
          className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-900"
        >
          {copy.startOver}
        </button>
      </div>
    </div>
  );
}

function QualifiedCard({
  result,
  href,
  readGuide,
}: {
  result: Result;
  href: string;
  readGuide: string;
}) {
  const met = result.gates.filter((g) => g.ok);
  return (
    <li className="rounded-xl border border-forest-300 bg-forest-50 px-5 py-4">
      <Link
        href={href}
        className="font-serif text-lead font-semibold text-forest-900 underline underline-offset-2"
      >
        {result.name}
      </Link>
      {met.length > 0 && (
        <ul className="mt-2 space-y-1">
          {met.map((g) => (
            <li
              key={g.requirement}
              className="flex gap-2 text-body-sm text-ink-muted"
            >
              <span aria-hidden className="text-forest-600">
                ✓
              </span>
              {g.requirement}
            </li>
          ))}
        </ul>
      )}
      <Link
        href={href}
        className="mt-3 inline-block text-body-sm font-semibold text-forest-700 hover:text-forest-900"
      >
        {readGuide} <span aria-hidden>→</span>
      </Link>
    </li>
  );
}
