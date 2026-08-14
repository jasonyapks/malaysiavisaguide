import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisaGuide } from "@/content/visas/VisaGuide";
import { copy as zhHans } from "@/content/visas/pvip/zh-hans";
import { copy as zhHant } from "@/content/visas/pvip/zh-hant";
import { images } from "@/lib/images";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { GuideCopy } from "@/content/visas/types";

const COPY: Record<PrefixedLocale, GuideCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/visas/pvip">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/visas/pvip/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/visas/pvip">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return (
    <VisaGuide
      slug="pvip"
      locale={locale}
      copy={COPY[locale]}
      hero={images.pvip}
    />
  );
}
