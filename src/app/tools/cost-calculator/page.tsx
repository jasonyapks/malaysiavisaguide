import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Cost calculator",
  description: "Itemised first-year and total cost by programme and family size — government fees, agent fees and deposits kept separate.",
};

export default function Page() {
  return (
    <Stub
      title={"Cost calculator"}
      intent={"Itemised first-year and total cost by programme and family size — government fees, agent fees and deposits kept separate."}
      step={"5"}
    />
  );
}
