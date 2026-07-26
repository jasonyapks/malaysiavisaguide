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
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          What will it actually cost?
        </h1>
        <p className="text-[1.2rem] leading-relaxed text-ink-muted">
          Pick a programme and your family size. Every figure is the official
          one from that programme&apos;s guide — and the money you get back (a
          fixed deposit) is kept well apart from the money you don&apos;t.
        </p>
      </header>

      {/* Before the calculator, not after: a total built on a superseded fee is
          exactly the output a reader would act on. */}
      <SupersededNotices programmes={programmes} />

      <CostCalculator />
    </div>
  );
}
