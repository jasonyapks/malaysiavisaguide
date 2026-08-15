import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/content/about/AboutPage";
import { copy as zhHans } from "@/content/about/zh-hans";
import { copy as zhHant } from "@/content/about/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { AboutCopy } from "@/content/about/types";

const COPY: Record<PrefixedLocale, AboutCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/about/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <AboutPage locale={locale} copy={COPY[locale]} />;
}
