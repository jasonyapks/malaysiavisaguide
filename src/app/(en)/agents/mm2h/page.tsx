import type { Metadata } from "next";
import { AgentListPage } from "@/content/agents/AgentListPage";
import { copy } from "@/content/agents/en";
import { registerCount } from "@/lib/data/agents";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/agents/mm2h/",
  locale: "en",
  title: copy.list.mm2h.meta.title,
  description: copy.list.mm2h.meta.description(registerCount("mm2h")),
});

export default function Page() {
  return <AgentListPage programme="mm2h" locale="en" copy={copy} />;
}
