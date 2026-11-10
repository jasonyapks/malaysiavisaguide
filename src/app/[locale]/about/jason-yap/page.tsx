import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorPage } from "@/content/author/AuthorPage";
import { copy as zhHans } from "@/content/author/zh-hans";
import { copy as zhHant } from "@/content/author/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { AuthorCopy } from "@/content/author/types";

const COPY: Record<PrefixedLocale, AuthorCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about/jason-yap">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/about/jason-yap/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({
  params,
}: PageProps<"/[locale]/about/jason-yap">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <AuthorPage locale={locale} copy={COPY[locale]} />;
}
