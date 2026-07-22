import type { Metadata } from "next";
import { Stub } from "@/components/Stub";

export const metadata: Metadata = {
  title: "DE Rantau Nomad Pass",
  description: "Malaysia’s digital nomad visa — income threshold, eligible professions, and what it does not give you.",
};

export default function Page() {
  return (
    <Stub
      title={"DE Rantau Nomad Pass"}
      intent={"Malaysia’s digital nomad visa — income threshold, eligible professions, and what it does not give you."}
      step={"4"}
    />
  );
}
