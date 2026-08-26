import type { CompareCopy } from "./types";

/**
 * English compare copy — moved here from app/(en)/compare/page.tsx.
 *
 * The figures that used to sit inline are now holes filled from
 * `programmes.ts`. See ./types.ts for why. The wording is otherwise the
 * original, including the RM46,000 sentence — except that the total is now
 * computed from its three components instead of stated next to them.
 */
export const copy: CompareCopy = {
  meta: {
    title: "Compare Malaysia's visa programmes side by side",
    description:
      "Every long-stay programme and work/study pass compared on the figures that decide it — deposit, property, term, fees, minimum stay and work rights.",
  },

  heading: "Compare the programmes",

  intro:
    "Malaysia's long-stay programmes are deposit-gated: you qualify by placing capital. The work and study passes are sponsor-gated: an employer or institution backs you, and no deposit exists.",

  longStay: {
    heading: "Long-stay programmes",
    note: "Deposits are shown in the currency the programme is denominated in. MM2H is quoted in US dollars; PVIP and S-MM2H in ringgit — so the exchange rate you get is itself part of the cost.",
  },

  workStudy: {
    heading: "Work and study passes",
    intro:
      "These are compared separately because a fixed deposit and a salary floor are not the same kind of number, and putting them in one table would imply they are.",
    note: (f) => (
      <>
        The Employment Pass floor shown is Category III. Category II starts at{" "}
        {f.epCategoryII} a month and Category I at {f.epCategoryI}. DE
        Rantau&apos;s figure is the tech threshold; non-tech professions need{" "}
        {f.deRantauNonTech}.
      </>
    ),
  },

  essay: {
    heading: "What the table can't show you",
    items: [
      {
        title: "A fixed deposit is not a cost.",
        body: (f) => (
          <>
            It stays your money. The fees are the money that actually leaves. On
            MM2H Silver that difference is {f.mm2hSilverDeposit} committed
            against {f.mm2hSilverSpend} genuinely spent —{" "}
            {f.mm2hSilverParticipation} participation, {f.mm2hSilverProcessing}{" "}
            processing and a {f.mm2hSilverAgency} government-set agency fee —
            and the compulsory {f.mm2hSilverProperty} property is a third
            category again.
          </>
        ),
      },
      {
        title: "Agent fees are fixed on MM2H and not on PVIP.",
        body: (f) => (
          <>
            This is the reverse of how the market is usually described. MM2H
            agency fees are set by the government — {f.mm2hSilverAgency} Silver,{" "}
            {f.mm2hGoldAgency} Gold, {f.mm2hPlatinumAgency} Platinum, all
            inclusive of 8% SST — so a higher quote is wrong rather than
            expensive. PVIP agency fees are commercial, published nowhere
            official, and the one number on this page you have to get in writing
            yourself.
          </>
        ),
      },
      {
        title: "The property minimum is not the price you will pay.",
        body: (f) => (
          <>
            MM2H&apos;s figures are national minimums. A foreign buyer must also
            clear the state&apos;s own floor —{" "}
            {f.stateFloors.map((s, i) => (
              <span key={s.name}>
                {i > 0 && ", "}
                {s.amount} in {s.name}
              </span>
            ))}{" "}
            — and where that is higher, it is the one that binds.
            Silver&apos;s {f.mm2hSilverProperty} is the number this catches
            hardest.
          </>
        ),
      },
      {
        title: "The work right is a tier question, not a programme question.",
        body: () => (
          <>
            PVIP and MM2H Platinum both carry it — MOTAC&apos;s December 2025
            guide marks business, investment and career activity{" "}
            <em>Permissible</em> on Platinum. MM2H Silver and Gold bar it
            outright, and S-MM2H is restricted. So &ldquo;MM2H doesn&apos;t let
            you work&rdquo; is only true of two tiers out of three, and if you
            intend to earn a living in Malaysia the row above narrows the field
            to PVIP and Platinum rather than to PVIP alone.
          </>
        ),
      },
    ],
  },

  quizCta: "Not sure which you qualify for? Run the eligibility checker →",

  sourcesNote: (lastReviewed) =>
    `Every figure above is drawn from the official source cited on each programme's guide page. Last reviewed ${lastReviewed}.`,
};
