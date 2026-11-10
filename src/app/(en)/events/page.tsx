import type { Metadata } from "next";
import { EventsPage } from "@/content/events/EventsPage";
import { copy } from "@/content/events/en";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  canonicalPath: "/events/",
  locale: "en",
  title: copy.meta.title,
  description: copy.meta.description,
});

export default function Page() {
  return <EventsPage locale="en" copy={copy} />;
}
