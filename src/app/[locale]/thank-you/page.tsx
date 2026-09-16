import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThankYouPage } from "@/content/thank-you/ThankYouPage";
import { copy as zhHans } from "@/content/thank-you/zh-hans";
import { copy as zhHant } from "@/content/thank-you/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { ThankYouCopy } from "@/content/thank-you/types";

const COPY: Record<PrefixedLocale, ThankYouCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/thank-you">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return {
    ...pageMetadata({
      canonicalPath: "/thank-you/",
      locale,
      title: copy.meta.title,
      description: copy.meta.description,
    }),
    // Same reasoning as the English page.
    robots: { index: false, follow: true },
  };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/thank-you">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <ThankYouPage locale={locale} copy={COPY[locale]} />;
}
