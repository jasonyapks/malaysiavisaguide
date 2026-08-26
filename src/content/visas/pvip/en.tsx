import Link from "next/link";
import { Section } from "@/components/GuideLayout";
import { PVIP_GOVERNMENT_FEE_ATTRIBUTION } from "@/lib/data/programmes";
import { reviewDate } from "@/lib/format";
import type { GuideCopy } from "../types";

/** English PVIP guide copy — moved here verbatim from app/visas/pvip/page.tsx.
 *
 * One figure here deliberately departs from the Immigration guideline behind
 * the rest of the 2026 terms: the committee stage is published as **60 working
 * days**, where the guideline states 30. Jason corrected it to 60 on
 * 2026-08-26 as what MYPVIP actually sees. The stated service standard and the
 * observed one are not the same number, and a reader planning a move is served
 * by the one that happens. Do not "fix" it back to the document. */
export const copy: GuideCopy = {
  meta: {
    title: "Premium Visa Programme (PVIP): costs and requirements",
    description:
      "What PVIP actually costs, who qualifies, and how it compares to MM2H. RM200,000 participation fee, RM1 million fixed deposit, RM40,000 monthly income offshore or onshore, 20-year residence.",
  },

  title: "Premium Visa Programme (PVIP)",

  answer:
    "PVIP grants residence in Malaysia for 20 years. You need income of RM40,000 a month — offshore, or Malaysian-sourced with proof of Malaysian income tax paid on it — a RM1 million fixed deposit with a Malaysian bank, and a participation fee of RM200,000 for the principal. A dependant pays RM100,000 for the same 20 years, or RM50,000 for 10 years. The participation fee is not the only government charge: a pass fee of RM2,000 per person per year of the approved term, a multiple-entry visa fee and a security bond follow it, the last two set by nationality. There is no age limit and no minimum stay.",

  suits: {
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
      "You cannot leave RM1 million on deposit indefinitely — and what you can take back out of it is restricted to medical, education and property costs",
      "You want to apply directly — PVIP requires an Immigration-authorised agent",
      "You are looking for a route to permanent residence or citizenship — PVIP is explicitly not one",
    ],
  },

  faq: [
    {
      q: "How much does PVIP actually cost in the first year?",
      a: "RM200,000 for the principal, whose term is fixed at 20 years. Each dependant chooses their own term: RM100,000 for 20 years, or RM50,000 for 10 years. That is a fee, not a deposit — it is not returned. It is also not paid in one go: RM2,000 goes in with the application and the remaining RM198,000 falls due only on approval. That is the largest of four government fees, not the only one: a pass fee of RM2,000 per person per year of the approved term, a multiple-entry visa fee and a security bond follow it, the last two set by your nationality. On a five-year initial approval the pass fee alone is RM10,000 a head. Separately, RM1,000,000 is placed on fixed deposit, which remains yours. Agent fees are additional and, unlike MM2H's, are not set by the government.",
    },
    {
      q: "What do I actually pay before I know whether I am approved?",
      a: "RM2,000. The participation fee is staged: RM2,000 is paid on submission and the balance of RM198,000 only once the application is approved. The RM2,000 is not refunded if you are rejected. Everything else — the RM1,000,000 deposit, the health insurance, the Malaysian medical check-up — comes after approval, not before it, so a rejection costs you the RM2,000 and whatever your agent charged, not the capital.",
    },
    {
      q: "How long does a PVIP application take?",
      a: "Up to 60 working days once it reaches Immigration. New applications go to an evaluation committee drawn from the Home Ministry, Immigration, the police and the companies commission, and the Director General of Immigration approves. The same 60 days applies to adding a dependant, hiring a domestic helper, changing the principal and renewing. Routine transactions — issuing the pass itself, a deposit withdrawal, moving the endorsement to a new passport, cancelling — are three working days. Before any of that, your agency has seven working days from receiving your complete documents to file them.",
    },
    {
      q: "What happens between approval and getting the visa?",
      a: "Approval arrives as a conditional approval letter, valid for six months. Inside that window you have to open the RM1,000,000 fixed deposit, buy health insurance and pass a medical check-up at a registered medical centre in Malaysia — the check-up has to be done inside the country. Only then is the pass printed. If you will not make it, the extension has to be applied for at least one month before the letter expires; miss that and the approval is revoked.",
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
      q: "Can I draw on the fixed deposit while I hold the visa?",
      a: "Up to half of it, and not freely. After six months in the programme you may apply to withdraw up to 50%, and only for medical costs, education costs or a property purchase. It works as a reimbursement: you spend first and submit the receipts, and for a property the sale and purchase agreement goes in with them. There is no general access to the money — the other RM500,000 stays pledged for as long as you hold the pass.",
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
      a: "No. The Immigration Department lists 'no age limits' as the first stated benefit of the programme, which makes PVIP the only long-stay route open to applicants under 25. The age limit that does exist applies to sponsored children, not to the principal — see below.",
    },
    {
      q: "What happens when my child turns 25?",
      a: "They come off your pass. A child — biological, step or adopted — can be sponsored as a dependant up to the age of 25, and on turning 25 must move to a pass of their own to stay in Malaysia: a student pass, an employment pass, or their own PVIP. The exception is a disabled child certified by a qualified medical practitioner, who has no age limit. If you are applying with teenagers, price the 10-year dependant term against the 20-year one with that date in mind.",
    },
    {
      q: "Does PVIP lead to permanent residence or citizenship?",
      a: "No, and the programme says so directly: participation carries no eligibility for an Entry Permit — Malaysia's permanent residence document — or for citizenship. PVIP is a 20-year pass that renews, not a staged route to a passport. Anyone selling it as one is selling something the programme does not contain.",
    },
    {
      q: "Is there a limit on how many people can hold PVIP?",
      a: "Yes, though it is not a limit anyone is close to. Active participants are capped at 1% of Malaysia's population, and that ceiling is shared with MM2H rather than being PVIP's own. It matters as a policy signal — the government has fixed a total headroom for long-stay foreign residents — rather than as something that would affect an application filed today.",
    },
  ],

  cta: {
    text: "Not sure whether PVIP or MM2H fits you?",
    label: "Run the eligibility checker",
    href: "/tools/eligibility/",
  },

  sections: (href) => (
    <>
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
            <strong>A RM1,000,000 fixed deposit</strong> opened with a bank
            licensed under the Financial Services Act 2013 or its Islamic
            equivalent. Up to half may be withdrawn after six months, but only
            against medical, education or property costs, and only as a
            reimbursement against receipts.
          </li>
          <li>
            <strong>Participation fees</strong> of RM200,000 for the principal,
            whose term is fixed at 20 years. A dependant chooses: RM100,000 for
            the same 20 years, or RM50,000 for 10 years. The principal&apos;s
            fee is staged — RM2,000 with the application, RM198,000 on approval.
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
        <p>
          Four conditions sit behind the money, and they apply to dependants as
          well as to the principal:
        </p>
        <ul>
          <li>
            <strong>A police clearance certificate</strong> from your country of
            citizenship or residence — a letter of good conduct, certificate of
            clearance, whatever your jurisdiction issues — translated into
            English if it is in another language.
          </li>
          <li>
            <strong>Security screening by the Royal Malaysia Police</strong> for
            everyone aged 18 and over, and no listing as a prohibited immigrant
            under section 8(3) of the Immigration Act.
          </li>
          <li>
            <strong>A clean bill of health.</strong> A medical report from a
            registered medical centre <em>inside Malaysia</em>, certifying you
            free of infectious disease. It is required before the pass is
            printed, not before you apply.
          </li>
          <li>
            <strong>Health insurance</strong> held for the whole life of the
            pass — local or international, but with worldwide cover.
          </li>
        </ul>
        <p>
          Nationality is the one hard exclusion: the programme is open to
          citizens of every country except Israel and those Malaysia has no
          diplomatic relations with.
        </p>
      </Section>

      <Section title="From application to pass">
        <p>
          The order of events matters more here than on most programmes, because
          the capital is committed late rather than early:
        </p>
        <ol>
          <li>
            <strong>Your agency files.</strong> It has seven working days from
            receiving your complete documents to submit them. RM2,000 of the
            participation fee is paid now, and is not refunded if the
            application fails.
          </li>
          <li>
            <strong>The committee decides — up to 60 working days.</strong> New
            applications go to an evaluation committee drawn from the Home
            Ministry, Immigration, the police and the companies commission, and
            the Director General of Immigration signs off.
          </li>
          <li>
            <strong>A conditional approval letter, valid six months.</strong>{" "}
            Inside that window: open the fixed deposit, buy the insurance, take
            the medical in Malaysia, pay the RM198,000 balance and the pass,
            visa and bond charges. If you need longer, the extension must be
            filed at least a month before the letter expires — miss it and the
            approval is revoked.
          </li>
          <li>
            <strong>The pass is issued — three working days.</strong> Same
            three-day handling for the routine transactions afterwards: a
            deposit withdrawal, moving the endorsement into a renewed passport,
            a change of nationality, cancelling the pass.
          </li>
        </ol>
        <p>
          Two later dates are worth putting in a calendar the day you are
          approved. A renewal at the end of the 20 years has to be filed six
          months before the pass expires, on whatever terms and fees are in
          force then rather than the ones you signed up to. And if the pass is
          cut short by your passport expiring — the usual reason a 20-year
          programme issues a five-year sticker — the application for the
          remaining balance goes in three months before the current pass ends.
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
          <Link href={href("/tools/cost-calculator/")}>cost calculator</Link>{" "}
          works all four out against your own nationality and family size, over
          a five-year initial approval.
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
            Accompaniment by spouse, children, parents, parents-in-law and one
            foreign domestic helper
          </li>
        </ul>
        <p>
          The family list is wider than most programmes&apos; and worth reading
          closely. A spouse; children — biological, step or adopted — up to the
          age of 25, with no age limit for a disabled child certified by a
          doctor; your parents <em>and</em> your parents-in-law; and one foreign
          domestic helper. Each dependant picks a 10-year or 20-year term
          independently of the others, which is what makes a shorter term worth
          costing for a child who will age out of the pass anyway.
        </p>
        <p>
          What the programme does not give is a route to settlement.
          Participation confers no eligibility for an Entry Permit or for
          Malaysian citizenship, and no amount of time held changes that.
        </p>
        <p>
          The work right used to be the clean line between PVIP and MM2H. It is
          not any more. <Link href={href("/visas/mm2h/")}>MM2H Platinum</Link>{" "}
          carries it too — MOTAC&apos;s December 2025 guide marks business,
          investment and career activity <em>Permissible</em> on that tier, and
          bars it outright on Silver and Gold. So if you intend to earn a living
          in Malaysia, the realistic routes are PVIP, MM2H Platinum and the{" "}
          <Link href={href("/visas/employment-pass/")}>Employment Pass</Link>,
          and the choice between the first two turns on capital rather than
          permission: PVIP pledges RM1,000,000 and compels no property purchase,
          while Platinum pledges USD 1,000,000 and compels a RM2,000,000
          residence you cannot sell for ten years. What PVIP still has to itself
          is the property question:{" "}
          <Link href={href("/insights/comparisons/mm2h-platinum-vs-pvip/")}>
            it never forces you to buy
          </Link>
          .
        </p>
      </Section>
    </>
  ),
};
