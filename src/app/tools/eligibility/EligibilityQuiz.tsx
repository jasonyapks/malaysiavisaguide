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

type StepId = "goal" | "age" | "capital" | "income" | "property" | "sponsor";

type Choice = { label: string; hint?: string; patch: Partial<Answers> };
type Step = { prompt: string; help?: string; choices: Choice[] };

const STEPS: Record<StepId, Step> = {
  goal: {
    prompt: "What's your main plan for Malaysia?",
    help: "This decides which programmes are even open to you.",
    choices: [
      {
        label: "Live here long-term",
        hint: "Retire, relocate, or set up a family base — no local job needed",
        patch: { goal: "live" },
      },
      {
        label: "Work remotely for a foreign employer or clients",
        hint: "Income paid from outside Malaysia",
        patch: { goal: "remote" },
      },
      {
        label: "Take a job with a Malaysian employer",
        hint: "A local company hires and sponsors you",
        patch: { goal: "job" },
      },
      {
        label: "Study at a Malaysian institution",
        hint: "A school, college or university place",
        patch: { goal: "study" },
      },
    ],
  },
  age: {
    prompt: "How old are you?",
    help: "Two long-stay programmes carry a minimum age.",
    choices: [
      { label: "Under 25", patch: { ageFloor: 24 } },
      { label: "25 – 29", patch: { ageFloor: 25 } },
      { label: "30 – 49", patch: { ageFloor: 30 } },
      { label: "50 or older", patch: { ageFloor: 50 } },
    ],
  },
  capital: {
    prompt: "Roughly how much could you place as a deposit or investment?",
    help: "Money you could lock in a fixed deposit or put into property. It stays yours — a deposit is not a fee.",
    choices: [
      { label: "Under RM 500,000", patch: { capitalMYR: 0 } },
      { label: "RM 500,000 – RM 1 million", patch: { capitalMYR: 500_000 } },
      {
        label: "RM 1 million – RM 2.35 million",
        hint: "≈ USD 150,000 – 500,000",
        patch: { capitalMYR: 1_000_000 },
      },
      {
        label: "RM 2.35 million – RM 4.7 million",
        hint: "≈ USD 500,000 – 1 million",
        patch: { capitalMYR: 2_350_000 },
      },
      {
        label: "More than RM 4.7 million",
        hint: "≈ USD 1 million+",
        patch: { capitalMYR: 4_700_000 },
      },
    ],
  },
  income: {
    prompt: "What's your income, before tax?",
    help: "Use the ringgit equivalent if you're paid in another currency.",
    choices: [
      { label: "Under RM 5,000 a month", patch: { incomeMYR: 0 } },
      { label: "RM 5,000 – RM 10,000 a month", patch: { incomeMYR: 5_000 } },
      { label: "RM 10,000 – RM 40,000 a month", patch: { incomeMYR: 10_000 } },
      { label: "RM 40,000 a month or more", patch: { incomeMYR: 40_000 } },
    ],
  },
  property: {
    prompt: "Would you buy Malaysian property to qualify?",
    help: "MM2H requires a property purchase. The other programmes never do.",
    choices: [
      { label: "Yes, I'd buy property", patch: { buyProperty: true } },
      { label: "No, or I'd rather not", patch: { buyProperty: false } },
    ],
  },
  sponsor: {
    prompt: "Do you already have an employer or institution lined up?",
    help: "This pass can't be applied for without one.",
    choices: [
      { label: "Yes", patch: { hasSponsor: true } },
      { label: "Not yet", patch: { hasSponsor: false } },
    ],
  },
};

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

const GOAL_INTRO: Record<Goal, string> = {
  live: "Based on what you told us, here's where you stand on the four long-stay programmes.",
  remote:
    "Here's the remote-work route, plus the long-stay programmes your means could also open.",
  job: "Working for a Malaysian employer means one route — the Employment Pass.",
  study: "Studying in Malaysia means one route — the Student Pass.",
};

export function EligibilityQuiz() {
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
    return <Results answers={draft as Answers} onRestart={restart} />;
  }

  const stepId = sequence[index];
  const step = STEPS[stepId];
  const total = draft.goal ? sequence.length : null;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[0.85rem] text-ink-muted">
          <span>
            {total ? `Question ${index + 1} of ${total}` : "Let's start"}
          </span>
          {index > 0 && (
            <button
              type="button"
              onClick={back}
              className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-900"
            >
              ← Back
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
          <h2 className="font-serif text-2xl font-semibold text-forest-900">
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
                <span className="mt-0.5 block text-[0.9rem] text-ink-muted">
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
}: {
  answers: Answers;
  onRestart: () => void;
}) {
  const { qualified, nearMiss } = evaluate(answers);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h2 className="font-serif text-3xl font-semibold text-forest-900">
          Your results
        </h2>
        <p className="text-ink-muted">{GOAL_INTRO[answers.goal]}</p>
      </header>

      {qualified.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-serif text-xl font-semibold text-forest-900">
            {qualified.length === 1
              ? "One programme fits"
              : `${qualified.length} programmes fit`}
          </h3>
          <ul className="grid gap-4">
            {qualified.map((r) => (
              <QualifiedCard key={r.slug} result={r} />
            ))}
          </ul>
        </section>
      )}

      {nearMiss.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-serif text-xl font-semibold text-forest-900">
            So close
          </h3>
          <p className="text-[0.95rem] text-ink-muted">
            Ruled out by a single requirement — worth a look if your situation
            might change.
          </p>
          <ul className="grid gap-3">
            {nearMiss.map((r) => (
              <li
                key={r.slug}
                className="rounded-xl border border-sand-200 bg-sand-50 px-5 py-4"
              >
                <Link
                  href={r.href}
                  className="font-serif text-lg font-semibold text-forest-900 underline underline-offset-2"
                >
                  {r.name}
                </Link>
                <p className="mt-1 text-[0.95rem] text-ink-muted">
                  Needs only:{" "}
                  <span className="text-ink">{r.blockers[0]}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {qualified.length === 0 && nearMiss.length === 0 && (
        <section className="rounded-xl border border-sand-200 bg-sand-50 px-6 py-6">
          <p className="text-ink">
            Nothing lines up cleanly with the answers you gave — which is common,
            and doesn&apos;t mean there&apos;s no route. The programmes change
            often, and the edge cases are exactly where an experienced agent
            earns their fee.
          </p>
        </section>
      )}

      <div className="space-y-3 rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        <p className="font-serif text-xl font-semibold text-sand-50">
          Want a second opinion from someone who&apos;s done this 1,000+ times?
        </p>
        <p className="text-sand-100">
          Jason reviews cases personally — no obligation, and he&apos;ll tell you
          if the DIY route is genuinely better for you.
        </p>
        <div className="flex flex-wrap gap-4 pt-1">
          <Link
            href="/contact/"
            className="rounded-lg bg-hibiscus-500 px-5 py-2.5 font-semibold text-sand-50 hover:bg-hibiscus-600"
          >
            Ask a question
          </Link>
          <Link
            href="/compare/"
            className="rounded-lg border border-sand-100/40 px-5 py-2.5 font-semibold text-sand-50 hover:bg-forest-700"
          >
            Compare side by side
          </Link>
        </div>
      </div>

      <div className="space-y-2 border-t border-sand-200 pt-5 text-[0.85rem] text-ink-muted">
        <p>
          This is a guide, not a determination or legal advice. US-dollar
          thresholds are compared at an indicative USD&nbsp;1&nbsp;≈&nbsp;RM
          {INDICATIVE_USD_TO_MYR.toFixed(2)} — the rate you actually get is part
          of the real cost. Every figure behind these results is drawn from the
          official sources cited on each programme&apos;s guide page.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-900"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

function QualifiedCard({ result }: { result: Result }) {
  const met = result.gates.filter((g) => g.ok);
  return (
    <li className="rounded-xl border border-forest-300 bg-forest-50 px-5 py-4">
      <Link
        href={result.href}
        className="font-serif text-lg font-semibold text-forest-900 underline underline-offset-2"
      >
        {result.name}
      </Link>
      {met.length > 0 && (
        <ul className="mt-2 space-y-1">
          {met.map((g) => (
            <li
              key={g.requirement}
              className="flex gap-2 text-[0.95rem] text-ink-muted"
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
        href={result.href}
        className="mt-3 inline-block text-[0.95rem] font-semibold text-forest-700 hover:text-forest-900"
      >
        Read the full guide →
      </Link>
    </li>
  );
}
