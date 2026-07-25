import type { Metadata } from "next";
import Link from "next/link";
import { NewsFeed } from "./NewsFeed";

export const metadata: Metadata = {
  title: "Malaysia visa news",
  description:
    "Curated, source-cited updates on Malaysia's long-stay visa programmes — PVIP, MM2H, Sarawak MM2H, DE Rantau and the work and study passes. Every item links to its original source.",
  alternates: { canonical: "/news/" },
};

export default function Page() {
  return (
    <article className="space-y-10">
      <header className="space-y-6">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          Malaysia visa news
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          Updates that touch Malaysia&apos;s long-stay visa programmes, gathered
          from the press and official notices. Each item is a short summary that
          links out to its original source — hand-reviewed before it appears here.
        </p>
      </header>

      <NewsFeed />

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        News is a starting point, not advice. For what a rule actually means for
        your case, read the{" "}
        <Link href="/compare/" className="font-semibold underline">
          programme guides
        </Link>{" "}
        or{" "}
        <Link href="/tools/eligibility/" className="font-semibold underline">
          run the eligibility checker
        </Link>
        .
      </p>
    </article>
  );
}
