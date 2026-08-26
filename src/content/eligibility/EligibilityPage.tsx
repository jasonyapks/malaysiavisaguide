import { SupersededNotices } from "@/components/SupersededNotice";
import { programmes } from "@/lib/data/programmes";
import type { Locale } from "@/lib/i18n";
import { localiseProgramme } from "@/lib/programme-locale";
import { EligibilityQuiz } from "./EligibilityQuiz";
import type { EligibilityCopy } from "./types";

export function EligibilityPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: EligibilityCopy;
}) {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-h1 font-semibold">{copy.heading}</h1>
        <p className="text-lead leading-relaxed text-ink-muted">{copy.lead}</p>
      </header>

      <EligibilityQuiz locale={locale} />

      {/* Below the quiz, not above it. The warning still precedes every figure
          a reader could act on, because the quiz's own verdict renders above
          this point — and putting it first meant a page whose single job is to
          run a quiz opened with two screens of caveat and no quiz. */}
      <SupersededNotices
        programmes={programmes.map((p) => localiseProgramme(p, locale))}
        locale={locale}
      />
    </div>
  );
}
