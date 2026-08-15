import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisaGuide } from "@/content/visas/VisaGuide";
import { copy as zhHans } from "@/content/visas/mm2h/zh-hans";
import { copy as zhHant } from "@/content/visas/mm2h/zh-hant";
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
}: PageProps<"/[locale]/visas/mm2h">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/visas/mm2h/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({
  params,
}: PageProps<"/[locale]/visas/mm2h">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return (
    <VisaGuide
      slug="mm2h-silver"
      locale={locale}
      copy={COPY[locale]}
      hero={images.mm2h}
      tierSlugs={["mm2h-silver", "mm2h-gold", "mm2h-platinum"]}
    />
  );
}
