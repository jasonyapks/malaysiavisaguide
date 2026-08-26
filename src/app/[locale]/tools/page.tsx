import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolsPage } from "@/content/tools/ToolsPage";
import { copy as zhHans } from "@/content/tools/zh-hans";
import { copy as zhHant } from "@/content/tools/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { ToolsCopy } from "@/content/tools/types";

const COPY: Record<PrefixedLocale, ToolsCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tools">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/tools/",
    locale,
    title: copy.meta.title,
    description: copy.description,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/tools">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <ToolsPage locale={locale} copy={COPY[locale]} />;
}
