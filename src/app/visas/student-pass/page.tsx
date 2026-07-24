import type { Metadata } from "next";
import { GuideLayout, Section } from "@/components/GuideLayout";
import { getProgramme } from "@/lib/data/programmes";

const p = getProgramme("student-pass")!;

export const metadata: Metadata = {
  title: "Malaysia Student Pass: EMGS, fees and work rights",
  description:
    "How the Malaysian Student Pass works — EMGS screening, the RM60 pass fee, the 20-hour work limit, and which students may bring dependants.",
  alternates: { canonical: "/visas/student-pass/" },
};

export default function Page() {
  return (
    <GuideLayout
      programme={p}
      title="Student Pass"
      answer="A Student Pass covers non-citizens studying in Malaysia, from pre-school at age three through to postgraduate study. For higher education, EMGS screens the application and your institution submits it. The pass fee is RM60. Holders may work 20 hours a week in approved settings, and Master's and PhD students may bring dependants."
      suits={{
        yes: [
          "You have an offer from a Malaysian institution, which must sponsor you",
          "You are studying for a Master's or PhD and want your family with you",
          "You want a low-cost, legitimate basis to live in Malaysia while studying",
        ],
        no: [
          "You want to work full time — the limit is 20 hours a week",
          "You are enrolling at a language or training centre; those are excluded from work rights",
          "You want a route to long-term residence, which this is not",
          "You want to bring dependants as an undergraduate — that is limited to postgraduates",
        ],
      }}
      faq={[
        {
          q: "Who can apply for a Malaysian Student Pass?",
          a: "Non-citizen students aged three and above, covering pre-school through to higher education. For higher education, EMGS conducts the screening and applications are submitted through the STARS system or the EMGS portal. At school level, a school representative, parent or legal guardian may apply.",
        },
        {
          q: "How much does a Student Pass cost?",
          a: "The Student Pass fee is RM60. A Social Visit Pass for a dependant or guardian is RM90. Visa rates vary by nationality and are charged separately, as are EMGS processing and medical screening costs.",
        },
        {
          q: "Can I work on a Student Pass?",
          a: "Up to 20 hours a week, and only at approved locations — restaurants, petrol stations, mini markets, hotels, and within university areas. This applies to students at public universities and private higher education institutions only. Students at language and training centres are excluded.",
        },
        {
          q: "Can I bring my family on a Student Pass?",
          a: "Master's and PhD students may sponsor a spouse, children under 18, disabled children of any age, and parents. Dependants must show financial capability through three months of bank statements or a scholarship or embassy sponsorship letter. Dependants are not allowed to work or conduct business.",
        },
        {
          q: "What documents are required?",
          a: "A health insurance policy recognised in Malaysia with at least 12 months of coverage, a stamped personal bond form, and the institution's supporting documentation. Dependants additionally need proof of financial capability.",
        },
      ]}
      cta={{
        text: "Planning to stay on after graduating? Compare the long-stay routes →",
        href: "/compare/",
      }}
    >
      <Section title="How the application actually runs">
        <p>
          You do not apply for a Student Pass yourself. For higher education,
          your institution submits it and{" "}
          <abbr title="Education Malaysia Global Services">EMGS</abbr> screens
          it — which means your choice of institution determines how smoothly
          the process runs, and a slow institution is a slow application.
        </p>
        <p>
          At school level, a school representative, parent or legal guardian may
          apply on the child&apos;s behalf.
        </p>
      </Section>

      <Section title="The work limit, precisely">
        <p>
          Twenty hours a week, in a defined list of settings: restaurants,
          petrol stations, mini markets, hotels and university areas. The right
          extends to students at public universities and private higher
          education institutions. It does <strong>not</strong> extend to
          students at language centres or training centres.
        </p>
        <p>
          This is a genuine constraint rather than a formality, and it is not a
          route to funding your studies. If your plan depends on working, look
          at the <a href="/visas/employment-pass/">Employment Pass</a> instead.
        </p>
      </Section>

      <Section title="What happens after you graduate">
        <p>
          The Student Pass ends with your course. There is no automatic
          conversion to a work or residence pass. Graduates who want to stay
          generally move to an{" "}
          <a href="/visas/employment-pass/">Employment Pass</a> via a Malaysian
          employer, or — where the capital is available — into one of the{" "}
          <a href="/compare/">long-stay programmes</a>.
        </p>
      </Section>
    </GuideLayout>
  );
}
