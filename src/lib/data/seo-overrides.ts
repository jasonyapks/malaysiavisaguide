/**
 * Search-result title and description for an article, where they differ from
 * its headline and standfirst.
 *
 * The headline (H1) and dek on the page are written to be read; these are
 * written to fit a results page: title 60 characters or fewer, description
 * 150–160. Approved by Jason on 10 November 2026 (B1-2, B1-3). An article not
 * listed here uses its own headline and dek, as before.
 *
 * Keyed by the canonical English path. English only: the Chinese editions
 * keep their translated headline and dek.
 */
export const seoOverrides: Record<string, { title?: string; description?: string }> = {
  "/insights/comparisons/employment-pass-vs-residence-pass-talent/": {
    title: "Employment Pass vs Residence Pass-Talent (RP-T) in Malaysia",
    description:
      "Since 1 June 2026 the Employment Pass is time-boxed and tied to a plan to hand your job to a local. The RP-T is the way out, and its salary bar is lower.",
  },
  "/insights/comparisons/federal-mm2h-vs-sarawak-mm2h/": {
    title: "Federal MM2H vs Sarawak MM2H (S-MM2H): which one fits you?",
    description:
      "Sarawak MM2H asks for far less capital and no property purchase, but tests your finances and needs a sponsor. Federal MM2H compels a property purchase.",
  },
  "/insights/comparisons/kl-vs-penang-vs-johor-bahru-cost-of-living/": {
    title: "KL vs Penang vs Johor Bahru: cost of living compared (2026)",
    description:
      "Penang is cheaper than Kuala Lumpur for rent, daily spending and above all school fees. Official spending data, October 2026 rents and school fees compared.",
  },
  "/insights/comparisons/mm2h-platinum-vs-pvip/": {
    title: "MM2H Platinum vs PVIP: which 20-year visa costs less?",
    description:
      "Both run 20 years and both charge RM200,000. What separates them is whether you can prove RM40,000 a month: if you can, PVIP locks up a fraction of the capital.",
  },
  "/insights/comparisons/mm2h-sez-sfz-forest-city-2026/": {
    title: "MM2H SEZ and SFZ 2026: the Forest City route compared",
    description:
      "The Special Economic Zone and Special Financial Zone routes are the cheapest way into MM2H. What they cost against Silver, Gold and Platinum, and the catches.",
  },
  "/insights/comparisons/mm2h-silver-vs-gold-vs-platinum/": {
    title: "MM2H Silver vs Gold vs Platinum: which tier is yours?",
    description:
      "MM2H Silver, Gold and Platinum give almost the same daily life. What changes is how long the pass runs, how much capital you lock up and whether you can work.",
  },
  "/insights/comparisons/mm2h-vs-pvip-vs-de-rantau/": {
    title: "MM2H vs PVIP vs DE Rantau: which visa fits your income?",
    description:
      "MM2H, PVIP and DE Rantau test your money in three different ways: one on income alone, one on income and capital together. How to tell which one fits you.",
  },
  "/insights/comparisons/sdn-bhd-vs-labuan-vs-branch-office/": {
    title: "Sdn Bhd vs Labuan vs branch office: which to set up?",
    description:
      "Sdn Bhd, Labuan company, branch or representative office: four structures that answer different questions. Pick by your customers and what you do in Malaysia.",
  },
  "/insights/comparisons/which-visa-lets-you-run-a-business/": {
    title: "Which Malaysian visa lets you run a business?",
    description:
      "Two Malaysian long-stay passes let you run a business in your own right, one lets you run exactly one, and the rest are for living here, not for earning here.",
  },
  "/insights/expat-living/cost-of-living-kuala-lumpur-foreigner/": {
    title: "Cost of living in Kuala Lumpur for foreigners (2026)",
    description:
      "Three Kuala Lumpur budgets built from October 2026 rents, published school fees and official spending data, plus the charges Malaysia applies to non-citizens.",
  },
  "/insights/expat-living/fun-facts-about-malaysia/": {
    title: "24 fun facts about Malaysia most newcomers don't know",
    description:
      "Malaysia elects its king, runs different weekends in different states and makes you clear immigration on a domestic flight. 24 facts, a few of them useful.",
  },
  "/insights/expat-living/healthcare-insurance-costs-kl-expats/": {
    title: "Healthcare and insurance costs in KL for foreigners (2026)",
    description:
      "Malaysian healthcare is affordable for a healthy 45-year-old. Past 60, insurance gets dearer, private bills carry a tax and public hospitals charge full cost.",
  },
  "/insights/expat-living/international-school-fees-kl/": {
    title: "International school fees in KL and Penang (2026/27)",
    description:
      "2026/27 fees at six established international schools in Kuala Lumpur and Penang, the 6% tax foreign families pay, and what each visa lets your children do.",
  },
  "/insights/expat-living/is-foreign-income-taxed-in-malaysia/": {
    title: "Is foreign income taxed in Malaysia? The 182-day test",
    description:
      "Foreign income is close to untaxed for individuals in Malaysia, but not for companies. The line is a day count, not a visa, and the exemption runs to 2036.",
  },
  "/insights/expat-living/kl-daily-costs-cars-groceries-alcohol/": {
    title: "Groceries, cars and alcohol in Kuala Lumpur: 2026 prices",
    description:
      "Kuala Lumpur is cheap if you live the way locals do. Official October 2026 food prices, what petrol and transport cost a non-citizen, and the duty on wine.",
  },
  "/insights/expat-living/kl-neighbourhoods-rent-for-expats/": {
    title: "Where expats live in Kuala Lumpur and what rent costs",
    description:
      "Asking rents for nine Kuala Lumpur neighbourhoods from a dated October 2026 sample of listings, what each area is actually for, and the cash you need up front.",
  },
  "/insights/expat-living/malaysian-tax-for-expats/": {
    title: "Malaysian tax for expats: what you actually pay in 2026",
    description:
      "Malaysian tax for a foreigner specifically: which reliefs you can claim, the two rules that exist only for non-citizens, and the tax that does not reach you.",
  },
  "/insights/expat-living/manglish-101-for-expats/": {
    title: "Manglish 101: the words you'll hear in your first week",
    description:
      "Nobody expects you to speak Manglish in Malaysia, but you will need to know what 'can or not' and 'tapau' mean, and why 'lah' turns up at the end of everything.",
  },
  "/insights/expat-living/retire-in-malaysia/": {
    title: "Retire in Malaysia 2027: MM2H, Costs & Healthcare",
    description:
      "Planning to retire in Malaysia in 2027? MM2H visa requirements, living costs, healthcare, property rules and the best places to live, set out on one page.",
  },
  "/insights/how-to/apply-for-mm2h-2026/": {
    title: "How to apply for MM2H in 2026: tiers and zone routes",
    description:
      "MM2H has three main tiers plus two zone routes. What each requires, which steps can only be done inside Malaysia, and the two property conditions that follow.",
  },
  "/insights/how-to/company-setup-cost-malaysia-foreigner/": {
    title: "Company set-up cost in Malaysia for foreigners (2026)",
    description:
      "Registering a Malaysian company costs about RM2,500. A foreign owner's year-one bill depends on where you live, whether it sponsors your pass and what it sells.",
  },
  "/insights/how-to/foreigner-100-percent-ownership-sdn-bhd/": {
    title: "Can a foreigner own 100% of a Malaysian company? (2026)",
    description:
      "Usually yes. Most businesses need no Malaysian partner: you need a director who lives in Malaysia and, in a few sectors, a licence with its own capital rule.",
  },
  "/insights/how-to/how-much-does-mm2h-cost/": {
    title: "How much does MM2H cost in 2026? Every fee, tier by tier",
    description:
      "MM2H's cost on Silver, Gold and Platinum, split into what you pay, what you park and what you buy, with the dependant charges that most quotes leave out.",
  },
  "/insights/how-to/mm2h-fixed-deposit-withdrawal/": {
    title: "MM2H fixed deposit withdrawal 2026: how much and when",
    description:
      "Half of the MM2H fixed deposit can be withdrawn, but MOTAC's guide gives two answers on when. What can come out, what it may be spent on and what must stay.",
  },
  "/insights/how-to/mm2h-over-50-requirements-2026/": {
    title: "MM2H for over-50s: 2026 requirements, tiers and costs",
    description:
      "At 50 the MM2H minimum stay falls away and almost nothing else changes. What over-50s still do in person, which tier suits retirement and what family adds.",
  },
  "/insights/how-to/mm2h-property-rules/": {
    title: "MM2H Property Guide 2027: Rules, Requirements & Costs",
    description:
      "MM2H Silver's property minimum is RM600,000 on paper, but RM1,000,000 in Kuala Lumpur and RM2,000,000 in Selangor. What you must buy, when, and the lock-in.",
  },
  "/insights/how-to/mm2h-renewal-requirements-and-fees/": {
    title: "MM2H renewal 2026: requirements, fees and the 5-year rule",
    description:
      "MOTAC's guide describes two different MM2H renewals. When each falls on Silver, Gold, Platinum and the zone route, what it costs and the traps that delay it.",
  },
  "/insights/how-to/mm2h-requirements-costs-application/": {
    title: "Malaysia MM2H 2027: Requirements, Costs & Application Guide",
    description:
      "The current MM2H rules on a single page, not the programme that ended in 2024: what each tier asks for, what it really costs and how the application runs.",
  },
  "/insights/how-to/paid-up-capital-employment-pass-own-company/": {
    title: "Paid-up capital for an Employment Pass via your own company",
    description:
      "You can register a Malaysian company with almost nothing in it, but you cannot hire yourself through it on an Employment Pass until it holds RM500,000.",
  },
  "/insights/how-to/pvip-and-company-incorporation-malaysia/": {
    title: "PVIP and company set-up in Malaysia: visa to business owner",
    description:
      "PVIP lets you live in Malaysia, own a company and sit as its resident director on one pass. How the visa works, which structure to choose, how to incorporate.",
  },
  "/insights/how-to/sdn-bhd-annual-running-costs/": {
    title: "Sdn Bhd annual running costs in Malaysia (2026)",
    description:
      "A Malaysian Sdn Bhd costs money every year whether it trades or not, until it is formally closed. The yearly bill for a foreign-owned company, line by line.",
  },
  "/news/budget-2027-lets-de-rantau-holders-stay-beyond-two-year-limit/": {
    title: "Budget 2027: DE Rantau holders can stay beyond two years",
    description:
      "Under Budget 2027, digital nomads who reach the DE Rantau Nomad Pass's two-year limit may keep living and working remotely in Malaysia if they meet criteria.",
  },
  "/news/budget-2027-lets-employment-pass-spouses-work-in-malaysia/": {
    title: "Budget 2027: Category I Employment Pass spouses can work",
    description:
      "From 1 January 2027, spouses of Category I Employment Pass holders who hold a Dependant Pass may work in Malaysia, subject to conditions, under Budget 2027.",
  },
  "/news/budget-2027-what-changes-for-foreign-retirees-and-residents/": {
    title: "Budget 2027: what changes for foreign residents in Malaysia",
    description:
      "Budget 2027 did not mention MM2H or PVIP, but it changes costs foreigners in Malaysia pay: income tax, service tax on elderly care, hospital bills, duty-free.",
  },
  "/news/dubai-introduces-five-year-multiple-entry-tourist-visa/": {
    title: "Dubai introduces five-year multiple-entry tourist visa",
    description:
      "The UAE now issues a five-year multiple-entry tourist visa, permitting up to 90 days per visit and a 180-day yearly total for frequent leisure or work trips.",
  },
  "/news/eb-5-draft-rules-could-curtail-bridge-financing/": {
    title: "EB-5 draft rules could curtail bridge financing",
  },
  "/news/forest-city-releases-guidance-on-sfz-mm2h-requirements/": {
    title: "Forest City releases guidance on SFZ MM2H requirements",
    description:
      "Forest City in Malaysia has issued new guidelines for the Special Economic Zone MM2H scheme, targeting rising demand from applicants in neighbouring countries.",
  },
  "/news/forest-city-sfz-mm2h-guidance-highlights-lower-deposit-thresholds/": {
    title: "Forest City SFZ MM2H guidance highlights lower deposits",
    description:
      "Forest City's Special Financial Zone sets out the eligibility, reduced deposit and property requirements for its MM2H variant for retirees and investors.",
  },
  "/news/immigration-department-presents-pvip-to-foreign-media-at-mihas/": {
    title: "Immigration Department presents PVIP to foreign media",
    description:
      "At a MIHAS press conference, Malaysia's Immigration Department walked foreign journalists through PVIP: up to 20 years, work and business rights, in-laws.",
  },
  "/news/immigration-flags-rise-in-social-visit-pass-work-violations/": {
    title: "Immigration flags rise in social visit pass work violations",
    description:
      "Malaysia's immigration department reports more foreigners working illegally on social visit passes, a trend that also touches the DE Rantau Nomad Pass scheme.",
  },
  "/news/immigration-says-266-foreigners-in-forest-city-have-valid-documents/": {
    title: "Immigration: 266 foreigners in Forest City have valid papers",
    description:
      "A joint inspection confirmed that all 266 foreign residents examined in Forest City hold lawful immigration papers, after allegations about Network School.",
  },
  "/news/malaysia-requires-evisa-for-citizens-of-31-countries/": {
    title: "Malaysia requires eVisa for citizens of 31 countries",
    description:
      "From 2026, travellers from 31 listed nations must obtain a Single Entry eVisa before they arrive in Malaysia for tourism, family visits or short events.",
  },
  "/news/malaysia-tightens-enforcement-on-social-visit-passes-for-work/": {
    title: "Malaysia tightens enforcement on social visit pass work",
    description:
      "Prime Minister Anwar Ibrahim ordered stricter action after 54,791 foreign nationals were penalised for using social visit passes to work across Malaysia.",
  },
  "/news/malaysia-tops-digital-nomad-hub-rankings-in-2026/": {
    title: "Malaysia tops digital nomad hub rankings in 2026",
  },
  "/news/mm2h-agents-must-obey-overseas-laws-says-tourism-minister/": {
    title: "MM2H agents must obey overseas laws, says tourism minister",
    description:
      "Tourism minister Datuk Seri Tiong King Sing urges MM2H licence holders to follow the laws of each country where they recruit, to curb fraud against applicants.",
  },
  "/news/mm2h-programme-revamp-raises-entry-bars/": {
    title: "MM2H revamp raises entry bars, may deter middle-class expats",
    description:
      "The 2025-26 MM2H overhaul brings Silver, Gold and Platinum tiers with fixed deposits of USD 150,000, 500,000 and 1 million, plus mandatory agent assistance.",
  },
  "/news/mm2h-records-7650-applications-as-malaysia-plans-overseas-promotion/": {
    title: "MM2H records 7,650 applications; overseas promotion planned",
    description:
      "China and Taiwan supplied almost two-thirds of MM2H applications since October 2024, with sales missions planned for Hong Kong, Japan and South Korea.",
  },
  "/news/mm2h-visa-holders-face-uncertainty-as-ura-bill-withdrawn/": {
    title: "MM2H holders face property risks under proposed URA",
    description:
      "The draft Urban Renewal Act could allow compulsory acquisition of homes owned by MM2H holders, affecting retirees on the Silver, Gold or Platinum tiers.",
  },
  "/news/penang-ranked-worlds-most-affordable-city-for-digital-nomads/": {
    title: "Penang ranked most affordable city for digital nomads",
    description:
      "A UK study of 26 cities in 15 countries puts Penang first for digital nomads, with monthly costs including rent at about €850 (RM3,860). Kuala Lumpur was third.",
  },
  "/news/pm-calls-for-crackdown-on-visitor-and-student-visa-abuse/": {
    title: "PM calls for crackdown on visitor and student visa abuse",
    description:
      "Prime Minister Anwar Ibrahim warned that foreigners are exploiting tourist and student visas to run small enterprises and urged coordinated action by agencies.",
  },
  "/news/portugal-golden-visa-delays-spark-legal-challenge-for-investors/": {
    title: "Portugal golden visa delays spark investor legal challenge",
  },
  "/news/portugal-golden-visa-faces-new-citizenship-rule-demand-slows/": {
    title: "Portugal golden visa faces new citizenship rule",
    description:
      "Portugal's residency-by-investment scheme now requires ten years before citizenship, which has prompted withdrawals and legal challenges from its investors.",
  },
  "/news/pvip-agency-mypvip-to-hold-webinar-on-running-a-business-in-malaysia/": {
    title: "MYPVIP's free webinar on running a business in Malaysia",
    description:
      "PVIP holders can live, work and run a business in Malaysia on one pass. MYPVIP's Zoom webinar on Sunday 1 November covers getting from visa to company.",
  },
  "/news/sarawak-immigration-detains-42-foreigners-in-night-raids/": {
    title: "Sarawak immigration detains 42 foreigners in night raids",
    description:
      "Authorities in Kuching arrested 42 non-citizens on suspicion of unlawful entry or overstaying in a series of night raids, underscoring stricter enforcement.",
  },
  "/news/sarawak-mm2h-records-over-800-approvals-education-drives-growth/": {
    title: "Sarawak MM2H records over 800 approvals",
  },
  "/news/singapore-launches-ai-work-pass-under-one-pass/": {
    title: "Singapore launches AI work pass under ONE Pass",
    description:
      "Singapore will roll out a five-year AI-focused work pass under ONE Pass for senior AI, advanced computing and quantum specialists to ease a talent gap.",
  },
  "/news/taiwan-extends-its-digital-nomad-visa-to-two-years/": {
    title: "Taiwan extends its digital nomad visa to two years",
  },
  "/news/tiong-wants-action-against-mm2h-participants-running-businesses/": {
    title: "Tiong wants action against MM2H holders running businesses",
    description:
      "Tourism minister Tiong King Sing has told immigration and other agencies to tighten oversight of MM2H holders doing business their visa tier does not allow.",
  },
  "/news/uae-golden-visa-2026-10-year-residency-for-indian-professionals/": {
    title: "UAE Golden Visa: 10-year residency for Indian professionals",
    description:
      "The United Arab Emirates has opened a ten-year, sponsor-free Golden Visa for Indian employees and investors, with clear salary and property thresholds.",
  },
  "/news/uae-introduces-flexible-on-arrival-visas-for-indian-expatriates/": {
    title: "UAE introduces on-arrival visas for Indian expatriates",
    description:
      "Indian passport holders with US, UK or EU residence permits can get a 14-day or 60-day UAE visa on arrival, and a five-year Green Visa is open to investors.",
  },
  "/news/watch-the-replay-mypvip-webinar-on-running-a-business-in-malaysia/": {
    title: "Replay: MYPVIP webinar on running a business in Malaysia",
    description:
      "The full recording of MYPVIP's 1 November webinar: how PVIP lets you live in Malaysia and run your own company, which structure to choose and what to avoid.",
  },
  "/news/xpats-gateway-adds-myfuturejobs-eppax-to-speed-employment-pass/": {
    title: "Xpats Gateway adds MYFutureJobs, ePPAx for Employment Pass",
    description:
      "Since 1 July 2025, Malaysia's Xpats Gateway includes MYFutureJobs and ePPAx requirements, so employers complete Employment Pass paperwork in a single portal.",
  },
};
