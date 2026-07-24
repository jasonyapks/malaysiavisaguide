import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About this guide",
  description:
    "Who writes this, the credentials behind it, and the disclosed commercial relationship with MYPVIP and MY Premium MM2H.",
  alternates: { canonical: "/about/" },
};

// Person + Organization relationship, made explicit for search and AI crawlers.
// SPEC.md §1 — the editorial authority (E-E-A-T) is Jason, and the commercial
// relationship is disclosed rather than hidden.
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jason Yap",
  jobTitle: "Chairman, PVIP Agent Association",
  worksFor: [
    { "@type": "Organization", name: "MYPVIP (MY PR Program Sdn Bhd)" },
    { "@type": "Organization", name: "MY Premium MM2H (My Premium (MM2H) Sdn Bhd)" },
  ],
  description:
    "Chairman of the PVIP Agent Association and Managing Director of two licensed Malaysian long-stay visa agencies, with 1,000+ relocation cases handled.",
};

export default function Page() {
  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-4xl font-semibold sm:text-[2.75rem]">
          About this guide
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-[1.25rem] leading-relaxed text-forest-900">
          This is an independent reference on Malaysia&apos;s long-stay visas,
          written by someone who files these applications for a living. It is
          not a government site, and it is candid about its commercial
          relationships — both are explained below.
        </p>
      </header>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Who writes this
        </h2>
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-full bg-forest-700 font-serif text-xl text-sand-50"
          >
            JY
          </span>
          <p>
            <strong>Jason Yap</strong> is Chairman of the{" "}
            <strong>PVIP Agent Association</strong>, the industry body for
            Malaysia&apos;s Premium Visa Programme agents, and Managing Director
            of two licensed agencies handling long-stay visa applications. Over
            1,000 relocation cases have passed across his desk. He researches,
            writes and reviews every page on this site, and his name and the
            date of review sit at the foot of each guide.
          </p>
        </div>
        <p>
          That experience is the reason this site exists. Most visa content
          online is either a government notice too terse to act on, or an agency
          landing page that quietly omits the parts that would put a client off.
          This guide tries to be the thing that was missing: the real numbers,
          the real timelines, and an honest read on who each programme actually
          suits.
        </p>
      </section>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          The commercial relationship — disclosed
        </h2>
        <p>
          Jason is Managing Director of <strong>MYPVIP</strong> (MY PR Program
          Sdn Bhd), which handles Premium Visa Programme applications, and of{" "}
          <strong>MY Premium MM2H</strong> (My Premium (MM2H) Sdn Bhd), which
          handles Malaysia My Second Home applications. Both are licensed
          Malaysian agencies. If you decide you want an agent, those are
          businesses he runs, and you should read everything here with that in
          mind.
        </p>
        <p>
          Two things follow from that, and both are deliberate. First, this site
          earns nothing from you reading it — there are no ads, no affiliate
          links, and no tracking pixels selling your attention on. Second, it
          covers the{" "}
          <Link href="/visas/sarawak-mm2h/">do-it-yourself routes</Link> and the
          cheaper programmes just as fully as the ones an agency is paid to
          file, because a reference that hides the inconvenient options is not a
          reference at all. The{" "}
          <Link href="/editorial-policy/">editorial policy</Link> sets out
          exactly how that independence is kept.
        </p>
        <p>
          The <strong>PVIP Agent Association</strong> chairmanship is an
          industry-body role — advocacy, policy and agent coordination — and not
          a revenue line. It is mentioned because it is the source of the
          expertise, not because it sells anything.
        </p>
      </section>

      <section className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Not a government body
        </h2>
        <p>
          This site is not affiliated with the Immigration Department of
          Malaysia, MOTAC, MDEC, the Sarawak state government, EMGS, or any other
          public authority. Every figure it publishes is traced back to an
          official source, but the site itself is a private, independently-run
          guide. For a formal application you deal with the relevant authority or
          a licensed agent — this guide helps you walk in knowing what to expect.
        </p>
      </section>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        Not sure which programme fits?{" "}
        <Link href="/tools/eligibility/" className="font-semibold underline">
          Run the eligibility checker
        </Link>{" "}
        — it reads the same verified data as every guide here, and it costs
        nothing.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </article>
  );
}
