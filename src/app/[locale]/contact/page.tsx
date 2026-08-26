import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/content/contact/ContactPage";
import { copy as zhHans } from "@/content/contact/zh-hans";
import { copy as zhHant } from "@/content/contact/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { ContactCopy } from "@/content/contact/types";

const COPY: Record<PrefixedLocale, ContactCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/contact/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <ContactPage locale={locale} copy={COPY[locale]} />;
}
