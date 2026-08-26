import type { Metadata } from "next";
import { ComparePage } from "@/content/compare/ComparePage";
import { copy } from "@/content/compare/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/compare/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <ComparePage locale="en" copy={copy} />;
}
