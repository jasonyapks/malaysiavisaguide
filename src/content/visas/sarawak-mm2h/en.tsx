import Link from "next/link";
import { Section } from "@/components/GuideLayout";
import type { GuideCopy } from "../types";

/** English sarawak-mm2h guide copy — moved here verbatim from app/visas/sarawak-mm2h/page.tsx. */
export const copy: GuideCopy = {
  meta: {
    title: "Sarawak MM2H (S-MM2H): requirements and costs",
    description:
      "Sarawak runs its own MM2H with its own rules: RM500,000 fixed deposit, RM10,000 monthly income or RM100,000 in savings, 10 years, 30 days a year in Sarawak, and no compulsory property purchase.",
  },

  title: "Sarawak MM2H (S-MM2H)",

  answer:
    "Sarawak operates its own MM2H, separate from the federal programme. It needs a RM500,000 fixed deposit in a Sarawak bank and either RM10,000 a month in offshore income or RM100,000 in savings. The pass runs 10 years, requires 30 days a year in Sarawak, and — unlike federal MM2H — does not require you to buy property.",

  suits: {
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
          "You want to work full time — S-MM2H allows 20 hours a week at most, in four approved sectors",
        ],
  },

  faq: [
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
          a: "Up to 50% after one year in the programme, for buying a residential house, buying a car, medical costs, or children's education in Sarawak. The account must never fall below RM250,000, which is what caps the withdrawal at half.",
        },
        {
          q: "Do I have to buy property under S-MM2H?",
          a: "No. Purchase is optional. If you do buy, the floor is RM600,000 in Kuching Division and RM500,000 in other divisions, under the Land Code (Amendment)(No.2) Order 1998.",
        },
        {
          q: "Can I work on S-MM2H?",
          a: "Part time only, and only in an approved sector: education, banking and securities, manufacturing, or medical. Working hours are capped at 20 a week, and every application goes through MTCP to an approval committee under the State Secretary. You may also be a minority partner in a joint venture with a local partner, holding up to 49% of paid-up capital of at least RM250,000. Full-time employment is not permitted.",
        },
        {
          q: "Do I need a sponsor?",
          a: "Yes, and there is no way around it. Every applicant must be bonded by a sponsor who is from and currently living in Sarawak, or by an SMM2H licensed agent registered in Sarawak. The sponsor signs a security bond set by nationality — RM200 for Singaporeans, RM1,000 for Japan, South Korea, Hong Kong and Macau, RM1,500 for China, Australia and Europe, RM2,000 for the United States and Canada. Applications are filed through the state's MOAS system by that sponsor or agent; you cannot submit for yourself.",
        },
        {
          q: "How many days a year must I spend in Sarawak?",
          a: "30 cumulative days a year, and the requirement falls on the main applicant only.",
        },
      
  ],

  cta: {
        text: "Compare S-MM2H against the federal tiers, side by side.",
        label: "Open the comparison",
        href: "/compare/",
  },

  sections: (href) => (
    <>
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
          local bank in Sarawak, and RM250,000 of it must stay there for as
          long as you hold the pass. A one-off RM5,000 processing fee is
          payable to the state ministry; it is non-refundable, and nothing is
          processed until it is paid.
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
          The second catch is procedural. You cannot apply on your own: every
          application must be bonded by a Sarawak-resident sponsor or a
          Sarawak-licensed SMM2H agent, who signs a security bond for you and
          files through the state&rsquo;s MOAS system. Your medical has to be
          done in Sarawak and endorsed by a government doctor — a report from
          home will be sent back to be redone before the pass is released.
        </p>
        <p>
          Where it genuinely wins is on flexibility of capital: no compulsory
          property purchase, a ringgit-denominated deposit, and half of that
          deposit accessible after a year. Compared against{" "}
          <Link href={href("/visas/mm2h/")}>federal MM2H Silver</Link>, which obliges you to
          buy a RM600,000 property on top of a USD 150,000 deposit, the total
          commitment is far lower.
        </p>
      </Section>
    </>
  ),
};
