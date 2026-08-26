import type { Locale } from "@/lib/i18n";
import { ContactForm } from "./ContactForm";
import type { ContactCopy } from "./types";

export function ContactPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: ContactCopy;
}) {
  return (
    <article className="space-y-10">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">{copy.heading}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.lead}
        </p>
      </header>

      <ContactForm locale={locale} />
    </article>
  );
}
