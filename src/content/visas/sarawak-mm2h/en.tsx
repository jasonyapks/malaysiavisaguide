import Link from "next/link";
import { DataTable } from "@/components/DataTable";
import { Section } from "@/components/GuideLayout";
import {
  getProgramme,
  SARAWAK_PROPERTY_PRACTICE_ATTRIBUTION,
  SMM2H_TERMS,
} from "@/lib/data/programmes";
import { money, moneyPer, reviewDate, years } from "@/lib/format";
import type { GuideCopy } from "../types";

// Every figure below is read from programmes.ts: the smm2h record for what a
// Programme field can hold, SMM2H_TERMS for what the MTCP guide publishes
// beyond it. Nothing here is typed in by hand.
const s = getProgramme("smm2h")!;
const silver = getProgramme("mm2h-silver")!;
const T = SMM2H_TERMS;

const fd = money(s.fixedDeposit!);
const income = moneyPer(s.incomeRequirement!);
const incomeDep = moneyPer(T.incomeWithDependant);
const savings = money(T.savings);
const savingsDep = money(T.savingsWithDependant);
const fdFloor = money(T.fdMinimumBalance);
const term = years(s.tenureYears);
const firstTerm = years(s.governmentExtras!.defaultTermYears!);
const processing = money({ amount: s.processingFee!.principal, currency: "MYR" });
const agentFee = s.governmentExtras!.agencyFee!;
const agentPrincipal = money({ amount: agentFee.principal, currency: agentFee.currency });
const agentDep = money({ amount: agentFee.perDependant, currency: agentFee.currency });
const kuching = money(T.propertyFloorKuching);
const otherDiv = money(T.propertyFloorOtherDivisions);
const jvCapital = money(T.jvMinPaidUpCapital);
const bonds = T.securityBonds.map((b) => b.bond.amount);
const bondLow = money({ amount: Math.min(...bonds), currency: "MYR" });
const bondHigh = money({ amount: Math.max(...bonds), currency: "MYR" });
const bond = (slug: (typeof T.securityBonds)[number]["slug"]) =>
  money(T.securityBonds.find((b) => b.slug === slug)!.bond);
const stay = s.minStayShort!; // "30 days in Sarawak"
const propAttr = `${SARAWAK_PROPERTY_PRACTICE_ATTRIBUTION.by}, ${reviewDate(SARAWAK_PROPERTY_PRACTICE_ATTRIBUTION.asAt)}`;

/** Bond nationality names — words, so they live here; amounts live in SMM2H_TERMS. */
const BOND_LABELS: Record<(typeof T.securityBonds)[number]["slug"], string> = {
  singapore: "Singapore",
  thailand: "Thailand",
  indonesia: "Indonesia",
  "jp-kr-hk-mo": "Japan, South Korea, Hong Kong and Macau",
  "cn-au-eu-tw-other": "China, Australia, Europe, Taiwan and any country not listed",
  "us-ca": "United States and Canada",
};

export const copy: GuideCopy = {
  meta: {
    title: "Sarawak MM2H (S-MM2H) 2026: requirements, costs and fees",
    description: `Sarawak runs its own MM2H with its own rules: ${fd} fixed deposit, ${money(s.incomeRequirement!)} monthly income or ${savings} in savings, ${term}, ${stay} a year, and no compulsory property purchase.`,
  },

  title: "Sarawak MM2H (S-MM2H)",

  answer: `Sarawak runs its own MM2H, separate from the federal programme. S-MM2H needs a ${fd} fixed deposit in a Sarawak bank plus either ${income} in pension or offshore income or ${savings} in savings. The pass runs ${term}, requires ${stay} a year, and does not require you to buy property.`,

  suits: {
    yes: [
      "You actually want to live in Sarawak — the stay requirement is time in Sarawak",
      "You do not want to be forced into a Malaysian property purchase",
      `Your capital is in ringgit; the deposit is ${fd}, not a US dollar sum`,
      `You want a ${s.tenureYears}-year term at a fraction of federal MM2H's total commitment`,
      "Your wealth is in savings rather than income — S-MM2H accepts either",
    ],
    no: [
      "You want to live in Kuala Lumpur or Penang — this is a Sarawak programme",
      `You are under ${s.minAge} and therefore ineligible`,
      `You cannot spend ${stay} a year`,
      `You want to work full time — S-MM2H allows ${T.partTimeHoursPerWeek} hours a week at most, in four approved sectors`,
      "You want to file the application yourself — a Sarawak sponsor or licensed agent has to do it",
    ],
  },

  faq: [
    {
      q: "What are the Sarawak MM2H requirements in 2026?",
      a: `The main applicant must be ${s.minAge} or over and a national of a country with diplomatic relations with Malaysia; Israel and North Korea are excluded. You place a ${fd} fixed deposit with a Sarawak bank, and you show either pension or offshore income of ${income} (${incomeDep} with a dependant) or savings of ${savings} (${savingsDep} with a dependant), over the latest ${T.evidenceMonths} months. A Sarawak-resident sponsor or a Sarawak-licensed agent must bond and file the application. Your passport needs ${T.passportMinValidityMonths} months' validity at submission, your letter of good conduct must be under ${T.goodConductMaxAgeMonths} months old, and the medical is done in Sarawak.`,
    },
    {
      q: "How is S-MM2H different from federal MM2H?",
      a: `Four ways that matter. The deposit is ${fd} rather than a US dollar sum. Property purchase is optional rather than compulsory. The minimum age is ${s.minAge} rather than ${silver.minAge}. And it is a Sarawak programme with a Sarawak stay requirement, administered by the state ministry rather than MOTAC.`,
    },
    {
      q: "What income do I need for S-MM2H?",
      a: `${income} for an individual, or ${incomeDep} where a dependant is included — evidenced by a pension letter and ${T.evidenceMonths} months of pension funds, or an employment confirmation. Alternatively you can qualify on savings: ${savings} for an individual or ${savingsDep} with a dependant, shown across ${T.evidenceMonths} months of bank statements.`,
    },
    {
      q: "How much does S-MM2H cost?",
      a: `The state charges a ${processing} processing fee, once, non-refundable, and payable before anything is processed. If a licensed agent files for you, the agent's fee is fixed by the government at ${agentPrincipal} for the main applicant and ${agentDep} for each dependant, both inclusive of 8% SST. Your sponsor signs a security bond of ${bondLow} to ${bondHigh}, set by your nationality. There is no participation fee. The ${fd} fixed deposit is not a cost — it stays yours — but it is capital you cannot use freely while you hold the pass.`,
    },
    {
      q: "How long is the pass?",
      a: `${term}, issued as ${s.governmentExtras!.defaultTermYears!}+${s.tenureYears - s.governmentExtras!.defaultTermYears!}. After ${term} you must apply afresh, as a new application filed ${T.freshApplicationMonthsBeforeExpiry} months before expiry, rather than renew again.`,
    },
    {
      q: "Can I withdraw the fixed deposit?",
      a: `Up to ${T.fdWithdrawalMaxPercent}% after ${years(T.fdWithdrawalAfterYears)} in the programme, for buying a residential house, buying a car, medical costs, or children's education in Sarawak. The account must never fall below ${fdFloor}, which is what caps the withdrawal at half.`,
    },
    {
      q: "Do I have to buy property under S-MM2H?",
      a: `No. Purchase is optional. If you do buy, the floor is ${kuching} in Kuching Division and ${otherDiv} in other divisions, under the Land Code (Amendment)(No.2) Order 1998.`,
    },
    {
      q: "Can I live in Kuala Lumpur on S-MM2H?",
      a: `You can visit, but it is the wrong programme if Kuala Lumpur is where you mean to live. The stay requirement is ${stay}, not in Malaysia, so months in Kuala Lumpur count for nothing towards it. Work rights, the fixed deposit's bank and the property floors are all Sarawak's as well. If the peninsula is the plan, federal MM2H is the programme built for it.`,
    },
    {
      q: "Can my family come with me on S-MM2H?",
      a: `Yes. Your spouse, your parents and your children aged ${T.childMaxAge} and under may be included, with no age limit for a child with a disability. Including a dependant raises the income test to ${incomeDep}, or the savings test to ${savingsDep}. Local medical insurance is required for every dependant regardless of age, and for the main applicant if under ${T.principalInsuranceBelowAge}. If an agent files for you, each dependant adds ${agentDep} to the agent's fee.`,
    },
    {
      q: "Can I work on S-MM2H?",
      a: `Part time only, and only in an approved sector: education, banking and securities, manufacturing, or medical. Working hours are capped at ${T.partTimeHoursPerWeek} a week, and every application goes through MTCP to an approval committee under the State Secretary. You may also be a minority partner in a joint venture with a local partner, holding up to ${T.jvMaxSharePercent}% of paid-up capital of at least ${jvCapital}. Full-time employment is not permitted.`,
    },
    {
      q: "Do I need a sponsor?",
      a: `Yes, and there is no way around it. Every applicant must be bonded by a sponsor who is from and currently living in Sarawak, or by an SMM2H licensed agent registered in Sarawak. The sponsor signs a security bond set by nationality, from ${bond("singapore")} for Singaporeans to ${bond("us-ca")} for the United States and Canada; the full schedule is in the fees section above. Applications are filed through the state's MOAS system by that sponsor or agent; you cannot submit for yourself.`,
    },
    {
      q: "How many days a year must I spend in Sarawak?",
      a: `${s.minStayPerYear} Days elsewhere in Malaysia do not count towards it.`,
    },
    {
      q: "Can I buy property in Sarawak in joint names with my Malaysian spouse?",
      a: `Not as a foreign purchaser. In practice Land & Survey Sarawak refuses to register a transfer into joint names with a Malaysian — spouse, child or anyone else — and it does so at registration, after the sale and purchase agreement has been signed and stamped. Register the title in your name alone. Stated by ${propAttr}; neither the Land Code nor the MTCP guide addresses it in those words.`,
    },
  ],

  cta: {
    text: "Compare S-MM2H against the federal tiers, side by side.",
    label: "Open the comparison",
    href: "/compare/",
  },

  sections: (href) => (
    <>
      <Section title="S-MM2H requirements: two routes to qualifying">
        <p>
          S-MM2H accepts either an income stream or a pot of savings, which is
          unusual and makes it reachable for people the federal programme turns
          away:
        </p>
        <ul>
          <li>
            <strong>Income:</strong> {income} as an individual, {incomeDep}{" "}
            with a dependant, from a pension or from offshore employment.
          </li>
          <li>
            <strong>Or savings:</strong> {savings} as an individual,{" "}
            {savingsDep} with a dependant, evidenced over {T.evidenceMonths}{" "}
            months of statements.
          </li>
        </ul>
        <p>
          On top of either, the {fd} fixed deposit must be placed with a local
          bank in Sarawak, and {fdFloor} of it must stay there for as long as
          you hold the pass. A one-off {processing} processing fee is payable to
          the state ministry; it is non-refundable, and nothing is processed
          until it is paid.
        </p>
        <p>
          The other gates are eligibility rather than money. The main applicant
          must be {s.minAge} or over. The programme is open to nationals of
          every country with diplomatic relations with Malaysia except Israel
          and North Korea. Your passport must have at least{" "}
          {T.passportMinValidityMonths} months of validity when the application
          is submitted, and your letter of good conduct must be less than{" "}
          {T.goodConductMaxAgeMonths} months old. Local medical insurance is
          compulsory for every dependant, and for the main applicant if under{" "}
          {T.principalInsuranceBelowAge}.
        </p>
        <p>
          Dependants are your spouse, your parents, and children aged{" "}
          {T.childMaxAge} and under, with no age limit for a child with a
          disability.
        </p>
      </Section>

      <Section title="S-MM2H fees and costs">
        <p>
          S-MM2H has fewer charges than federal MM2H and no participation fee at
          all. What is charged, by whom, and for whom:
        </p>
        <DataTable
          caption="S-MM2H government and state fees"
          idPrefix="smm2h-fee"
          head={["", "Main applicant", "Each dependant"]}
          rows={[
            {
              label: "Processing fee (MTCP)",
              cells: [
                { value: processing, note: 1 },
                { value: s.processingFee!.dependant === 0 ? "None" : money({ amount: s.processingFee!.dependant, currency: "MYR" }) },
              ],
            },
            {
              label: "Agent's fee, incl. 8% SST",
              cells: [{ value: agentPrincipal, note: 2 }, { value: agentDep }],
            },
            {
              label: "Security bond",
              cells: [{ value: `${bondLow}–${bondHigh}`, note: 3 }, { value: "Not published" }],
            },
            {
              label: "Participation fee",
              cells: [{ value: "None" }, { value: "None" }],
            },
            {
              label: `Extension at year ${s.governmentExtras!.defaultTermYears!}`,
              cells: [{ value: "None published", note: 4 }, { value: "None published" }],
            },
          ]}
          notes={[
            "One-off and non-refundable. Paid to the state ministry before the application is processed.",
            "Fixed by the government rather than by the agency, so a quote above it is wrong rather than expensive. Applies where a licensed SMM2H agent files the application. When it falls due is not published.",
            "Set by nationality and signed by the sponsor or agent. The full schedule is below.",
            `The pass is issued in two ${s.governmentExtras!.defaultTermYears!}-year terms. No fee is published for moving from the first to the second.`,
          ]}
        />
        <p>
          The security bond is the one figure that depends on who you are
          rather than on what you buy. The sponsor or agent signs it for you, at
          the rate for your nationality:
        </p>
        <ul>
          {T.securityBonds.map((b) => (
            <li key={b.slug}>
              <strong>{BOND_LABELS[b.slug]}</strong> — {money(b.bond)}
            </li>
          ))}
        </ul>
        <p>
          Two costs sit outside any schedule. The medical examination is done
          at a clinic in Sarawak and the local medical insurance is bought from
          an insurer; both are priced commercially and neither has a government
          figure. Budget too for at least one trip to Sarawak for the medical,
          because a report from your home country is not accepted.
        </p>
        <p>
          Then the capital. The {fd} fixed deposit is not a fee — it remains
          yours — but it is committed for as long as you hold
          the pass. After {years(T.fdWithdrawalAfterYears)} you may withdraw up
          to {T.fdWithdrawalMaxPercent}% of it for a house, a car, medical costs
          or children&apos;s education in Sarawak, and the balance must never
          fall below {fdFloor}. Property is optional, so unlike federal MM2H
          there is no second, larger sum to find before you can be approved.
        </p>
        <p>
          On a first-term budget, then, a single applicant filing through an
          agent is looking at {processing} plus {agentPrincipal} in charges,
          plus the bond, the medical and the insurance, with the deposit set
          aside alongside. Each dependant adds {agentDep} to the agent&apos;s
          fee and their own insurance. The{" "}
          <Link href={href("/tools/cost-calculator/")}>cost calculator</Link>{" "}
          works the same figures through for your household.
        </p>
      </Section>

      <Section title="How to apply for S-MM2H">
        <p>
          The application is a state process from start to finish, run by
          MTCP rather than by MOTAC or the Immigration Department&apos;s federal
          counter. What the application involves, from the MTCP guide — which
          does not put every step against a date, so read the order of the
          later stages as indicative:
        </p>
        <ol>
          <li>
            <strong>Find a sponsor or a licensed agent.</strong> Either a
            sponsor who is from and currently living in Sarawak, or an SMM2H
            agent licensed and registered in Sarawak. There is no self-service
            route, so this comes first.
          </li>
          <li>
            <strong>Assemble the documents.</strong> A passport with at least{" "}
            {T.passportMinValidityMonths} months to run, a letter of good
            conduct under {T.goodConductMaxAgeMonths} months old, and{" "}
            {T.evidenceMonths} months of evidence for whichever financial route
            you are using — pension letter and pension funds, employment
            confirmation, or bank statements for the savings route.
          </li>
          <li>
            <strong>Submission through MOAS.</strong> The sponsor or agent files
            the application on the state&apos;s MOAS system and signs the
            security bond for your nationality.
          </li>
          <li>
            <strong>Processing fee.</strong> The {processing} is paid to the
            ministry. Nothing moves until it is.
          </li>
          <li>
            <strong>Fixed deposit, medical and insurance.</strong> The {fd}{" "}
            deposit is placed with a Sarawak panel bank. The medical is done in
            Sarawak and endorsed by a government doctor, and local medical
            insurance is arranged for everyone it applies to.
          </li>
          <li>
            <strong>Pass issued.</strong> The first term runs {firstTerm}, and
            the pass is then extended for a second {firstTerm}.
          </li>
        </ol>
        <p>
          The medical is where applications most often lose time. A report
          from home is sent back to be redone before the pass is released, so
          the trip to Sarawak is not optional and is best planned early.
        </p>
        <p>
          On timelines, this guide gives no figure. The MTCP guide publishes no
          processing time, and a number quoted without one would be a guess.
          Ask the sponsor or agent what they are currently seeing, and treat any
          answer as an estimate rather than a commitment. The one date that is
          fixed comes at the end: after {term} the pass cannot be renewed again,
          and a fresh application has to be filed{" "}
          {T.freshApplicationMonthsBeforeExpiry} months before it expires.
        </p>
      </Section>

      <Section title="S-MM2H property rules: what a foreigner may buy in Sarawak">
        <p>
          Property is optional under S-MM2H. The fixed deposit is the
          qualifying route, and nobody has to buy anything to be approved. But
          many participants do buy, and the rules that apply come from
          Sarawak&apos;s own land law rather than from the programme. Sarawak
          administers the Sarawak Land Code, separate from the National Land
          Code used on the peninsula, so figures quoted for Kuala Lumpur, Penang
          or Johor have no application here.
        </p>
        <p>
          The floor is set per property, by division, under the Land Code
          (Amendment)(No.2) Order 1998, and the MTCP guide quotes the same
          figures:
        </p>
        <ul>
          <li>
            <strong>Kuching Division:</strong> {kuching}
          </li>
          <li>
            <strong>All other divisions:</strong> {otherDiv}
          </li>
        </ul>
        <p>
          The test is market value, so a purchase price declared below the
          floor does not bring a property within reach. Above it, a foreigner
          may buy high-rise residential property such as apartments and
          condominiums, landed residential property, and property inside a
          gazetted Special Development Area. Vacant land is generally off
          limits; the exceptions are narrow.
        </p>
        <p>
          Three points rest on practice rather than on the text of the Code or
          the guide. First, register the title in your name alone: a transfer
          into joint names with a Malaysian, including a spouse, is refused by
          Land &amp; Survey Sarawak at registration, after the agreement has
          already been signed and stamped. Second, no cap on the number of
          properties a foreigner may hold has been published; each purchase
          simply has to clear its own floor, and a second or third acquisition
          is worth confirming with Land &amp; Survey before you commit. Third,
          lower figures from a 2013 campaign gazette are still quoted on some
          law-firm and agent pages. They are not the prescribed amounts, and a
          page that quotes them is likely out of date elsewhere too.
        </p>
        <p>
          A claim that S-MM2H participants may only sell after five years also
          circulates. It is in neither the Land Code nor the MTCP guide, so
          this guide does not repeat it either way; check the position at the
          point of sale, and remember that real property gains tax applies
          separately on disposal.
        </p>
        <p>
          <em>
            The three practice points above are stated by {propAttr}. The floors
            and the categories of permitted property are in the Order and the
            MTCP guide.
          </em>
        </p>
      </Section>

      <Section title="The S-MM2H stay requirement: 30 days in Sarawak">
        <p>
          S-MM2H is a Sarawak programme, and its stay requirement reads:{" "}
          {s.minStayPerYear} Those are days <em>in Sarawak</em>. Time spent in Kuala Lumpur
          does not count towards it. If your reason for wanting Malaysian
          residence is the peninsula, this is the wrong programme however
          attractive its numbers look.
        </p>
        <p>
          The work rights point the same way. S-MM2H allows part-time work of up
          to {T.partTimeHoursPerWeek} hours a week in education, banking and
          securities, manufacturing or medical, each approved by a committee
          under the State Secretary, and a minority stake of up to{" "}
          {T.jvMaxSharePercent}% in a joint venture with at least {jvCapital}{" "}
          of paid-up capital. That is more than federal Silver or Gold allow,
          and all of it is in Sarawak.
        </p>
      </Section>

      <Section title="Sarawak MM2H vs federal MM2H">
        <p>
          These are two programmes run by two governments that share a name,
          and holding one tells you nothing about your position under the other.
          On the figures, Sarawak asks for far less: a {fd} deposit and no
          property, against{" "}
          <Link href={href("/visas/mm2h/")}>federal MM2H Silver</Link>&apos;s{" "}
          {money(silver.fixedDeposit!)} deposit and compulsory{" "}
          {money(silver.propertyPurchaseMin!)} property — before the state
          floor for foreign buyers, which in Kuala Lumpur and Selangor is higher
          again.
        </p>
        <p>
          It asks for more in other ways. Sarawak tests income or savings where
          federal MM2H publishes no income figure. Its minimum age is{" "}
          {s.minAge} against federal&apos;s {silver.minAge}. It needs a Sarawak
          sponsor, and its pass is {firstTerm} plus {firstTerm} followed by a
          fresh application.
        </p>
        <p>
          Geography decides first and cost second. If you want to live in
          Sarawak, the state programme is the cheaper and more flexible route.
          If you want the peninsula, it is not a cheaper version of the same
          thing. The full side-by-side is in{" "}
          <Link href={href("/insights/comparisons/federal-mm2h-vs-sarawak-mm2h/")}>
            federal MM2H vs Sarawak MM2H
          </Link>
          .
        </p>
      </Section>
    </>
  ),
};
