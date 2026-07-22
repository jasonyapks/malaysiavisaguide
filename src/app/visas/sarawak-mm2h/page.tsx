import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Sarawak MM2H (S-MM2H)",
  description: "Sarawak’s own programme — the cheapest serious long-stay route into Malaysia, and its trade-offs.",
};

export default function Page() {
  return (
    <Stub
      title={"Sarawak MM2H (S-MM2H)"}
      intent={"Sarawak’s own programme — the cheapest serious long-stay route into Malaysia, and its trade-offs."}
      step={"4"}
    />
  );
}
