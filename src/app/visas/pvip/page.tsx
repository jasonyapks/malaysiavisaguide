import type { Metadata } from "next";
import { GuideLayout, Section } from "@/components/GuideLayout";
import { getProgramme } from "@/lib/data/programmes";

const p = getProgramme("pvip")!;

export const metadata: Metadata = {
  title: "Premium Visa Programme (PVIP): costs and requirements",
  description:
    "What PVIP actually costs, who qualifies, and how it compares to MM2H. RM200,000 participation fee, RM1 million fixed deposit, RM40,000 monthly offshore income, 20-year residence.",
};

export default function Page() {
  return (
    <GuideLayout
      programme={p}
      title="Premium Visa Programme (PVIP)"
      answer="PVIP grants residence in Malaysia for up to 20 years. You need offshore income of RM40,000 a month, a RM1 million fixed deposit with a Malaysian bank, and a participation fee of RM200,000 for the principal plus RM100,000 per dependant. There is no age limit and no minimum stay."
      suits={{
        yes: [
          "You want to work or run a business in Malaysia — PVIP permits both, MM2H does not",
          "You spend little time in Malaysia and want no minimum-stay obligation",
          "You are under 25, and so ineligible for MM2H",
          "You want a single 20-year horizon without renewal cycles",
        ],
        no: [
          "You are optimising for cost — MM2H Silver costs a fraction of this",
          "Your income is Malaysian-sourced; the RM40,000 must be offshore",
          "You cannot leave RM1 million on deposit indefinitely",
          "You want to apply directly — PVIP requires an Immigration-authorised agent",
        ],
      }}
      faq={[
        {
          q: "How much does PVIP actually cost in the first year?",
          a: "The participation fee is RM200,000 for the principal and RM100,000 for each dependant. That is a fee, not a deposit — it is not returned. Separately, RM1,000,000 is placed on fixed deposit, which remains yours. Agent fees are additional and are not set by the government.",
        },
        {
          q: "Is the RM1 million fixed deposit refundable?",
          a: "The deposit remains your money, held with a licensed Malaysian bank under lien. It is not a payment to the government. The participation fee is the part you do not get back.",
        },
        {
          q: "Do I have to live in Malaysia to keep PVIP?",
          a: "No. The Immigration Department lists exemption from the minimum staying requirement as a benefit of the programme. This is one of the clearest differences from MM2H, where holders aged 25 to 49 must spend 90 days a year in the country.",
        },
        {
          q: "Can I work on a PVIP?",
          a: "Yes. Participants may work and carry out legal business activities, study, and purchase residential, commercial or industrial property. Active investment in permitted fields is also allowed.",
        },
        {
          q: "Can I apply for PVIP myself?",
          a: "No. All applications must be made through an agency authorised by the Immigration Department of Malaysia. This differs from MM2H, where MOTAC's own guidance says an applicant who started independently may continue without an agent.",
        },
        {
          q: "Is there an age limit?",
          a: "No. The Immigration Department lists 'no age limits' as the first stated benefit of the programme, which makes PVIP the only long-stay route open to applicants under 25.",
        },
      ]}
      cta={{
        text: "Not sure whether PVIP or MM2H fits you? Run the eligibility checker →",
        href: "/tools/eligibility/",
      }}
    >
      <Section title="Who qualifies">
        <p>
          PVIP has four requirements, and the income one is where most
          applications fail:
        </p>
        <ul>
          <li>
            <strong>Offshore income of RM40,000 a month</strong> — RM480,000 a
            year. The word offshore matters: income earned in Malaysia does not
            count towards this threshold.
          </li>
          <li>
            <strong>A RM1,000,000 fixed deposit</strong> opened with a licensed
            bank in Malaysia.
          </li>
          <li>
            <strong>Participation fees</strong> of RM200,000 for the principal
            and RM100,000 for each dependant.
          </li>
          <li>
            <strong>An authorised agency</strong> — applications cannot be made
            directly to Immigration.
          </li>
        </ul>
        <p>
          There is no age limit, which makes PVIP the only long-stay programme
          available to applicants under 25.
        </p>
      </Section>

      <Section title="What it costs, separated honestly">
        <p>
          Three different kinds of money get bundled together in most write-ups
          of this programme. They are not the same thing:
        </p>
        <ul>
          <li>
            <strong>Money you do not get back:</strong> the RM200,000
            participation fee, plus RM100,000 per dependant.
          </li>
          <li>
            <strong>Money that stays yours:</strong> the RM1,000,000 fixed
            deposit. It sits in your account under lien, not in the
            government&apos;s.
          </li>
          <li>
            <strong>Agent fees:</strong> set by the agency, not by Immigration,
            and not published anywhere official. Ask for the figure in writing
            before you commit.
          </li>
        </ul>
        <p>
          A single applicant is therefore looking at RM200,000 genuinely spent
          and RM1,000,000 committed but retained — before agent fees.
        </p>
      </Section>

      <Section title="What the visa lets you do">
        <p>
          PVIP is unusually permissive compared with the MM2H family. The
          Immigration Department lists the following:
        </p>
        <ul>
          <li>Up to 20 years, with multiple-entry visa facilities</li>
          <li>No minimum stay requirement</li>
          <li>Permission to work and carry out legal business activities</li>
          <li>Permission to study</li>
          <li>
            Permission to buy residential, commercial or industrial property
          </li>
          <li>Active investment in permitted fields</li>
          <li>
            Accompaniment by spouse, children, parents and foreign domestic
            helpers
          </li>
        </ul>
        <p>
          The work right is the substantive difference from MM2H. If you intend
          to earn a living in Malaysia rather than merely live in it, PVIP and
          the <a href="/visas/employment-pass/">Employment Pass</a> are the two
          realistic routes.
        </p>
      </Section>
    </GuideLayout>
  );
}
