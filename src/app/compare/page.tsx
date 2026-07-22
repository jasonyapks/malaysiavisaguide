import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Compare Malaysia’s long-stay visas",
  description: "Side by side: cost, tenure, deposit, property requirement, minimum stay, dependants and work rights.",
};

export default function Page() {
  return (
    <Stub
      title={"Compare Malaysia’s long-stay visas"}
      intent={"Side by side: cost, tenure, deposit, property requirement, minimum stay, dependants and work rights."}
      step={"5"}
    />
  );
}
