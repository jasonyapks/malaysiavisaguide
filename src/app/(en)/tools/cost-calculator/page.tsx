import type { Metadata } from "next";
import { CalculatorPage } from "@/content/calculator/CalculatorPage";
import { copy } from "@/content/calculator/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/tools/cost-calculator/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <CalculatorPage locale="en" copy={copy} />;
}
