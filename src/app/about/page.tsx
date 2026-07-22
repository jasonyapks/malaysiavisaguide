import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "About this guide",
  description: "Who writes this, the credentials behind it, and the disclosed commercial relationship with MYPVIP.",
};

export default function Page() {
  return (
    <Stub
      title={"About this guide"}
      intent={"Who writes this, the credentials behind it, and the disclosed commercial relationship with MYPVIP."}
      step={"4"}
    />
  );
}
