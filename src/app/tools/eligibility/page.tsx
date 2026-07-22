import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Eligibility checker",
  description: "A short quiz that tells you which Malaysian long-stay programmes you actually qualify for.",
};

export default function Page() {
  return (
    <Stub
      title={"Eligibility checker"}
      intent={"A short quiz that tells you which Malaysian long-stay programmes you actually qualify for."}
      step={"5"}
    />
  );
}
