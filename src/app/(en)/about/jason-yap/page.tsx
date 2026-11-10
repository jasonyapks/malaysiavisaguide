import type { Metadata } from "next";
import { AuthorPage } from "@/content/author/AuthorPage";
import { copy } from "@/content/author/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/about/jason-yap/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <AuthorPage locale="en" copy={copy} />;
}
