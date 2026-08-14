import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Ask a question about any of the programmes covered here, or flag a figure that needs correcting.",
  alternates: { canonical: "/contact/" },
};

export default function Page() {
  return (
    <article className="space-y-10">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">Contact</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          A question about any of the programmes, or a figure that looks out of
          date? Send it here. Replies come from the same person who researches
          and reviews these guides.
        </p>
      </header>

      <ContactForm />
    </article>
  );
}
