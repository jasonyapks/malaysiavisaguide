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
import { getProgramme, MM2H_INCOME_PRACTICE } from "@/lib/data/programmes";
import { money, moneyPer, reviewDate, years } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * /insights/comparisons/mm2h-platinum-vs-pvip/
 *
 * The angle: these two have converged, and almost nothing written about them
 * has caught up. Same term, same participation fee, and since MOTAC's December
 * 2025 guide both permit business and career activity — so "PVIP is the one that
 * lets you work" is no longer a difference. What is left is one qualifying test
 * and a very large gap in locked capital, which is a far more useful thing to
 * tell a reader than another feature grid.
 *
 * Every figure is read from programmes.ts. Nothing is a literal, so a change to
 * either programme's terms propagates here.
 */

const article = insights.find((a) => a.slug === "mm2h-platinum-vs-pvip")!;

const pvip = getProgramme("pvip")!;
const platinum = getProgramme("mm2h-platinum")!;

export const metadata: Metadata = {
  title: article.title,
  description: article.dek,
  alternates: { canonical: insightPath(article) },
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
      sources={[
        {
          label: "MOTAC — Guide: Malaysia My Second Home (December 2025)",
          url: platinum.source,
          verified: platinum.lastVerified,
        },
        {
          label: "Immigration Department of Malaysia — PVIP FAQ",
          url: pvip.source,
          verified: pvip.lastVerified,
        },
      ]}
      faq={[
        {
          q: "Can MM2H Platinum holders really work in Malaysia?",
          a: "On the current guidance, yes. MOTAC's December 2025 guide marks both Business/Investment Activities and Career Opportunities as Permissible for Platinum, and Not allowed for Gold and Silver. That is a genuine change from how MM2H is usually described, and it is the one tier it applies to.",
        },
        {
          q: "Which one needs less money up front?",
          a: "PVIP, and not by a small margin. PVIP pledges RM1,000,000 on fixed deposit and compels no property purchase. Platinum pledges USD1,000,000 and compels a residence of RM2,000,000 or above that you cannot sell for ten years. The participation fee is RM200,000 on both.",
        },
        {
          q: "What if I cannot show RM40,000 a month?",
          a: "Then PVIP is closed to you regardless of how much capital you hold, and Platinum becomes the only twenty-year route of the two. This is the single most common reason a wealthy applicant ends up on Platinum rather than PVIP.",
        },
        {
          q: "Does the PVIP income have to be salary, or offshore?",
          a: "Neither. Realised investment gains, rental income and pension drawdown all count towards the RM40,000 a month, and Malaysian-sourced income counts too if you can show Malaysian income tax paid on it. That is more generous than most write-ups state.",
        },
        {
          q: "Do I need an agent for either?",
          a: "Yes, for both. PVIP applications go through an agency authorised by the Immigration Department. MM2H applications go through a company licensed by MOTAC under the Tourism Industry Act 1992. Neither has an independent route on current guidance.",
        },
      ]}
    >
      <p>
        You have probably been quoted both, by two different agents, and come
        away with two sets of numbers that refuse to line up. That is not because
        you misheard. It is because an agent licensed for one programme tends to
        describe the other one as it was three years ago, and because the single
        most repeated line about these two — that PVIP is the one that lets you
        work — stopped being true in December 2025.
      </p>

      <p>
        Here is the thing almost nobody has updated. On paper, these two
        programmes have quietly converged. Both run{" "}
        {years(pvip.tenureYears)}. Both charge a{" "}
        {money({ amount: pvip.participationFee!.principal, currency: "MYR" })}{" "}
        participation fee for the principal. And MOTAC&apos;s own December 2025
        guide marks business, investment and career activity{" "}
        <strong>Permissible</strong> for MM2H Platinum — the only tier it does
        that for. Gold and Silver are barred outright.
      </p>

      <Pullquote>
        The work-rights tiebreaker is dead. What actually separates these two is
        one qualifying test and a very large difference in locked capital.
      </Pullquote>

      <H2>The one question that decides it</H2>

      <p>
        Can you evidence {moneyPer(pvip.incomeRequirement!)} of income?
      </p>

      <p>
        That is the whole fork. PVIP tests income; MM2H Platinum does not test
        income at all. Everything else follows from which side of that line you
        fall on, and no amount of capital moves you across it — an applicant with
        eight figures in assets and no provable monthly income cannot buy their
        way into PVIP.
      </p>

      <p>
        The test is broader than most write-ups admit, which matters if you have
        already ruled yourself out. It does not have to be salary: realised
        investment gains, rental income and pension drawdown all count. It does
        not have to be offshore either — Malaysian-sourced income qualifies, with
        proof of Malaysian income tax paid on it.
      </p>

      <p>
        One qualification on the Platinum side, because &ldquo;no income
        requirement&rdquo; is easy to over-read.{" "}
        {MM2H_INCOME_PRACTICE.note} There is still no figure to hit, and that is
        the whole advantage — but arrive with the statements anyway.{" "}
        <em>
          {MM2H_INCOME_PRACTICE.attribution.by}, as at{" "}
          {reviewDate(MM2H_INCOME_PRACTICE.attribution.asAt)}. MOTAC&apos;s guide
          publishes no income figure either way, so this is practice rather than
          a published rule.
        </em>
      </p>

      <SupersededNotice programme={pvip} />

      <H2>Side by side, on the things that actually differ</H2>

      <DataTable
        caption="MM2H Platinum and PVIP, on current official guidance"
        idPrefix="plat-pvip"
        head={["", "MM2H Platinum", "PVIP"]}
        rows={[
          {
            label: <strong>Income requirement</strong>,
            cells: [
              { value: <strong>None</strong>, note: 1 },
              { value: moneyPer(pvip.incomeRequirement!) },
            ],
          },
          {
            label: <strong>Fixed deposit</strong>,
            cells: [
              { value: money(platinum.fixedDeposit!) },
              { value: money(pvip.fixedDeposit!), note: 2 },
            ],
          },
          {
            label: <strong>Property purchase</strong>,
            cells: [
              { value: `From ${money(platinum.propertyPurchaseMin!)}`, note: 3 },
              { value: <strong>Not required</strong> },
            ],
          },
          {
            label: <strong>Participation fee</strong>,
            cells: [
              {
                value: money({
                  amount: platinum.participationFee!.principal,
                  currency: "MYR",
                }),
              },
              {
                value: money({
                  amount: pvip.participationFee!.principal,
                  currency: "MYR",
                }),
                note: 4,
              },
            ],
          },
          {
            label: <strong>Term</strong>,
            cells: [
              { value: years(platinum.tenureYears) },
              { value: years(pvip.tenureYears) },
            ],
          },
          {
            label: <strong>Work and business</strong>,
            cells: [{ value: "Permissible" }, { value: "Full" }],
          },
          {
            label: <strong>Minimum age</strong>,
            cells: [{ value: `${platinum.minAge}` }, { value: "None" }],
          },
          {
            label: <strong>Minimum stay</strong>,
            cells: [
              { value: platinum.minStayShort ?? "None" },
              { value: "None" },
            ],
          },
          {
            label: <strong>Authority</strong>,
            cells: [
              { value: "MOTAC" },
              { value: "Immigration Department" },
            ],
          },
        ]}
        notes={[
          `${MM2H_INCOME_PRACTICE.note} ${MM2H_INCOME_PRACTICE.attribution.by}, as at ${reviewDate(MM2H_INCOME_PRACTICE.attribution.asAt)}.`,
          pvip.fixedDeposit!.withdrawable!,
          "Compulsory after approval, and the residence may not be sold for ten years unless you are upgrading to one of higher value.",
          "For the principal, whose term is fixed. A dependant chooses their own: RM100,000 for 20 years, or RM50,000 for 10.",
        ]}
      />

      <p>
        Read the deposit row twice. One is a ringgit sum, the other is a US
        dollar sum of the same face number, so the ringgit equivalent of the
        Platinum pledge is a multiple of the PVIP one at any exchange rate you
        care to use. Add the compulsory{" "}
        {money(platinum.propertyPurchaseMin!)} residence, locked for a decade,
        and the capital gap stops being a detail and becomes the decision.
      </p>

      <H2>Which one is yours</H2>

      <H3>You have income you can document</H3>

      <p>
        PVIP, almost certainly. You get the same twenty years and the same work
        rights for a fraction of the committed capital, with no property purchase
        forced on you, no minimum stay, and no age limit. If someone is steering
        you towards Platinum while you comfortably clear{" "}
        {moneyPer(pvip.incomeRequirement!)}, ask them to put the reason in
        writing.
      </p>

      <H3>You are asset-rich and income-light</H3>

      <p>
        This is the classic case: sold a business, capital is sitting in
        investments, nothing arrives monthly in a form a government will accept.
        PVIP is shut to you. Platinum is the only twenty-year door of the two,
        and the property requirement may be something you intended anyway — in
        which case it is less of a penalty than it looks on the table.
      </p>

      <H3>You want to run a business here</H3>

      <p>
        Both now permit it, so choose on the capital, not the permission. But
        check the tier you are actually being sold: if the quote says MM2H and
        the fee is{" "}
        {money({ amount: 3_000, currency: "MYR" })} or{" "}
        {money({ amount: 1_000, currency: "MYR" })} rather than{" "}
        {money({
          amount: platinum.participationFee!.principal,
          currency: "MYR",
        })}
        , that is Gold or Silver, and business and career activity are{" "}
        <strong>not allowed</strong> on either.
      </p>

      <H2>Where each one disappoints people</H2>

      <p>
        <strong>PVIP</strong> rests on an income test you must keep evidencing,
        and its published FAQ is behind the terms actually being applied — the
        notice above this article&apos;s table is there because of exactly that.
        If your income is lumpy or hard to document, the application is painful
        in a way the brochure does not convey.
      </p>

      <p>
        <strong>Platinum</strong> asks for a great deal of capital and then
        immobilises more of it: a US dollar deposit, half of which stays put
        until the second year, plus a residence you cannot sell for ten years.
        It also carries a {platinum.minStayShort} requirement and a minimum age
        of {platinum.minAge}, neither of which PVIP has.
      </p>

      <H2>The fork, stated plainly</H2>

      <p>
        If you can prove {moneyPer(pvip.incomeRequirement!)}, take PVIP and keep
        the capital. If you cannot, PVIP is not a stretch or a maybe — it is
        closed, and MM2H Platinum is the twenty-year route that remains open to
        you. Everything else is detail.
      </p>

      <p>
        One disclosure, because it changes how you should read the above: this
        site is published by someone who runs a licensed agency for{" "}
        <em>both</em> programmes, and is paid either way. That is the reason the
        recommendation here is the cheaper one wherever you qualify for it — and
        the reason every figure above is linked to the government document it
        came from, so you can check it without taking anyone&apos;s word.{" "}
        <Link href="/about/">More on that</Link>, and the{" "}
        <Link href="/tools/eligibility/">eligibility checker</Link> will run your
        own numbers against both.
      </p>
    </InsightLayout>
  );
}
