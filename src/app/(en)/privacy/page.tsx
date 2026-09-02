import type { Metadata } from "next";
import { PrivacyPage } from "@/content/privacy/PrivacyPage";
import { copy } from "@/content/privacy/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/privacy/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <PrivacyPage locale="en" copy={copy} />;
}
