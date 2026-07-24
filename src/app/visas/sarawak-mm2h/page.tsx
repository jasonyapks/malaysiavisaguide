import type { Metadata } from "next";
import { GuideLayout, Section } from "@/components/GuideLayout";
import { getProgramme } from "@/lib/data/programmes";

const p = getProgramme("smm2h")!;

export const metadata: Metadata = {
  title: "Sarawak MM2H (S-MM2H): requirements and costs",
  description:
    "Sarawak runs its own MM2H with its own rules: RM500,000 fixed deposit, RM10,000 monthly income or RM100,000 in savings, 10 years, 30 days a year in Sarawak, and no compulsory property purchase.",
};

export default function Page() {
  return (
    <GuideLayout
      programme={p}
      title="Sarawak MM2H (S-MM2H)"
      answer="Sarawak operates its own MM2H, separate from the federal programme. It needs a RM500,000 fixed deposit in a Sarawak bank and either RM10,000 a month in offshore income or RM100,000 in savings. The pass runs 10 years, requires 30 days a year in Sarawak, and — unlike federal MM2H — does not require you to buy property."
      suits={{
        yes: [
          "You actually want to live in Sarawak — the stay requirement is time in Sarawak",
          "You do not want to be forced into a Malaysian property purchase",
          "Your capital is in ringgit; the deposit is RM500,000, not a US dollar sum",
          "You want a 10-year term at a fraction of federal MM2H's total commitment",
        ],
        no: [
          "You want to live in Kuala Lumpur or Penang — this is a Sarawak programme",
          "You are under 30 and therefore ineligible",
          "You cannot spend 30 days a year in Sarawak",
          "You want work rights, which this does not carry",
        ],
      }}
      faq={[
        {
          q: "How is S-MM2H different from federal MM2H?",
          a: "Four ways that matter. The deposit is RM500,000 rather than a US dollar sum. Property purchase is optional rather than compulsory. The minimum age is 30 rather than 25. And it is a Sarawak programme with a Sarawak stay requirement, administered by the state ministry rather than MOTAC.",
        },
        {
          q: "What income do I need for S-MM2H?",
          a: "RM10,000 a month for an individual, or RM15,000 a month where a dependant is included — evidenced by a pension letter and three months of pension funds, or an employment confirmation. Alternatively you can qualify on savings: RM100,000 for an individual or RM200,000 with a dependant, shown across three months of bank statements.",
        },
        {
          q: "How long is the pass?",
          a: "Ten years, issued as 5+5 and renewable on expiry. After ten years you must apply afresh as a new application rather than renew again.",
        },
        {
          q: "Can I withdraw the fixed deposit?",
          a: "Up to 50% after one year in the programme, for buying a residential house, buying a car, medical costs, or children's education in Sarawak.",
        },
        {
          q: "Do I have to buy property under S-MM2H?",
          a: "No. Purchase is optional. If you do buy, the floor is RM600,000 in Kuching Division and RM500,000 in other divisions, and you may sell after five years.",
        },
        {
          q: "How many days a year must I spend in Sarawak?",
          a: "30 cumulative days a year, and the requirement falls on the main applicant only.",
        },
      ]}
      cta={{
        text: "Compare S-MM2H against the federal tiers side by side →",
        href: "/compare/",
      }}
    >
      <Section title="Two routes to qualifying">
        <p>
          S-MM2H accepts either an income stream or a pot of savings, which is
          unusual and makes it reachable for people the federal programme turns
          away:
        </p>
        <ul>
          <li>
            <strong>Income:</strong> RM10,000 a month as an individual,
            RM15,000 a month with a dependant.
          </li>
          <li>
            <strong>Or savings:</strong> RM100,000 as an individual, RM200,000
            with a dependant, evidenced over three months of statements.
          </li>
        </ul>
        <p>
          On top of either, the RM500,000 fixed deposit must be placed with a
          local bank in Sarawak. A one-off RM5,000 processing fee is payable to
          the state ministry, covering the first five years of the pass.
        </p>
      </Section>

      <Section title="The catch worth understanding">
        <p>
          S-MM2H is a Sarawak programme. The 30-day requirement is 30 days{" "}
          <em>in Sarawak</em> — time spent in Kuala Lumpur does not count
          towards it. If your reason for wanting Malaysian residence is the
          peninsula, this is the wrong programme however attractive its numbers
          look.
        </p>
        <p>
          Where it genuinely wins is on flexibility of capital: no compulsory
          property purchase, a ringgit-denominated deposit, and half of that
          deposit accessible after a year. Compared against{" "}
          <a href="/visas/mm2h/">federal MM2H Silver</a>, which obliges you to
          buy a RM600,000 property on top of a USD 150,000 deposit, the total
          commitment is far lower.
        </p>
      </Section>
    </GuideLayout>
  );
}
