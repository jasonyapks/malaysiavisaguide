import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Editorial policy",
  description: "How content here is researched, sourced, reviewed and dated — and what happens when a rule changes.",
};

export default function Page() {
  return (
    <Stub
      title={"Editorial policy"}
      intent={"How content here is researched, sourced, reviewed and dated — and what happens when a rule changes."}
      step={"4"}
    />
  );
}
