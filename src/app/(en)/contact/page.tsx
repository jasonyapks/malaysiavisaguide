import type { Metadata } from "next";
import { ContactPage } from "@/content/contact/ContactPage";
import { copy } from "@/content/contact/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/contact/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <ContactPage locale="en" copy={copy} />;
}
