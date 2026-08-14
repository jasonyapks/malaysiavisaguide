import type { Metadata } from "next";
import { HomePage } from "@/content/home/HomePage";
import { copy } from "@/content/home/en";
import { pageMetadata } from "@/lib/metadata";

// Title and description come from the layout default (the home page is the one
// page that should carry the full sitewide title). Canonical is set explicitly
// so the apex has a self-reference like every other route, and `pageMetadata`
// adds the hreflang set alongside it.
export const metadata: Metadata = pageMetadata({
  canonicalPath: "/",
  locale: "en",
});

export default function Home() {
  return <HomePage locale="en" copy={copy} />;
}
