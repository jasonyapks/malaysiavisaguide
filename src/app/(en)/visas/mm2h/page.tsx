import type { Metadata } from "next";
import { GuideLayout, Section } from "@/components/GuideLayout";
import { images } from "@/lib/images";
import { TierTable } from "@/components/TierTable";
import {
  getProgramme,
  MM2H_AGENCY_FEE_ATTRIBUTION,
  MM2H_FD_WITHDRAWAL,
  MM2H_INCOME_PRACTICE,
} from "@/lib/data/programmes";
import { money, reviewDate } from "@/lib/format";

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
      locale="en"
      programme={silver}
      hero={images.mm2h}
      title="Malaysia My Second Home (MM2H)"
      answer="MM2H comes in three tiers. Silver needs a USD 150,000 fixed deposit and a RM600,000 property; Gold needs USD 500,000 and RM1 million; Platinum needs USD 1 million and RM2 million — but those property figures are national minimums, and the state you buy in sets its own floor for foreign buyers, RM2 million in Selangor and RM1 million in Kuala Lumpur. The agency fee is set by the government, not the agency: RM40,000 on Silver, RM55,000 on Gold, RM70,000 on Platinum. The minimum age is 25. Holders aged 25 to 49 must spend 90 days a year in Malaysia; from 50 there is no minimum stay."
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
          "You intend to buy Malaysian property anyway, since it is compulsory — and can clear the state's foreign-buyer floor, not just the programme's",
          "You want a family route: children up to 34 and both sets of parents may be included",
        ],
        no: [
          "You want to work in Malaysia and are not taking Platinum — business, investment and career activities are barred outright on Silver and Gold",
          "You do not want to own Malaysian property, or do not want to commit to buying within the first year; purchase is compulsory on every tier",
          "You were budgeting on Silver's RM1,000 participation fee — the government-set agency fee is RM40,000 on top of it",
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
          q: "Is RM600,000 really enough to buy on MM2H Silver?",
          a: `Only where the state lets you. ${silver.propertyStateFloorNote!} So a Silver applicant intending to live in Selangor is looking at a RM2,000,000 purchase, not a RM600,000 one — the programme minimum is a floor beneath a floor, and the state's is usually the higher of the two. Check the threshold for the specific state before you budget anything, because it is the number that will actually be applied to your purchase.`,
        },
        {
          q: "How much is the MM2H agent fee?",
          a: `It is not the agency's to set. The government fixes it at ${money({ amount: 40_000, currency: "MYR" })} on Silver and SEZ, ${money({ amount: 55_000, currency: "MYR" })} on Gold and ${money({ amount: 70_000, currency: "MYR" })} on Platinum, all inclusive of 8% SST. That fee covers the main applicant's processing fee, their first five years of pass fee and visa fee, and their security bond. From the second dependant onwards there is an additional ${money({ amount: 2_160, currency: "MYR" })} each, also inclusive of SST. Payment is 20% on submission and 80% after approval. A quote above these figures is not an expensive agent — it is a wrong one. Stated by ${MM2H_AGENCY_FEE_ATTRIBUTION.by}, ${reviewDate(MM2H_AGENCY_FEE_ATTRIBUTION.asAt)}; MOTAC's December 2025 guide does not publish the schedule.`,
        },
        {
          q: "What does each dependant cost on top?",
          a: "Five things, none of them inside the main applicant's agency fee: a RM2,500 processing fee one-off, a RM500 per-year pass fee, a visa fee per year set by their nationality, a RM10 security bond one-off, and — from the second dependant onwards — RM2,160 of additional agency fee. The participation fee does not repeat: it is charged per application, not per person.",
        },
        {
          q: "Can I withdraw the fixed deposit?",
          a: `${MM2H_FD_WITHDRAWAL} Note what that timing rules out: because the window opens on completion of the purchase, the deposit cannot be the source of your down payment. Budget the deposit and the property as two separate sums.`,
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
          q: "Does MM2H have an income requirement?",
          a: `${MM2H_INCOME_PRACTICE.note} Qualification itself is on capital — the fixed deposit and the property purchase — which is why MM2H stays open to applicants whose wealth is in assets rather than in monthly income. Stated by ${MM2H_INCOME_PRACTICE.attribution.by}, ${reviewDate(MM2H_INCOME_PRACTICE.attribution.asAt)}; MOTAC's guide publishes no income figure either way.`,
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
            <strong>The government-set agency fee</strong> — RM40,000 on Silver
            and SEZ, RM55,000 on Gold, RM70,000 on Platinum, all inclusive of 8%
            SST. On Silver this is by far the largest fee on the tier, forty
            times the participation fee, and it is the line most comparisons
            leave out entirely. See the section below.
          </li>
          <li>
            <strong>The compulsory property purchase</strong> — RM600,000 to
            RM2,000,000 depending on tier, and higher again where the state sets
            a higher floor for foreign buyers. This is capital committed to an
            illiquid Malaysian asset, and it is a condition of the programme,
            not an option.
          </li>
          <li>
            <strong>The participation fee</strong> — RM1,000 on Silver, RM3,000
            on Gold, RM200,000 on Platinum. Charged per application, not per
            person.
          </li>
          <li>
            <strong>The processing fee</strong> — RM5,000 for the principal and
            RM2,500 for each dependant, the same across all three tiers. The
            principal&apos;s is already inside the agency fee, so it should not
            appear twice on a quote.
          </li>
          <li>
            <strong>Per-dependant pass, visa and bond fees</strong> — RM500 per
            year of pass fee, a visa fee per year set by that dependant&apos;s
            nationality, and a RM10 security bond. The main applicant&apos;s
            first five years of all three are inside the agency fee.
          </li>
        </ul>
        <p>
          Renewal is charged separately: RM1,500 on Silver, RM3,000 on Gold and
          RM5,000 on Platinum.
        </p>
      </Section>

      <Section title="The agency fee is fixed by the government">
        <p>
          This is the most useful thing to know before you speak to anyone about
          MM2H, and it is the reverse of how the market is usually described.
          There is no shopping around on the agency fee, because it is not the
          agency&apos;s to set:
        </p>
        <ul>
          <li>
            <strong>Silver and SEZ</strong> — {money({ amount: 40_000, currency: "MYR" })}
          </li>
          <li>
            <strong>Gold</strong> — {money({ amount: 55_000, currency: "MYR" })}
          </li>
          <li>
            <strong>Platinum</strong> — {money({ amount: 70_000, currency: "MYR" })}
          </li>
        </ul>
        <p>
          All three are inclusive of 8% SST. Each covers the main
          applicant&apos;s processing fee, their first five years of pass fee and
          visa fee, and their security bond — so those four items should not
          appear again as separate lines on a quote. From the{" "}
          <em>second</em> dependant onwards there is an additional{" "}
          {money({ amount: 2_160, currency: "MYR" })} each, also inclusive of
          SST; the first dependant is already covered. Payment is 20% on
          submission and the remaining 80% after approval.
        </p>
        <p>
          A quote materially above these figures is not an expensive agent. It
          is a wrong one, and the right response is to ask which line item the
          difference belongs to.
        </p>
        <p>
          <em>
            Stated by {MM2H_AGENCY_FEE_ATTRIBUTION.by},{" "}
            {reviewDate(MM2H_AGENCY_FEE_ATTRIBUTION.asAt)}. MOTAC&apos;s
            December 2025 guide does not publish the fee schedule, so this rests
            on attribution rather than on the source cited above.
          </em>
        </p>
      </Section>

      <Section title="The property minimum is not the price you will pay">
        <p>{silver.propertyStateFloorNote}</p>
        <p>
          This catches Silver applicants hardest, because the gap is the widest:
          RM600,000 on the programme against RM2,000,000 in Selangor. It is not
          a technicality or a rule that gets waived — it is the threshold the
          state applies to any foreign buyer, MM2H or otherwise, and it governs
          whether the transaction can complete at all.
        </p>
        <p>
          The practical consequence is that the tier you qualify for and the
          property you can actually buy are two separate questions. Settle where
          you intend to live first, find that state&apos;s foreign-buyer
          threshold, and only then work out which tier makes sense — doing it the
          other way round is how people end up qualified for Silver and unable to
          buy anything.
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
          Children may be included up to age 34 provided they are single, which
          is to say up to but not including their thirty-fifth birthday. That is
          unusually generous by international standards, and MOTAC&rsquo;s own
          guide words it as &ldquo;up to age 35&rdquo;, a year wider than it is
          applied. Parents and parents-in-law are also allowed.
        </p>
      </Section>

      <Section title="The SEZ and SFZ tiers">
        <p>
          MOTAC also publishes two lower-cost tiers for the Special Economic
          Zone and Special Financial Zone: a USD 65,000 fixed deposit for
          applicants aged 21 to 49, and USD 32,000 for those aged 50 and over.
          Both run 10 years renewable, carry a RM1,000 participation fee, and
          require property purchase at the price set for the relevant SEZ
          development. The agency fee schedule prices them with Silver, at{" "}
          {money({ amount: 40_000, currency: "MYR" })}.
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
