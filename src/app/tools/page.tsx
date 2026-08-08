import type { Metadata } from "next";
import Link from "next/link";
import { GuideHead } from "@/components/GuideHead";
import { site } from "@/lib/site";

/**
 * /tools/ — the index above the eligibility quiz and the cost calculator.
 *
 * Built 2026-08-08 in response to Search Console, which had been crawling this
 * path since 14 July and getting a 404. Nothing linked to it: Google infers a
 * parent directory from /tools/eligibility/ and tries it, and so do readers who
 * truncate a URL in the address bar.
 *
 * It is written as a *decision* — which of the two answers your question, and
 * in what order to run them — rather than as a list of links. An index that
 * only restates its children's titles is the thin content the same report
 * flags next, and everything on it already appears in the header dropdown.
 */

const DESCRIPTION =
  "Two free tools for Malaysia's long-stay visas: a six-question eligibility check that tells you which programmes you qualify for, and an itemised cost calculator that separates the deposit you get back from the fees you don't.";

export const metadata: Metadata = {
  title: "Visa tools",
  description: DESCRIPTION,
  alternates: { canonical: "/tools/" },
  openGraph: {
    type: "website",
    title: `Visa tools — ${site.name}`,
    description: DESCRIPTION,
    url: "/tools/",
  },
};

const TOOLS = [
  {
    path: "/tools/eligibility/",
    title: "Eligibility checker",
    question: "Which ones am I allowed to apply for?",
    body: "Six questions at most — age, income, capital and what you plan to do here. It returns the programmes you qualify for, the ones you just miss and by how much, and it stores nothing.",
    minutes: "about 2 minutes",
  },
  {
    path: "/tools/cost-calculator/",
    title: "Cost calculator",
    question: "What will it actually cost me?",
    body: "An itemised total by programme and family size, built on the same official figures as the guides. Refundable fixed deposits are kept strictly apart from the fees you never see again — the distinction most quoted prices blur.",
    minutes: "about 1 minute",
  },
];

export default function Page() {
  return (
    <div className="space-y-12">
      <ListSchema />

      <header className="space-y-6">
        <p className="eyebrow">Tools</p>
        <h1 className="text-h1 font-semibold">
          Work out{" "}
          <span className="font-display accent-text font-medium italic">
            where you stand
          </span>
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {DESCRIPTION}
        </p>
      </header>

      <section className="space-y-6">
        <GuideHead
          eyebrow="Start here"
          title={
            <>
              Eligibility first,{" "}
              <span className="font-display accent-text font-medium italic">
                then cost
              </span>
            </>
          }
          sub="Run them in that order. Cost is the question everyone opens with, and it is the wrong one to open with: a total for MM2H Platinum means nothing if the liquid-asset threshold rules you out on the first question. Find out what is open to you, then price only those."
        />

        <ul className="grid gap-6 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <li key={t.path}>
              <Link
                href={t.path}
                className="card-outline group flex h-full flex-col p-6 transition-transform hover:-translate-y-1"
              >
                <p className="eyebrow">{t.minutes}</p>
                <p className="mt-3 font-serif text-h3 font-bold leading-snug text-forest-900">
                  {t.title}
                </p>
                <p className="font-display accent-text mt-2 text-lead font-medium italic">
                  {t.question}
                </p>
                <p className="mt-4 text-caption leading-relaxed text-ink-muted">
                  {t.body}
                </p>
                <p className="mt-6 font-bold text-forest-700">
                  Open <span aria-hidden>→</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        Neither tool asks for your name or email, and neither one stores an
        answer. If you would rather read the numbers side by side than answer
        questions, that is{" "}
        <Link href="/compare/" className="font-semibold underline">
          the comparison table
        </Link>
        . If you already know which programme you want, go straight to{" "}
        <Link href="/visas/pvip/" className="font-semibold underline">
          its guide
        </Link>
        .
      </p>
    </div>
  );
}

function ListSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Malaysia visa tools",
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}${t.path}`,
      name: t.title,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
