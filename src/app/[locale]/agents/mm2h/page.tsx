import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentListPage } from "@/content/agents/AgentListPage";
import { COPY } from "@/content/agents/locales";
import { registerCount } from "@/lib/data/agents";
import { isPrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/agents/mm2h">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const meta = COPY[locale].list.mm2h.meta;
  return pageMetadata({
    canonicalPath: "/agents/mm2h/",
    locale,
    title: meta.title,
    description: meta.description(registerCount("mm2h")),
  });
}

export default async function Page({
  params,
}: PageProps<"/[locale]/agents/mm2h">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <AgentListPage programme="mm2h" locale={locale} copy={COPY[locale]} />;
}
