import type { Metadata } from "next";
import { EligibilityQuiz } from "./EligibilityQuiz";

export const metadata: Metadata = {
  title: "Which Malaysian visa do you qualify for?",
  description:
    "A short quiz that reads your age, means and plans and tells you which Malaysian long-stay programmes and work/study passes you actually qualify for — and which you just miss.",
  alternates: { canonical: "/tools/eligibility/" },
};

export default function Page() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          Which visa do you qualify for?
        </h1>
        <p className="text-[1.2rem] leading-relaxed text-ink-muted">
          Six questions at most. No sign-up, nothing stored, no sales pitch —
          just an honest read of which programmes fit your situation, checked
          against the same official figures used across this site.
        </p>
      </header>

      <EligibilityQuiz />
    </div>
  );
}
