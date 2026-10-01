import type { Metadata } from "next";
import { AgentListPage } from "@/content/agents/AgentListPage";
import { copy } from "@/content/agents/en";
import { registerCount } from "@/lib/data/agents";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/agents/pvip/",
  locale: "en",
  title: copy.list.pvip.meta.title,
  description: copy.list.pvip.meta.description(registerCount("pvip")),
});

export default function Page() {
  return <AgentListPage programme="pvip" locale="en" copy={copy} />;
}
