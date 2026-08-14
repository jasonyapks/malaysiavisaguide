import type { Metadata } from "next";
import Link from "next/link";
import { images } from "@/lib/images";
import { Figure } from "@/components/Figure";

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
  jobTitle: "Managing Director, MYPVIP",
  worksFor: [
    { "@type": "Organization", name: "MYPVIP (MY PR Program Sdn Bhd)" },
    { "@type": "Organization", name: "MY Premium MM2H (My Premium (MM2H) Sdn Bhd)" },
  ],
  description:
    "Managing Director of two licensed Malaysian long-stay visa agencies, with 500+ relocation cases handled.",
};

export default function Page() {
  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">
          About this guide
        </h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          This is an independent reference on Malaysia&apos;s long-stay visas,
          written by someone who files these applications for a living. It is
          not a government site, and it is candid about its commercial
          relationships — both are explained below.
        </p>
      </header>

      <section className="space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-h3 font-semibold text-ink">
          Who writes this
        </h2>
        <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-start">
          <Figure
            image={images.about}
            aspect="aspect-[4/5]"
            rounded="rounded-xl"
            sizes="200px"
            className="max-w-[200px]"
          />
          <p>
            <strong>Jason Yap</strong> is Managing Director of two licensed
            Malaysian agencies handling long-stay visa applications — one for
            the Premium Visa Programme, one for Malaysia My Second Home. Over
            500 relocation cases have passed across his desk. He researches,
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

      <section className="space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-h3 font-semibold text-ink">
          The commercial relationship — disclosed
        </h2>
        <p>
          Jason is Managing Director of{" "}
          <strong>
            <a href="https://mypvip.com" rel="nofollow noopener">
              MYPVIP
            </a>
          </strong>{" "}
          (MY PR Program
          Sdn Bhd), which handles Premium Visa Programme applications, and of{" "}
          <strong>MY Premium MM2H</strong> (My Premium (MM2H) Sdn Bhd), which
          handles Malaysia My Second Home applications. Both are licensed
          Malaysian agencies. If you decide you want an agent, those are
          businesses he runs, and you should read everything here with that in
          mind.
        </p>
        <p>
          Two things follow from that, and both are deliberate. First, this site
          earns nothing from you reading it — there are no ads and no affiliate
          links. It does count page views, through Google Analytics and
          Cloudflare, so Jason can see which guides actually get read; Google
          Analytics sets cookies to do that. Nothing is sold to anyone. Second,
          it covers the{" "}
          <Link href="/visas/sarawak-mm2h/">do-it-yourself routes</Link> and the
          cheaper programmes just as fully as the ones an agency is paid to
          file, because a reference that hides the inconvenient options is not a
          reference at all. The{" "}
          <Link href="/editorial-policy/">editorial policy</Link> sets out
          exactly how that independence is kept.
        </p>
      </section>

      <section className="space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink">
        <h2 className="font-serif text-h3 font-semibold text-ink">
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
