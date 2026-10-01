import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentListPage } from "@/content/agents/AgentListPage";
import { COPY } from "@/content/agents/locales";
import { PVIP_TERMINATED } from "@/lib/data/agent-status";
import { registerCount } from "@/lib/data/agents";
import { isPrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/agents/pvip">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const meta = COPY[locale].list.pvip.meta;
  return pageMetadata({
    canonicalPath: "/agents/pvip/",
    locale,
    title: meta.title,
    description: meta.description(
      registerCount("pvip"),
      PVIP_TERMINATED.ids.length,
    ),
  });
}

export default async function Page({
  params,
}: PageProps<"/[locale]/agents/pvip">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <AgentListPage programme="pvip" locale={locale} copy={COPY[locale]} />;
}
