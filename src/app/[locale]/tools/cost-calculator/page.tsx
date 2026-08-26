import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalculatorPage } from "@/content/calculator/CalculatorPage";
import { copy as zhHans } from "@/content/calculator/zh-hans";
import { copy as zhHant } from "@/content/calculator/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { CalculatorCopy } from "@/content/calculator/types";

const COPY: Record<PrefixedLocale, CalculatorCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tools/cost-calculator">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/tools/cost-calculator/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({
  params,
}: PageProps<"/[locale]/tools/cost-calculator">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <CalculatorPage locale={locale} copy={COPY[locale]} />;
}
