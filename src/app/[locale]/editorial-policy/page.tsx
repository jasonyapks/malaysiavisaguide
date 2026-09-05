import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialPolicyPage } from "@/content/editorial-policy/EditorialPolicyPage";
import { copy as zhHans } from "@/content/editorial-policy/zh-hans";
import { copy as zhHant } from "@/content/editorial-policy/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { EditorialPolicyCopy } from "@/content/editorial-policy/types";

const COPY: Record<PrefixedLocale, EditorialPolicyCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/editorial-policy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/editorial-policy/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({
  params,
}: PageProps<"/[locale]/editorial-policy">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <EditorialPolicyPage locale={locale} copy={COPY[locale]} />;
}
