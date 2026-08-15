import Link from "next/link";
import type { AboutCopy } from "./types";

export const copy: AboutCopy = {
  meta: {
    title: "About this guide",
    description:
      "Who writes this, the credentials behind it, and the disclosed commercial relationship with MYPVIP and MY Premium MM2H.",
  },

  title: "About this guide",

  standfirst: (
    <>
      This is an independent reference on Malaysia&apos;s long-stay visas,
      written by someone who files these applications for a living. It is not a
      government site, and it is candid about its commercial relationships —
      both are explained below.
    </>
  ),

  portraitAlt: "Jason Yap, Managing Director of MYPVIP.",

  schemaDescription:
    "Managing Director of two licensed Malaysian long-stay visa agencies, with 500+ relocation cases handled.",

  who: {
    heading: "Who writes this",
    beside: (
      <p>
        <strong>Jason Yap</strong> is Managing Director of two licensed
        Malaysian agencies handling long-stay visa applications — one for the
        Premium Visa Programme, one for Malaysia My Second Home. Over 500
        relocation cases have passed across his desk. He researches, writes and
        reviews every page on this site, and his name and the date of review sit
        at the foot of each guide.
      </p>
    ),
    body: (
      <p>
        That experience is the reason this site exists. Most visa content online
        is either a government notice too terse to act on, or an agency landing
        page that quietly omits the parts that would put a client off. This
        guide tries to be the thing that was missing: the real numbers, the real
        timelines, and an honest read on who each programme actually suits.
      </p>
    ),
  },

  disclosure: {
    heading: "The commercial relationship — disclosed",
    body: (href) => (
      <>
        <p>
          Jason is Managing Director of{" "}
          <strong>
            <a href="https://mypvip.com" rel="nofollow noopener">
              MYPVIP
            </a>
          </strong>{" "}
          (MY PR Program Sdn Bhd), which handles Premium Visa Programme
          applications, and of <strong>MY Premium MM2H</strong> (My Premium
          (MM2H) Sdn Bhd), which handles Malaysia My Second Home applications.
          Both are licensed Malaysian agencies. If you decide you want an agent,
          those are businesses he runs, and you should read everything here with
          that in mind.
        </p>
        <p>
          Two things follow from that, and both are deliberate. First, this site
          earns nothing from you reading it — there are no ads and no affiliate
          links. It does count page views, through Google Analytics and
          Cloudflare, so Jason can see which guides actually get read; Google
          Analytics sets cookies to do that. Nothing is sold to anyone. Second,
          it covers the{" "}
          <Link href={href("/visas/sarawak-mm2h/")}>
            do-it-yourself routes
          </Link>{" "}
          and the cheaper programmes just as fully as the ones an agency is paid
          to file, because a reference that hides the inconvenient options is
          not a reference at all. The{" "}
          <Link href={href("/editorial-policy/")}>editorial policy</Link> sets
          out exactly how that independence is kept.
        </p>
      </>
    ),
  },

  government: {
    heading: "Not a government body",
    body: (
      <p>
        This site is not affiliated with the Immigration Department of Malaysia,
        MOTAC, MDEC, the Sarawak state government, EMGS, or any other public
        authority. Every figure it publishes is traced back to an official
        source, but the site itself is a private, independently-run guide. For a
        formal application you deal with the relevant authority or a licensed
        agent — this guide helps you walk in knowing what to expect.
      </p>
    ),
  },

  cta: {
    text: "Not sure which programme fits?",
    label: "Run the eligibility checker",
    tail: "— it reads the same verified data as every guide here, and it costs nothing.",
  },
};
