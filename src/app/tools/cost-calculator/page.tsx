import type { Metadata } from "next";
import { SupersededNotices } from "@/components/SupersededNotice";
import { programmes } from "@/lib/data/programmes";
import { CostCalculator } from "./CostCalculator";

export const metadata: Metadata = {
  title: "What each Malaysian visa really costs",
  description:
    "An itemised, honest cost estimate for every Malaysian long-stay programme and work/study pass — by family size, with refundable deposits kept strictly separate from the fees you never see again.",
  alternates: { canonical: "/tools/cost-calculator/" },
};

export default function Page() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-h1 font-semibold">
          What will it actually cost?
        </h1>
        <p className="text-lead leading-relaxed text-ink-muted">
          Pick a programme and your family size. Every figure is the official
          one from that programme&apos;s guide — and the money you get back (a
          fixed deposit) is kept well apart from the money you don&apos;t.
        </p>
      </header>

      <CostCalculator />

      {/* Below the calculator, not above it. The estimate renders above this
          point, so the caveat still reaches the reader before they act on a
          total — without burying the tool under two screens of preamble. */}
      <SupersededNotices programmes={programmes} />
    </div>
  );
}
