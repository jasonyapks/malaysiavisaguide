import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/content/home/HomePage";
import { copy as zhHans } from "@/content/home/zh-hans";
import { copy as zhHant } from "@/content/home/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { HomeCopy } from "@/content/home/types";

/**
 * The translated home pages — /zh-hans/ and /zh-hant/.
 *
 * The copy map is a plain object rather than a dynamic import: this is a static
 * export, so both pages are rendered at build time regardless and there is no
 * per-request bundle to keep small.
 */
const COPY: Record<PrefixedLocale, HomeCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return pageMetadata({ canonicalPath: "/", locale });
}

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <HomePage locale={locale} copy={COPY[locale]} />;
}
