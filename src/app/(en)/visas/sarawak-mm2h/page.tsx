import type { Metadata } from "next";
import { VisaGuide } from "@/content/visas/VisaGuide";
import { copy } from "@/content/visas/sarawak-mm2h/en";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/visas/sarawak-mm2h/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return (
    <VisaGuide slug="smm2h" locale="en" copy={copy} hero={images["sarawak-mm2h"]} />
  );
}
