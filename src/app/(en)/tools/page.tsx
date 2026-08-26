import type { Metadata } from "next";
import { ToolsPage } from "@/content/tools/ToolsPage";
import { copy } from "@/content/tools/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/tools/",
  locale: "en",
  title: copy.meta.title,
  description: copy.description,
});

export default function Page() {
  return <ToolsPage locale="en" copy={copy} />;
}
