import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventsPage } from "@/content/events/EventsPage";
import { copy as zhHans } from "@/content/events/zh-hans";
import { copy as zhHant } from "@/content/events/zh-hant";
import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { EventsCopy } from "@/content/events/types";

const COPY: Record<PrefixedLocale, EventsCopy> = {
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const copy = COPY[locale];
  return pageMetadata({
    canonicalPath: "/events/",
    locale,
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/events">) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <EventsPage locale={locale} copy={COPY[locale]} />;
}
