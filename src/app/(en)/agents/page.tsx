import type { Metadata } from "next";
import { AgentsHub, hubMeta } from "@/content/agents/AgentsHub";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/agents/",
  locale: "en",
  ...hubMeta,
});

export default function Page() {
  return <AgentsHub />;
}
