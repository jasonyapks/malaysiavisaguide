import Link from "next/link";
import type { AuthorCopy } from "./types";

/**
 * The author page, in English.
 *
 * Everything here was confirmed by Jason on 10 November 2026 or is already
 * published on mypvip.com. Not yet confirmed, and so not on the page: his
 * degree, the MM2HCA council role, start dates for each role, and any media or
 * speaking list. Do not add those from memory.
 */
export const copy: AuthorCopy = {
  meta: {
    title: "Jason Yap: author of Malaysia Visa Guide",
    description:
      "Jason Yap writes and reviews every page of Malaysia Visa Guide. He is President of MPVIPCA and Managing Director of MYPVIP and MY Premium MM2H.",
  },

  qualifier: "President, MPVIPCA · Managing Director, MYPVIP",
  portraitAlt: "Jason Yap, Managing Director of MYPVIP.",

  schemaDescription:
    "President of MPVIPCA and Managing Director of two licensed Malaysian long-stay visa agencies, with 300+ successful PVIP and MM2H applications since 2022.",

  bio: (
    <>
      <p>
        Jason Yap files Malaysian long-stay visa applications for a living. He
        is Managing Director of <strong>MYPVIP</strong> (MY PR Program Sdn Bhd),
        a licensed agency for the Premium Visa Programme, and of{" "}
        <strong>MY Premium MM2H</strong> (My Premium (MM2H) Sdn Bhd), a licensed
        agency for Malaysia My Second Home. Since 2022 the two agencies have
        handled more than 300 successful PVIP and MM2H applications.
      </p>
      <p>
        He is also President of <strong>MPVIPCA</strong> (Pertubuhan Perunding
        Program Visa Premium Malaysia), the registered association of Premium
        Visa Programme consultants.
      </p>
      <p>
        He researches, writes and reviews every page on this site. Where a
        figure comes from an official document, the page links to it. Where it
        comes from what his agencies see in practice, the page says so and
        dates it.
      </p>
    </>
  ),

  roles: {
    heading: "Roles",
    items: [
      {
        role: "Managing Director",
        where: (
          <>
            <a href="https://mypvip.com" rel="noopener">
              MYPVIP
            </a>{" "}
            (MY PR Program Sdn Bhd) — Premium Visa Programme applications
          </>
        ),
      },
      {
        role: "Managing Director",
        where: (
          <>
            MY Premium MM2H (My Premium (MM2H) Sdn Bhd) — Malaysia My Second
            Home applications
          </>
        ),
      },
      {
        role: "President",
        where: (
          <>
            MPVIPCA (Pertubuhan Perunding Program Visa Premium Malaysia) — the
            association of PVIP consultants
          </>
        ),
      },
    ],
  },

  work: {
    heading: "What he has written and reviewed here",
    intro:
      "Every page on this site carries his name and a review date. This list is generated from the site itself, so it is always complete.",
    guides: "Programme guides",
    insights: "Insights",
    news: (count) => (
      <>
        He also reviews every news report before it is published —{" "}
        <Link href="/news/">{count} so far</Link>.
      </>
    ),
  },

  conflicts: {
    heading: "Conflicts of interest",
    body: (
      <>
        <p>
          This site publishes the official lists of{" "}
          <Link href="/agents/">licensed MM2H agents and authorised PVIP
          agencies</Link>. The person who publishes them runs two agencies that
          appear on those lists, and leads the association that represents PVIP
          consultants. You should know that when you read them.
        </p>
        <p>
          What is done about it: every listing is copied from the official
          government register and links back to it, his own companies sit in
          alphabetical order like everyone else&apos;s, and a listing is not an
          endorsement. The{" "}
          <Link href="/editorial-policy/">editorial policy</Link> sets out the
          rest.
        </p>
      </>
    ),
  },

  contact: {
    heading: "Contact",
    body: (
      <>
        Questions, corrections and press enquiries go through the{" "}
        <Link href="/contact/">contact page</Link>. He reads them himself.
      </>
    ),
  },

  aboutLink: (
    <>
      For how the site is funded and how it relates to his agencies, see{" "}
      <Link href="/about/">About this guide</Link>.
    </>
  ),
};
