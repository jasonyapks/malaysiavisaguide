import type { Metadata } from "next";
import { ThankYouPage } from "@/content/thank-you/ThankYouPage";
import { copy } from "@/content/thank-you/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...pageMetadata({
    canonicalPath: "/thank-you/",
    locale: "en",
    title: copy.meta.title,
    description: copy.meta.description,
  }),
  // A confirmation page has nothing to offer a searcher, and one that ranks
  // gets reached without submitting — which would quietly inflate the very
  // conversion this page exists to count. `follow` stays on so the links out
  // of it still pass.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ThankYouPage locale="en" copy={copy} />;
}
