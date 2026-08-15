import Link from "next/link";
import { Section } from "@/components/GuideLayout";
import type { GuideCopy } from "../types";

/** English de-rantau guide copy — moved here verbatim from app/visas/de-rantau/page.tsx. */
export const copy: GuideCopy = {
  meta: {
    title: "DE Rantau Nomad Pass: income requirements and costs",
    description:
      "Malaysia's digital nomad pass. USD 24,000 a year for tech professions, USD 60,000 for everyone else, 3 to 12 months renewable once, RM1,080 processing fee.",
  },

  title: "DE Rantau Nomad Pass",

  answer:
    "DE Rantau is Malaysia's digital nomad pass, issued by MDEC as a professional visit pass. Tech professionals need USD 24,000 a year in foreign-sourced income; non-tech professions need USD 60,000. It is issued for 3 to 12 months and renewable once, for a maximum stay of 24 months.",

  suits: {
        yes: [
          "You work remotely for a company registered outside Malaysia",
          "You want to try Malaysia before committing capital to a long-stay programme",
          "You are a tech professional — your threshold is USD 24,000, not USD 60,000",
          "You want a route costing hundreds of ringgit rather than hundreds of thousands",
        ],
        no: [
          "You want to stay beyond two years — the pass caps at 24 months total",
          "You work for a Malaysian company; the income must be foreign-sourced",
          "You want a path to permanent residence, which this is not",
          "You are in a non-tech profession earning under USD 60,000",
        ],
  },

  faq: [
        {
          q: "What income do I need for DE Rantau?",
          a: "USD 24,000 a year for tech talent and tech professions. For non-tech talent and professions the minimum annual income is USD 60,000 — a much less publicised figure, and the one that disqualifies most applicants who assume the USD 24,000 threshold applies to them.",
        },
        {
          q: "How long does the pass last?",
          a: "It is issued for a period between three and twelve months, with the option to renew for a further twelve months. The maximum total stay is 24 months.",
        },
        {
          q: "What does it cost?",
          a: "A non-refundable processing fee of RM1,080 for the main applicant and RM540 per dependant, both inclusive of 8% SST. An immigration pass fee is charged on top: RM90 for every three months, or RM360 for a year.",
        },
        {
          q: "Who is eligible?",
          a: "Digital freelancers, independent contractors and remote workers, in both tech and non-tech professions, of any nationality except Israel. Your work must be for foreign-based clients or a company not registered in Malaysia, performed remotely outside any physical office setting.",
        },
        {
          q: "Can I bring my family?",
          a: "Yes. Spouse and children may apply as dependants, and the main pass holder — but not a dependant — may also bring parents.",
        },
        {
          q: "What proof of income is required?",
          a: "Three months of payslips, three months of bank statements showing matching income deposits, and an employment contract or client contracts. Contracts should preferably have at least six months left to run, and the name and income details must be consistent across all documents.",
        },
        {
          q: "How long does renewal take?",
          a: "Six to eight weeks from receipt of a complete application. You may apply up to three months before your current pass expires, and early renewal is recommended to keep your stay continuous.",
        },
      
  ],

  cta: {
        text: "Thinking beyond two years?",
        label: "Compare the long-stay routes",
        href: "/compare/",
  },

  sections: (href) => (
    <>
      <Section title="The two income thresholds">
        <p>
          Almost every write-up of DE Rantau quotes USD 24,000. That figure is
          correct only for tech talent and tech professions. For everyone else
          the minimum annual income is <strong>USD 60,000</strong> — two and a
          half times higher.
        </p>
        <p>
          This is the single most common reason an otherwise sound application
          fails, and it is worth establishing which band you fall into before
          paying the non-refundable processing fee.
        </p>
      </Section>

      <Section title="What it costs">
        <ul>
          <li>
            <strong>RM1,080</strong> processing fee for the main applicant,
            including 8% SST. Non-refundable, including on rejection.
          </li>
          <li>
            <strong>RM540</strong> per dependant, on the same terms.
          </li>
          <li>
            <strong>RM360 a year</strong> immigration pass fee, or RM90 per
            three months.
          </li>
        </ul>
        <p>
          Set against the six-figure commitments of{" "}
          <Link href={href("/visas/pvip/")}>PVIP</Link> and{" "}
          <Link href={href("/visas/mm2h/")}>MM2H</Link>, DE Rantau costs almost nothing. What
          you are buying is correspondingly less: two years, no work rights in
          the Malaysian economy, and no route onward.
        </p>
      </Section>

      <Section title="What it is not">
        <p>
          DE Rantau is a professional visit pass. It does not lead anywhere: at
          24 months it ends, and there is no conversion path into MM2H, PVIP or
          permanent residence. Treat it as a well-priced way to test whether you
          want to live in Malaysia, not as the first rung of a ladder.
        </p>
        <p>
          If your intention is to work for a Malaysian employer, the{" "}
          <Link href={href("/visas/employment-pass/")}>Employment Pass</Link> is the correct
          route and DE Rantau explicitly is not.
        </p>
      </Section>
    </>
  ),
};
