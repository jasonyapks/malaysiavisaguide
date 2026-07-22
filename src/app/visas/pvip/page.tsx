import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Premium Visa Programme (PVIP)",
  description: "The full guide to PVIP — requirements, real costs, process and timeline, and who it genuinely suits.",
};

export default function Page() {
  return (
    <Stub
      title={"Premium Visa Programme (PVIP)"}
      intent={"The full guide to PVIP — requirements, real costs, process and timeline, and who it genuinely suits."}
      step={"4"}
    />
  );
}
