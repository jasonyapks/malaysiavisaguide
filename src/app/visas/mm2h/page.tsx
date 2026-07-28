import type { Metadata } from "next";
import { GuideLayout, Section } from "@/components/GuideLayout";
import { images } from "@/lib/images";
import { TierTable } from "@/components/TierTable";
import { getProgramme } from "@/lib/data/programmes";

const silver = getProgramme("mm2h-silver")!;
const gold = getProgramme("mm2h-gold")!;
const platinum = getProgramme("mm2h-platinum")!;

export const metadata: Metadata = {
  title: "MM2H 2026: Silver, Gold and Platinum requirements",
  description:
    "The three MM2H tiers compared against the official MOTAC criteria — fixed deposit, property minimum, term, fees, minimum stay and the age rules that most guides get wrong.",
  alternates: { canonical: "/visas/mm2h/" },
};

export default function Page() {
  return (
    <GuideLayout
      programme={silver}
      hero={images.mm2h}
      title="Malaysia My Second Home (MM2H)"
      answer="MM2H comes in three tiers. Silver needs a USD 150,000 fixed deposit and a RM600,000 property; Gold needs USD 500,000 and RM1 million; Platinum needs USD 1 million and RM2 million. The minimum age is 25. Holders aged 25 to 49 must spend 90 days a year in Malaysia; from 50 there is no minimum stay."
      facts={
        <TierTable
          tiers={[silver, gold, platinum]}
          caption="The three tiers at a glance"
        />
      }
      suits={{
        yes: [
          "You are retiring or semi-retiring and want a long horizon at a moderate cost",
          "You are 50 or over — there is then no minimum stay requirement at all",
          "You intend to buy Malaysian property anyway, since it is compulsory",
          "You want the cheapest serious route: Silver's participation fee is RM1,000",
        ],
        no: [
          "You want to work in Malaysia and are not taking Platinum — business, investment and career activities are barred outright on Silver and Gold",
          "You do not want to own Malaysian property; purchase is compulsory on every tier",
          "You are under 25 and therefore ineligible",
          "Your capital is in ringgit — all three deposits are denominated in US dollars",
        ],
      }}
      faq={[
        {
          q: "What is the minimum age for MM2H in 2026?",
          a: "25 for the main applicant on Silver, Gold and Platinum, per MOTAC's own category table. Much secondary coverage says 30; that is not what the official document says. The SEZ/SFZ tiers go lower, at 21.",
        },
        {
          q: "How many days a year must I spend in Malaysia?",
          a: "90 days a year if you are aged 25 to 49 — and it can be met between the main applicant and/or spouse and dependants rather than by the principal alone. From age 50 there is no minimum stay requirement.",
        },
        {
          q: "Do I have to buy property?",
          a: "Yes. Every tier carries a compulsory residential purchase: RM600,000 on Silver, RM1,000,000 on Gold, RM2,000,000 on Platinum. This is the single biggest real cost of the programme and it is easy to miss when comparing deposit figures alone.",
        },
        {
          q: "Can I withdraw the fixed deposit?",
          a: "Up to 50% may be withdrawn after one year in the programme, for property purchase, medical costs, education or tourism.",
        },
        {
          q: "Do I need a licensed agent to apply for MM2H?",
          a: "On the current official guide, yes. MOTAC's Guide: Malaysia My Second Home (December 2025) says at general requirement 3 that an application \"should be submitted and completed through any MM2H tour operating business that has been licenced by the Ministry of Tourism, Arts & Culture under the Tourism Industry Act 1992\", and its application flowchart routes every step through a registered agent — there is no independent path drawn in it. Read that with the disclosure on this site in mind: the author runs a licensed agency, so check requirement 3 and the flowchart yourself rather than taking our word for it. Older MOTAC guidance did describe applying independently; if you are relying on that, ask the One Stop Centre directly before you commit.",
        },
        {
          q: "Why is Platinum's participation fee RM200,000 when Gold's is RM3,000?",
          a: "Because they are structured as different products rather than as a simple ladder. Silver charges RM1,000, Gold RM3,000, Platinum RM200,000. The processing fee is the same across all three: RM5,000 for the principal and RM2,500 per dependant.",
        },
        {
          q: "Is there tax on my foreign income?",
          a: "MOTAC states no tax on foreign funds or income, and none on the profit from fixed deposits held in Malaysia. Tax treatment can change and depends on your own residence position — take advice on your specific circumstances.",
        },
      ]}
      cta={{
        text: "Work out the full first-year cost of each tier.",
        label: "Open the cost calculator",
        href: "/tools/cost-calculator/",
      }}
    >
      <Section title="The costs that don't appear in the deposit figure">
        <p>
          MM2H is usually described by its fixed deposit, which is the least
          expensive part of it. The deposit stays yours. Three other numbers do
          not:
        </p>
        <ul>
          <li>
            <strong>The compulsory property purchase</strong> — RM600,000 to
            RM2,000,000 depending on tier. This is capital committed to an
            illiquid Malaysian asset, and it is a condition of the programme,
            not an option.
          </li>
          <li>
            <strong>The participation fee</strong> — RM1,000 on Silver, RM3,000
            on Gold, RM200,000 on Platinum.
          </li>
          <li>
            <strong>The processing fee</strong> — RM5,000 for the principal and
            RM2,500 for each dependant, the same across all three tiers.
          </li>
        </ul>
        <p>
          Renewal is charged separately: RM1,500 on Silver, RM3,000 on Gold and
          RM5,000 on Platinum.
        </p>
      </Section>

      <Section title="The age rule, which most guides get wrong">
        <p>
          MOTAC&apos;s category table sets the minimum age for the main
          applicant at <strong>25</strong>, not 30. The stay requirement is then
          banded by age:
        </p>
        <ul>
          <li>
            <strong>Ages 25–49:</strong> 90 days per year in Malaysia, and the
            days may be counted between the main applicant and/or spouse and
            dependants.
          </li>
          <li>
            <strong>Age 50 and over:</strong> no minimum stay requirement.
          </li>
        </ul>
        <p>
          For a retiree this makes MM2H effectively obligation-free on the stay
          side. For a working-age applicant it does not, and that is often the
          deciding factor between MM2H and{" "}
          <a href="/visas/pvip/">PVIP</a>, which exempts stay entirely.
        </p>
      </Section>

      <Section title="Dependants and family">
        <p>
          Children may be included up to age 35 provided they are single —
          unusually generous by international standards. Parents and
          parents-in-law are also allowed.
        </p>
      </Section>

      <Section title="The SEZ and SFZ tiers">
        <p>
          MOTAC also publishes two lower-cost tiers for the Special Economic
          Zone and Special Financial Zone: a USD 65,000 fixed deposit for
          applicants aged 21 to 49, and USD 32,000 for those aged 50 and over.
          Both run 10 years renewable, carry a RM1,000 participation fee, and
          require property purchase at the price set for the relevant SEZ
          development.
        </p>
        <p>
          These are materially cheaper than Silver and are the least-discussed
          part of the programme. They are tied to specific zones, so the right
          question is not whether you qualify but whether you want to live where
          they apply.
        </p>
      </Section>
    </GuideLayout>
  );
}
