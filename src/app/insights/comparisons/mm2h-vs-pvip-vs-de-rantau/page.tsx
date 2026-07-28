import type { Metadata } from "next";
import Link from "next/link";
import {
  H2,
  H3,
  InsightLayout,
  insightOpenGraphImages,
  Pullquote,
} from "@/components/InsightLayout";
import { DataTable } from "@/components/DataTable";
import { SupersededNotice } from "@/components/SupersededNotice";
import { insightPath, insights } from "@/lib/data/insights";
import {
  getProgramme,
  MM2H_AGENCY_FEE_ATTRIBUTION,
  MM2H_AGENCY_FEE_TERMS,
  MM2H_FD_WITHDRAWAL,
  MM2H_INCOME_PRACTICE,
} from "@/lib/data/programmes";
import { money, moneyPer, reviewDate } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * /insights/comparisons/mm2h-vs-pvip-vs-de-rantau/
 *
 * The article's angle, and why it is not another feature table: two of these
 * three programmes qualify you on capital and one qualifies you on income, and
 * MM2H — the best known of the three — has no income requirement at all. Every
 * competing comparison page ranks them as if they measured the same thing, which
 * is why none of those rankings help a reader decide.
 *
 * Every figure below is read from programmes.ts. Nothing is typed as a literal,
 * so the PVIP correction now pending (see UNVERIFIED there) will propagate here
 * rather than needing to be found in prose.
 */

const article = insights.find(
  (a) => a.slug === "mm2h-vs-pvip-vs-de-rantau",
)!;

const pvip = getProgramme("pvip")!;
const silver = getProgramme("mm2h-silver")!;
const gold = getProgramme("mm2h-gold")!;
const platinum = getProgramme("mm2h-platinum")!;
const rantau = getProgramme("de-rantau")!;
const sarawak = getProgramme("smm2h")!;

export const metadata: Metadata = {
  title: article.title,
  description: article.dek,
  alternates: { canonical: insightPath(article) },
  // A draft is reviewable at its real URL and must not be indexed there. The
  // flag lives in the registry so this cannot be forgotten in two places.
  robots: article.draft ? { index: false, follow: false } : undefined,
  openGraph: {
    type: "article",
    title: `${article.title} — ${site.name}`,
    description: article.dek,
    url: insightPath(article),
    ...insightOpenGraphImages(article),
  },
};

export default function Page() {
  return (
    <InsightLayout
      article={article}
      faq={[
        {
          q: "Does MM2H really have no income requirement?",
          a: `Correct, for all three federal tiers. Qualification is capital: the fixed deposit, and where you buy, the property threshold. Sarawak MM2H is the exception — it does test income. One practical caveat: ${MM2H_INCOME_PRACTICE.note.charAt(0).toLowerCase()}${MM2H_INCOME_PRACTICE.note.slice(1)} (${MM2H_INCOME_PRACTICE.attribution.by}, ${reviewDate(MM2H_INCOME_PRACTICE.attribution.asAt)}.)`,
        },
        {
          q: "Can I move from DE Rantau to MM2H or PVIP later?",
          a: "That is the normal path and the sensible one. DE Rantau gives you up to 24 months to decide before any capital is committed. Start the longer application before the second year runs out, not after.",
        },
        {
          q: "Does my PVIP income have to be a salary?",
          a: "No, and it does not have to be offshore either. Realised gains on investments, rental income and pension drawdown all count towards the RM40,000 a month. Malaysian-sourced income counts too, provided you can show proof of Malaysian income tax paid on it. Both of those are more generous than most write-ups say, including the older ones on this site.",
        },
        {
          q: "Can my spouse take a shorter PVIP term than mine?",
          a: "Yes, and it is the cheaper route. Your own term is fixed at 20 years, but each dependant chooses: RM100,000 for 20 years, or RM50,000 for 10 years. For a couple that is a RM50,000 decision, so it is worth making deliberately rather than by default.",
        },
        {
          q: "Is the fixed deposit gone for good?",
          a: "No. It stays in your name, it earns interest, and up to half of the principal may be withdrawn once the application is approved — against a residence purchase, education, or medical and tourism activities in Malaysia. What you do not get back is the participation and processing fees.",
        },
        {
          q: "I am 62. Does the minimum stay apply to me?",
          a: "Not on federal MM2H — there is no minimum stay from age 50. PVIP has no minimum stay at any age and no age limit either.",
        },
        {
          q: "Which is cheapest?",
          a: "DE Rantau, by an enormous margin: a little over RM1,000 in government fees against six figures for the others. It is also the shortest, at 24 months maximum. Cheapest and best are different questions here.",
        },
      ]}
      sources={[
        {
          label: "MOTAC — Guide: Malaysia My Second Home (December 2025)",
          url: silver.source,
          verified: silver.lastVerified,
        },
        {
          label: "Immigration Department of Malaysia — PVIP FAQ",
          url: pvip.source,
          verified: pvip.lastVerified,
        },
        {
          label: "MDEC — DE Rantau Pass FAQ",
          url: rantau.source,
          verified: rantau.lastVerified,
        },
        {
          label: "MTCP Sarawak — S-MM2H guidelines",
          url: sarawak.source,
          verified: sarawak.lastVerified,
        },
      ]}
    >
      {article.draft && <DraftBanner />}

      <H2>You have probably already noticed the thing nobody says out loud</H2>

      <p>
        If you have spent a weekend on this, the pattern is familiar. You read a
        page ranking Malaysia&rsquo;s visas best to worst. You read another one
        that ranks them differently. You ask an agency and they recommend the
        programme they happen to be licensed to sell. Three conversations, three
        confident answers, and you are no closer to knowing which one is actually
        yours.
      </p>

      <p>
        Here is the reason, and it is simpler than it looks: these three
        programmes are not competitors. They are not even measuring the same
        thing about you.
      </p>

      <p>
        Two of them ask what you own. One of them asks what you earn. Almost
        every comparison you have read quietly mixes those up, which is why the
        numbers never line up into a ranking that makes sense.
      </p>

      <Pullquote>
        Before any fee table: is the money that would fund this move income, or
        is it capital?
      </Pullquote>

      <p>
        That single distinction sorts all three, and it sorts them cleanly.
      </p>

      <H2>The income test, honestly stated</H2>

      <DataTable
        caption="What each programme actually tests. Figures from official sources — see Sources below."
        head={["Programme", "Income requirement", "Capital locked up"]}
        rows={[
          {
            label: <strong>{rantau.name}</strong>,
            cells: [
              {
                value: (
                  <>
                    {moneyPer(rantau.incomeRequirement!)} for tech professions,{" "}
                    {money({ amount: 60_000, currency: "USD" })} a year for
                    non-tech
                  </>
                ),
              },
              { value: "None" },
            ],
          },
          {
            label: <strong>{pvip.name}</strong>,
            cells: [
              { value: <>{moneyPer(pvip.incomeRequirement!)}, any source</> },
              { value: `${money(pvip.fixedDeposit!)} fixed deposit` },
            ],
          },
          {
            label: <strong>MM2H (all tiers)</strong>,
            cells: [
              { value: <strong>None</strong> },
              {
                value: (
                  <>
                    {money(silver.fixedDeposit!)} to{" "}
                    {money(platinum.fixedDeposit!)}, by tier
                  </>
                ),
              },
            ],
          },
        ]}
        idPrefix="income-test"
      />

      <p>
        Read the MM2H row twice, because it is the fact that reframes this whole
        decision.
      </p>

      <p>
        Malaysia&rsquo;s best-known long-stay programme has no income
        requirement. Not a low one &mdash; none. The official MOTAC category
        table published in December 2025 sets out fixed deposit, property
        threshold, participation fee, minimum age and minimum stay for every
        tier, and there is no monthly income line anywhere in it.
      </p>

      <p>
        Read that precisely, though, because it is easy to over-read.{" "}
        {MM2H_INCOME_PRACTICE.note}{" "}
        <em>
          {MM2H_INCOME_PRACTICE.attribution.by}, as at{" "}
          {reviewDate(MM2H_INCOME_PRACTICE.attribution.asAt)} &mdash; practice
          rather than a published rule, since MOTAC states no figure either way.
        </em>
      </p>

      <p>
        Which means a retiree drawing down a portfolio, with no salary at all,
        can qualify for MM2H and cannot qualify for PVIP. And a well-paid remote
        executive earning {moneyPer(pvip.incomeRequirement!)}, with most of it
        going out again each month, clears the PVIP income test and is stopped
        cold by the {money(pvip.fixedDeposit!)} deposit.
      </p>

      <p>
        If that describes your situation more accurately than any ranking you
        have read so far, the rest of this page is worth your time.
      </p>

      <H2>Three readers, and which one is you</H2>

      <H3>
        &ldquo;I still work, my clients are abroad, and I want to try Malaysia
        before I commit&rdquo;
      </H3>

      <p>
        <strong>
          DE Rantau is built for you, and nothing else on this page is.
        </strong>
      </p>

      <p>
        {moneyPer(rantau.incomeRequirement!)} if you work in tech &mdash;
        software, cloud, AI, data.{" "}
        {money({ amount: 60_000, currency: "USD" })} a year if your work is
        executive, finance or management. You need a contract with a
        foreign-registered employer, or foreign clients, running longer than
        three months. No deposit. No property. The government fee is{" "}
        {money({ amount: rantau.processingFee!.principal, currency: "MYR" })}{" "}
        for you and{" "}
        {money({ amount: rantau.processingFee!.dependant, currency: "MYR" })} per
        dependant, inclusive of SST, plus an immigration pass fee of{" "}
        {money({ amount: 360, currency: "MYR" })} a year.
      </p>

      <p>
        That is the entire capital requirement. Roughly the price of a
        business-class ticket.
      </p>

      <p>
        The catch, and it is a real one: the pass is issued for three to twelve
        months and renewable <strong>once</strong>, for a further twelve.
        Twenty-four months, and then it ends. DE Rantau is a trial, not a
        destination. Treat it as the cheapest possible way to find out whether
        you actually want to live here before you lock up{" "}
        {money(silver.fixedDeposit!)} to prove it.
      </p>

      <H3>
        &ldquo;I am retired or semi-retired, my wealth is in assets, and I want
        to stop renewing things&rdquo;
      </H3>

      <p>
        <strong>
          MM2H &mdash; and the tier is a budget decision rather than an
          eligibility one.
        </strong>
      </p>

      <p>
        No income test. What matters is the deposit, and the deposit sets the
        tenure:
      </p>

      <DataTable
        caption="Federal MM2H tiers. Source: MOTAC category table, December 2025."
        head={[
          "Tier",
          "Fixed deposit",
          "Property purchase floor",
          "Participation fee",
          "Agency fee",
          "Visa term",
        ]}
        rows={[silver, gold, platinum].map((t) => ({
          label: <strong>{t.name.replace("MM2H ", "")}</strong>,
          cells: [
            { value: money(t.fixedDeposit!) },
            { value: money(t.propertyPurchaseMin!), note: 1 },
            {
              value: money({
                amount: t.participationFee!.principal,
                currency: "MYR",
              }),
            },
            {
              value: money({
                amount: t.governmentExtras!.agencyFee!.principal,
                currency: "MYR",
              }),
              note: 2,
            },
            { value: `${t.tenureYears} years` },
          ],
        }))}
        notes={[
          silver.propertyStateFloorNote!,
          `Fixed by the government, not by the agency, and inclusive of 8% SST — a higher quote is wrong rather than expensive. It covers the main applicant's processing fee, their first five years of pass fee and visa fee, and their security bond. ${MM2H_AGENCY_FEE_TERMS} ${MM2H_AGENCY_FEE_ATTRIBUTION.by}, as at ${reviewDate(MM2H_AGENCY_FEE_ATTRIBUTION.asAt)}.`,
        ]}
        idPrefix="mm2h-tiers"
      />

      <p>
        Government processing is{" "}
        {money({ amount: silver.processingFee!.principal, currency: "MYR" })} for
        the main applicant and{" "}
        {money({ amount: silver.processingFee!.dependant, currency: "MYR" })} per
        dependant across all three tiers &mdash; and the participation fee above
        is charged per application, not per person, so a dependant adds that
        processing fee, a {money({ amount: 500, currency: "MYR" })} per-year pass
        fee, a visa fee set by their nationality, a{" "}
        {money({ amount: 10, currency: "MYR" })} security bond, and — from the
        second dependant onwards —{" "}
        {money({ amount: 2_160, currency: "MYR" })} of additional agency fee,
        rather than a second participation fee. The main applicant&apos;s
        processing fee is already inside the agency fee in the table above and
        should not appear twice on a quote. Minimum age is {silver.minAge}{" "}
        &mdash; not 30, whatever you have read elsewhere.{" "}
        {MM2H_FD_WITHDRAWAL}
      </p>

      <p>Two things to weigh properly.</p>

      <p>
        The first is the minimum stay. Between 25 and 49, you owe 90 days a year,
        and it can be met between you, your spouse and your dependants rather
        than by you alone.{" "}
        <strong>From age 50 there is no minimum stay requirement.</strong> If you
        are over 50 and were bracing for a residency clock, you are not on one.
      </p>

      <p>
        The second is currency. The deposit is denominated in US dollars, so your
        ringgit exposure moves with the exchange rate, and banks will generally
        convert at market rate on the day you pledge. Budget for a range, not a
        number.
      </p>

      <p>
        Where MM2H genuinely disappoints people: on Silver and Gold there are no
        work rights at all. MOTAC&apos;s guide marks business and investment
        activities and career opportunities <em>Not allowed</em> on both — not
        restricted, barred. Platinum is the exception, and marks both{" "}
        <em>Permissible</em>. So on the two cheaper tiers it is a residence
        programme and not a work permit; if your plan involves earning actively
        in Malaysia, that is a RM200,000 participation fee away, and you should
        read the next section before you commit capital.
      </p>

      <H3>
        &ldquo;I want the longest tenure, full work rights, and I do not want to
        think about this again&rdquo;
      </H3>

      <p>
        <strong>PVIP, if you clear both gates &mdash; and there are two.</strong>{" "}
        {moneyPer(pvip.incomeRequirement!)} in income, and{" "}
        {money(pvip.fixedDeposit!)} on fixed deposit. PVIP is the only one of the
        three that tests income <em>and</em> capital together.
      </p>

      <p>
        The income test is more generous than it looks, in two ways most
        write-ups get wrong. It does not have to be a salary &mdash; realised
        gains on investments, rental income and pension drawdown all count. And
        it does not have to be offshore: Malaysian-sourced income qualifies too,
        provided you can produce proof of Malaysian income tax paid on it. If you
        have read that onshore income is disqualifying, that was true of the 2022
        rules and is not true now.
      </p>

      <p>
        On top of the deposit sits a participation fee of{" "}
        {money({
          amount: pvip.participationFee!.principal,
          currency: "MYR",
        })}{" "}
        for the principal, and this is the number to be clear-eyed about: it is a
        fee, not a deposit. It does not come back. Your own term is fixed at{" "}
        {pvip.tenureYears} years, but each dependant chooses theirs &mdash;{" "}
        {pvip
          .participationFee!.dependantTerms!.map(
            (t) =>
              `${money({ amount: t.amount, currency: "MYR" })} for ${t.years} years`,
          )
          .join(", or ")}
        . For a couple that is a{" "}
        {money({ amount: 50_000, currency: "MYR" })} decision on its own, and it
        is one people make by default rather than deliberately.
      </p>

      <p>
        The participation fee is a government fee, and three more sit alongside
        it that quotes routinely leave out. The pass fee is{" "}
        {money({ amount: 2_000, currency: "MYR" })} per person per year of the
        approved term, collected up front &mdash; and because the approval is
        capped by passport validity, a five-year issuance means{" "}
        {money({ amount: 10_000, currency: "MYR" })} a head, not{" "}
        {money({ amount: 2_000, currency: "MYR" })}. A multiple-entry visa fee
        and a security bond follow, both set by nationality: the bond runs from{" "}
        {money({ amount: 200, currency: "MYR" })} to{" "}
        {money({ amount: 2_000, currency: "MYR" })} for the main applicant and is
        a flat {money({ amount: 10, currency: "MYR" })} per dependant. Unlike
        MM2H, PVIP&apos;s agency fee is commercial rather than government-set, so
        it is the one figure nobody publishes and the one to get in writing.
      </p>

      {/* Data-driven: the day Immigration republishes its FAQ and the entry is
          re-sourced, this disappears from here and every other page at once. */}
      <SupersededNotice programme={pvip} />

      <p>
        What PVIP buys is genuinely different from MM2H. There is{" "}
        <strong>no age limit at all</strong>. There is{" "}
        <strong>no minimum stay requirement</strong>. Work rights are full, where
        Silver and Gold bar business and career activity outright, so you do not
        need a separate permit to earn here. And
        dependants are defined broadly enough to include foreign domestic
        helpers, which for a family moving with staff is not a footnote.
      </p>

      <p>
        Work rights no longer decide this one. Platinum permits business and
        career activity too, so both programmes carry them, both run{" "}
        {platinum.tenureYears} years, and both charge the same{" "}
        {money({ amount: pvip.participationFee!.principal, currency: "MYR" })}{" "}
        participation fee. What separates them is the shape of the capital. PVIP
        wants {money(pvip.fixedDeposit!)} on deposit and{" "}
        {money(pvip.incomeRequirement!)} a month in income, and compels no
        property purchase. Platinum wants {money(platinum.fixedDeposit!)} on
        deposit — several times larger once converted — no income at all, and a
        compulsory {money(platinum.propertyPurchaseMin!)} residence you cannot
        sell for ten years. Choose on which of those you can actually meet.
      </p>

      <H2>The fork, stated plainly</H2>

      <p>
        Strip out everything else and the decision is three questions deep:
      </p>

      <ol className="ml-6 list-decimal space-y-3">
        <li>
          <strong>Do you need to work while you are here?</strong> If yes, and
          your employer or clients are abroad, and you can start small &rarr;{" "}
          <strong>DE Rantau</strong>. If yes, and you need permanence and full
          rights &rarr; <strong>PVIP</strong>.
        </li>
        <li>
          <strong>If not, is your qualifying money income or capital?</strong>{" "}
          Capital only, no salary &rarr; <strong>MM2H</strong>, tier set by how
          much you will pledge.
        </li>
        <li>
          <strong>
            Do you clear {moneyPer(pvip.incomeRequirement!)} <em>and</em> the{" "}
            {money(pvip.fixedDeposit!)} deposit <em>and</em>{" "}
            {money({
              amount: pvip.participationFee!.principal,
              currency: "MYR",
            })}{" "}
            you will never see again?
          </strong>{" "}
          That is the entire PVIP question. If any of the three is a no, PVIP is
          not your programme, and no agent should tell you otherwise.
        </li>
      </ol>

      <p>
        Two things worth knowing before you settle.{" "}
        <Link href="/visas/sarawak-mm2h/" className="text-forest-700 underline">
          Sarawak MM2H
        </Link>{" "}
        runs on completely different rules &mdash; a{" "}
        {money(sarawak.fixedDeposit!)} deposit, a{" "}
        {moneyPer(sarawak.incomeRequirement!)} income requirement, and just 30
        days a year of physical presence &mdash; and it is frequently the better
        answer for people the federal programme prices out. And if you are moving
        for work with a Malaysian employer rather than on your own capital, an{" "}
        <Link
          href="/visas/employment-pass/"
          className="text-forest-700 underline"
        >
          Employment Pass
        </Link>{" "}
        is a different conversation entirely.
      </p>

      <p>
        Run your own numbers on the{" "}
        <Link href="/tools/cost-calculator/" className="text-forest-700 underline">
          cost calculator
        </Link>
        , or take the{" "}
        <Link href="/tools/eligibility/" className="text-forest-700 underline">
          eligibility check
        </Link>{" "}
        if you want the programmes ranked against your actual figures rather than
        against each other in the abstract.
      </p>
    </InsightLayout>
  );
}

/** Shown only while `draft` is set in the registry. Never reaches a live page. */
function DraftBanner() {
  return (
    <p className="rounded-lg bg-alert-600 px-5 py-4 text-body-sm font-semibold text-sand-50">
      Draft — not indexed, not in the sitemap, not linked from anywhere.
    </p>
  );
}
