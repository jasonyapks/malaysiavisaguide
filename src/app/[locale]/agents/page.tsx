import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentsHub } from "@/content/agents/AgentsHub";
import { COPY } from "@/content/agents/locales";
import { isPrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/agents">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return pageMetadata({
    canonicalPath: "/agents/",
    locale,
    ...COPY[locale].hub.meta,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/agents">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <AgentsHub locale={locale} copy={COPY[locale]} />;
}
