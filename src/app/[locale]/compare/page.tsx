import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparePage } from "@/content/compare/ComparePage";
import { copy as zhHans } from "@/content/compare/zh-hans";
import { copy as zhHant } from "@/content/compare/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { CompareCopy } from "@/content/compare/types";

const COPY: Record<PrefixedLocale, CompareCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/compare">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/compare/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/compare">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <ComparePage locale={locale} copy={COPY[locale]} />;
}
