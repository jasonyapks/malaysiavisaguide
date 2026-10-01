import type { Metadata } from "next";
import { AgentListPage, listMeta } from "@/content/agents/AgentListPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/agents/pvip/",
  locale: "en",
  ...listMeta.pvip,
});

export default function Page() {
  return <AgentListPage programme="pvip" />;
}
