import type { Metadata } from "next";
import { VisaGuide } from "@/content/visas/VisaGuide";
import { copy } from "@/content/visas/mm2h/en";
import { images } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/visas/mm2h/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return (
    <VisaGuide
      slug="mm2h-silver"
      locale="en"
      copy={copy}
      hero={images.mm2h}
      tierSlugs={["mm2h-silver", "mm2h-gold", "mm2h-platinum"]}
    />
  );
}
