import { SupersededNotices } from "@/components/SupersededNotice";
import { programmes } from "@/lib/data/programmes";
import type { Locale } from "@/lib/i18n";
import { localiseProgramme } from "@/lib/programme-locale";
import { CostCalculator } from "./CostCalculator";
import type { CalculatorCopy } from "./types";

export function CalculatorPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: CalculatorCopy;
}) {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-h1 font-semibold">{copy.heading}</h1>
        <p className="text-lead leading-relaxed text-ink-muted">{copy.lead}</p>
      </header>

      <CostCalculator locale={locale} />

      {/* Below the calculator, not above it. The estimate renders above this
          point, so the caveat still reaches the reader before they act on a
          total — without burying the tool under two screens of preamble. */}
      <SupersededNotices
        programmes={programmes.map((p) => localiseProgramme(p, locale))}
        locale={locale}
      />
    </div>
  );
}
