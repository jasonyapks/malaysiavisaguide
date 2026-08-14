import type { Metadata } from "next";
import { GuideLayout, Section } from "@/components/GuideLayout";
import { images } from "@/lib/images";
import {
  getProgramme,
  PVIP_GOVERNMENT_FEE_ATTRIBUTION,
} from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";

const p = getProgramme("pvip")!;

export const metadata: Metadata = {
  title: "Premium Visa Programme (PVIP): costs and requirements",
  description:
    "What PVIP actually costs, who qualifies, and how it compares to MM2H. RM200,000 participation fee, RM1 million fixed deposit, RM40,000 monthly income offshore or onshore, 20-year residence.",
  alternates: { canonical: "/visas/pvip/" },
};

export default function Page() {
  return (
    <GuideLayout
      locale="en"
      programme={p}
      hero={images.pvip}
      title="Premium Visa Programme (PVIP)"
      answer="PVIP grants residence in Malaysia for 20 years. You need income of RM40,000 a month — offshore, or Malaysian-sourced with proof of Malaysian income tax paid on it — a RM1 million fixed deposit with a Malaysian bank, and a participation fee of RM200,000 for the principal. A dependant pays RM100,000 for the same 20 years, or RM50,000 for 10 years. The participation fee is not the only government charge: a pass fee of RM2,000 per person per year of the approved term, a multiple-entry visa fee and a security bond follow it, the last two set by nationality. There is no age limit and no minimum stay."
      suits={{
        yes: [
          "You want to work or run a business in Malaysia without committing to property — PVIP and MM2H Platinum both permit it, but only Platinum forces a RM2 million purchase",
          "You spend little time in Malaysia and want no minimum-stay obligation",
          "You are under 25, and so ineligible for MM2H",
          "You want a single 20-year horizon without renewal cycles",
          "You would rather rent than buy — PVIP compels no property purchase at all, on any timescale",
        ],
        no: [
          "You are optimising for cost — MM2H Silver costs a fraction of this",
          "You cannot document RM40,000 a month — the source is flexible, the paper trail is not",
          "You cannot leave RM1 million on deposit indefinitely",
          "You want to apply directly — PVIP requires an Immigration-authorised agent",
        ],
      }}
      faq={[
        {
          q: "How much does PVIP actually cost in the first year?",
          a: "RM200,000 for the principal, whose term is fixed at 20 years. Each dependant chooses their own term: RM100,000 for 20 years, or RM50,000 for 10 years. That is a fee, not a deposit — it is not returned. That is the largest of four government fees, not the only one: a pass fee of RM2,000 per person per year of the approved term, a multiple-entry visa fee and a security bond follow it, the last two set by your nationality. On a five-year initial approval the pass fee alone is RM10,000 a head. Separately, RM1,000,000 is placed on fixed deposit, which remains yours and is half withdrawable after six months. Agent fees are additional and, unlike MM2H's, are not set by the government.",
        },
        {
          q: "What are the PVIP government fees?",
          a: "Four. The participation fee is one of them — RM200,000 for the principal, RM100,000 or RM50,000 per dependant — and it is the one everybody quotes. The other three are the pass fee at RM2,000 per person per year of the approved term, a multiple-entry visa fee, and a one-off security bond. The last two are set by your nationality rather than by the programme, so the cost calculator is the place to get your own figure. What is not a government fee is the agency fee: that one is commercial and unpublished.",
        },
        {
          q: "Why is my visa only five years when PVIP runs twenty?",
          a: "Because the initial approval is capped by your passport's remaining validity, not by the programme. That is why the pass fee is quoted per year: a five-year issuance is RM2,000 × 5 = RM10,000 per person, and the balance of the twenty years is charged the same way at each renewal.",
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
          a: "No. All applications must be made through an agency authorised by the Immigration Department of Malaysia. MM2H is no different on the current guidance: MOTAC's December 2025 guide routes every MM2H application through a licensed MM2H company too, so the agent requirement is not a PVIP peculiarity.",
        },
        {
          q: "Is there an age limit?",
          a: "No. The Immigration Department lists 'no age limits' as the first stated benefit of the programme, which makes PVIP the only long-stay route open to applicants under 25.",
        },
      ]}
      cta={{
        text: "Not sure whether PVIP or MM2H fits you?",
        label: "Run the eligibility checker",
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
            <strong>Income of RM40,000 a month</strong> — RM480,000 a year. Two
            things about this are more generous than most write-ups suggest.
            First, it does not have to be a salary: realised gains on
            investments, rental income and pension drawdown all count, which is
            what puts the threshold within reach of a retiree with no employer.
            Second, it does not have to be offshore. Malaysian-sourced income
            qualifies too, provided you can show proof of Malaysian income tax
            paid on it.
          </li>
          <li>
            <strong>A RM1,000,000 fixed deposit</strong> opened with a licensed
            bank in Malaysia. Up to half of it may be withdrawn after six months.
          </li>
          <li>
            <strong>Participation fees</strong> of RM200,000 for the principal,
            whose term is fixed at 20 years. A dependant chooses: RM100,000 for
            the same 20 years, or RM50,000 for 10 years.
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
            <strong>Money you do not get back:</strong> the government fees. The
            RM200,000 participation fee is the largest and the only one most
            write-ups mention, but the pass fee, visa fee and security bond are
            government charges too — see below.
          </li>
          <li>
            <strong>Money that stays yours:</strong> the RM1,000,000 fixed
            deposit. It sits in your account under lien, not in the
            government&apos;s.
          </li>
          <li>
            <strong>Agent fees:</strong> set by the agency, not by Immigration,
            and not published anywhere official. Ask for the figure in writing
            before you commit. This is the opposite of MM2H, where the agency
            fee is fixed by the government and there is nothing to negotiate.
          </li>
        </ul>
        <p>
          A single applicant is therefore looking at a little over RM210,000 in
          government fees genuinely spent, and RM1,000,000 committed but
          retained — before agent fees.
        </p>
      </Section>

      <Section title="The government fees">
        <p>
          The participation fee is a government fee, and it is not the only one.
          There are four, and a quote that shows you the first and stops has
          left money out:
        </p>
        <ul>
          <li>
            <strong>Participation fee</strong> — RM200,000 for the principal,
            RM100,000 or RM50,000 per dependant depending on the term they take.
          </li>
          <li>
            <strong>Pass fee</strong> — RM2,000 per person per year of the
            approved term, collected up front and again at each renewal. On a
            five-year approval that is RM10,000 a head, which makes it much the
            largest of the other three.
          </li>
          <li>
            <strong>Multiple-entry visa fee</strong> — per person per year, set
            by your nationality.
          </li>
          <li>
            <strong>Security bond</strong> — one-off, set by your nationality
            for the main applicant and a flat RM10 per dependant.
          </li>
        </ul>
        <p>
          The last two are priced by passport rather than by programme, so no
          single figure can be printed here. The{" "}
          <a href="/tools/cost-calculator/">cost calculator</a> works all four
          out against your own nationality and family size, over a five-year
          initial approval.
        </p>
        <p>
          Only the agency fee sits outside this list. That one is commercial,
          set by the agency rather than by Immigration, and published nowhere
          official — get it in writing.
        </p>
        <p>
          <em>
            Pass fee, visa fee and security bond stated by{" "}
            {PVIP_GOVERNMENT_FEE_ATTRIBUTION.by},{" "}
            {reviewDate(PVIP_GOVERNMENT_FEE_ATTRIBUTION.asAt)}. The Immigration
            Department&apos;s published PVIP FAQ states none of them, so they
            rest on attribution rather than on the source cited above.
          </em>
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
          The work right used to be the clean line between PVIP and MM2H. It is
          not any more.{" "}
          <a href="/visas/mm2h/">MM2H Platinum</a> carries it too — MOTAC&apos;s
          December 2025 guide marks business, investment and career activity{" "}
          <em>Permissible</em> on that tier, and bars it outright on Silver and
          Gold. So if you intend to earn a living in Malaysia, the realistic
          routes are PVIP, MM2H Platinum and the{" "}
          <a href="/visas/employment-pass/">Employment Pass</a>, and the choice
          between the first two turns on capital rather than permission: PVIP
          pledges RM1,000,000 and compels no property purchase, while Platinum
          pledges USD 1,000,000 and compels a RM2,000,000 residence you cannot
          sell for ten years. What PVIP still has to itself is the property
          question:{" "}
          <a href="/insights/comparisons/mm2h-platinum-vs-pvip/">
            it never forces you to buy
          </a>
          .
        </p>
      </Section>
    </GuideLayout>
  );
}
