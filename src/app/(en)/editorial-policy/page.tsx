import type { Metadata } from "next";
import { EditorialPolicyPage } from "@/content/editorial-policy/EditorialPolicyPage";
import { copy } from "@/content/editorial-policy/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/editorial-policy/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <EditorialPolicyPage locale="en" copy={copy} />;
}
