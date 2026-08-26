import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EligibilityPage } from "@/content/eligibility/EligibilityPage";
import { copy as zhHans } from "@/content/eligibility/zh-hans";
import { copy as zhHant } from "@/content/eligibility/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { EligibilityCopy } from "@/content/eligibility/types";

const COPY: Record<PrefixedLocale, EligibilityCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tools/eligibility">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/tools/eligibility/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({
  params,
}: PageProps<"/[locale]/tools/eligibility">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <EligibilityPage locale={locale} copy={COPY[locale]} />;
}
