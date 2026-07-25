import type { Metadata } from "next";
import { GuideLayout, Section } from "@/components/GuideLayout";
import { images } from "@/lib/images";
import { getProgramme } from "@/lib/data/programmes";

const p = getProgramme("employment-pass")!;

export const metadata: Metadata = {
  title: "Malaysia Employment Pass: the 2026 salary thresholds",
  description:
    "Employment Pass Categories I, II and III under the policy effective 1 June 2026 — RM20,000, RM10,000 and RM5,000 monthly salary floors, duration limits, and the new replacement plan requirement.",
  alternates: { canonical: "/visas/employment-pass/" },
};

export default function Page() {
  return (
    <GuideLayout
      programme={p}
      hero={images["employment-pass"]}
      title="Employment Pass"
      answer="The Employment Pass is Malaysia's route for working for a Malaysian employer. Under the policy effective 1 June 2026 there are three categories by monthly salary: Category I from RM20,000, Category II from RM10,000, and Category III from RM5,000. Your employer applies; you cannot apply yourself."
      suits={{
        yes: [
          "You have a job offer from a Malaysian company willing to sponsor you",
          "You earn RM10,000 a month or more — Category I and II run up to 10 years",
          "You want dependants with you and earn above RM5,000",
          "You want to work in Malaysia without committing capital",
        ],
        no: [
          "You have no Malaysian employer — the pass cannot exist without one",
          "You work remotely for a foreign company; DE Rantau is your route",
          "You want independence from an employer — the pass is tied to one company",
          "You need to be based in Sabah or Sarawak; the pass is valid in Peninsular Malaysia",
        ],
      }}
      faq={[
        {
          q: "What is the minimum salary for a Malaysia Employment Pass in 2026?",
          a: "Under the revised policy effective 1 June 2026: Category I is RM20,000 a month and above, Category II is RM10,000 to RM19,999, and Category III is RM5,000 to RM9,999. These thresholds were raised from the previous policy following Cabinet approval on 17 October 2025.",
        },
        {
          q: "How long is an Employment Pass valid?",
          a: "Category I runs up to 10 years. Category II also runs up to 10 years but requires a succession plan. Category III is capped at 5 years, likewise with a succession plan. Individual passes are issued for up to 60 months at a time, depending on the employment contract and at the discretion of the Expatriate Committee.",
        },
        {
          q: "What is the replacement plan requirement?",
          a: "New from 1 June 2026. Employers must set out a structured plan to prepare local employees to take over the expatriate's role within a defined period — identifying the positions to be transferred, the training and mentoring involved, and a realistic timeframe. It is monitored through documentation, periodic reporting and assessment.",
        },
        {
          q: "Can I bring my family on an Employment Pass?",
          a: "Only if you earn above RM5,000 a month. Dependent passes cover spouse, children under 18, legally adopted children under 18, and parents or parents-in-law.",
        },
        {
          q: "Can I apply for an Employment Pass myself?",
          a: "No. The pass is issued to expatriates approved by the Expatriate Committee or the relevant regulatory agency, on an application made by the employing company through the Expatriate Services Division. There is no self-sponsored version.",
        },
        {
          q: "Can I change employer on an Employment Pass?",
          a: "Not freely. You may only work for the company named on the pass. Moving employer means a new application by the new employer.",
        },
        {
          q: "Is the pass valid across all of Malaysia?",
          a: "The Immigration Department states the pass is valid in Peninsular Malaysia. Sabah and Sarawak run their own immigration systems and are handled separately.",
        },
      ]}
      cta={{
        text: "Working remotely instead?",
        label: "Read the DE Rantau guide",
        href: "/visas/de-rantau/",
      }}
    >
      <Section title="The three categories, effective 1 June 2026">
        <ul>
          <li>
            <strong>Category I — RM20,000 a month and above.</strong> Up to 10
            years. The government describes this band as covering strategic
            positions and critical expertise.
          </li>
          <li>
            <strong>Category II — RM10,000 to RM19,999.</strong> Up to 10 years,
            with a succession plan.
          </li>
          <li>
            <strong>Category III — RM5,000 to RM9,999.</strong> Up to 5 years,
            with a succession plan.
          </li>
        </ul>
        <p>
          A separate, lower threshold applies to the Manufacturing Related
          Services sector, on the basis that it has distinct technical
          requirements. The published FAQ confirms the exception exists but does
          not state the figure.
        </p>
      </Section>

      <Section title="What changed, and why it matters">
        <p>
          The 1 June 2026 policy did three things: it raised the salary
          thresholds, it capped how long an expatriate may be employed, and it
          made replacement planning a formal condition rather than an
          expectation.
        </p>
        <p>
          The stated rationale is reducing long-term reliance on foreign labour
          under the Thirteenth Malaysia Plan. The practical effect for an
          individual is that an Employment Pass is now explicitly a
          time-boxed arrangement with a documented plan to hand your role to a
          local colleague. If your intention is to settle in Malaysia
          permanently, that is worth knowing before you build a life around a
          pass designed to end.
        </p>
        <p>
          The long-stay programmes —{" "}
          <a href="/visas/pvip/">PVIP</a> in particular, which carries full work
          rights and a 20-year term — are the alternative for anyone who wants
          to work here without that ceiling.
        </p>
      </Section>
    </GuideLayout>
  );
}
