import type { Metadata } from "next";
import { AboutPage } from "@/content/about/AboutPage";
import { copy } from "@/content/about/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/about/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <AboutPage locale="en" copy={copy} />;
}
