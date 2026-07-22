import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Malaysia My Second Home (MM2H)",
  description: "MM2H across all three tiers — Silver, Gold and Platinum — with the deposit, property and stay rules for each.",
};

export default function Page() {
  return (
    <Stub
      title={"Malaysia My Second Home (MM2H)"}
      intent={"MM2H across all three tiers — Silver, Gold and Platinum — with the deposit, property and stay rules for each."}
      step={"4"}
    />
  );
}
