import type { Metadata } from "next";
import { EligibilityPage } from "@/content/eligibility/EligibilityPage";
import { copy } from "@/content/eligibility/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/tools/eligibility/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <EligibilityPage locale="en" copy={copy} />;
}
