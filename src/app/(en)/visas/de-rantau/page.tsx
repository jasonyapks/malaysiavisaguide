import type { Metadata } from "next";
import { VisaGuide } from "@/content/visas/VisaGuide";
import { copy } from "@/content/visas/de-rantau/en";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/visas/de-rantau/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return (
    <VisaGuide slug="de-rantau" locale="en" copy={copy} hero={images["de-rantau"]} />
  );
}
