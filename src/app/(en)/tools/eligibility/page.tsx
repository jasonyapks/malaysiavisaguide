import type { Metadata } from "next";
import { SupersededNotices } from "@/components/SupersededNotice";
import { programmes } from "@/lib/data/programmes";
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
        <h1 className="text-h1 font-semibold">
          Which visa do you qualify for?
        </h1>
        <p className="text-lead leading-relaxed text-ink-muted">
          Six questions at most. No sign-up, nothing stored, no sales pitch —
          just an honest read of which programmes fit your situation, checked
          against the same official figures used across this site.
        </p>
      </header>

      <EligibilityQuiz />

      {/* Below the quiz, not above it. The warning still precedes every figure
          a reader could act on, because the quiz's own verdict renders above
          this point — and putting it first meant a page whose single job is to
          run a quiz opened with two screens of caveat and no quiz. */}
      <SupersededNotices programmes={programmes} />
    </div>
  );
}
