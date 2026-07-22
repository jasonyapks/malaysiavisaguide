import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask a question about any of the programmes covered here.",
};

export default function Page() {
  return (
    <Stub
      title={"Contact"}
      intent={"Ask a question about any of the programmes covered here."}
      step={"6"}
    />
  );
}
