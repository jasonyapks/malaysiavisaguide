import type { Metadata } from "next";
import { AgentListPage, listMeta } from "@/content/agents/AgentListPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/agents/mm2h/",
  locale: "en",
  ...listMeta.mm2h,
});

export default function Page() {
  return <AgentListPage programme="mm2h" />;
}
