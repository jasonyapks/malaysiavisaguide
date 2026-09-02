import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyPage } from "@/content/privacy/PrivacyPage";
import { copy as zhHans } from "@/content/privacy/zh-hans";
import { copy as zhHant } from "@/content/privacy/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { PrivacyCopy } from "@/content/privacy/types";

const COPY: Record<PrefixedLocale, PrivacyCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/privacy/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <PrivacyPage locale={locale} copy={COPY[locale]} />;
}
