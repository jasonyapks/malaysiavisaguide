import type { Metadata } from "next";
import { AgentsHub } from "@/content/agents/AgentsHub";
import { copy } from "@/content/agents/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/agents/",
  locale: "en",
  ...copy.hub.meta,
});

export default function Page() {
  return <AgentsHub locale="en" copy={copy} />;
}
