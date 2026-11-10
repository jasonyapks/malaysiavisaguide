import { insightPath } from "@/lib/data/insights";
import { liveInsightCategories } from "@/lib/insights";
import { localeUrl } from "@/lib/i18n";

/**
 * /llms.txt — a plain-markdown map of the site for AI assistants
 * (https://llmstxt.org): what the site is, then its pages with one line each.
 *
 * Generated rather than kept in public/, because a hand-kept list drifts the
 * first time an article publishes. The insights section is read from the same
 * `liveInsightCategories()` the listings use, so drafts never appear and a new
 * article joins on the next build. English only: it names the Chinese hosts
 * instead of listing every translated URL twice more.
 *
 * No figures here on purpose. Fees and thresholds live on the pages, with their
 * sources and dates; a number copied into this file would be the one that went
 * stale without anybody noticing.
 */
// Required by `output: "export"` — emitted as out/llms.txt at build time.
export const dynamic = "force-static";

const SITE = "Malaysia Visa Guide";

/** Static pages worth handing an assistant, with what each one answers. */
const GUIDES: [path: string, title: string, note: string][] = [
  ["/visas/pvip/", "Premium Visa Programme (PVIP)", "20-year residence pass by fixed deposit: eligibility, fixed deposit and income rules, fees, timeline"],
  ["/visas/mm2h/", "Malaysia My Second Home (MM2H)", "Silver, Gold and Platinum tiers and the special economic zones: deposits, property rule, fees, stay requirement"],
  ["/visas/sarawak-mm2h/", "Sarawak MM2H (S-MM2H)", "Sarawak's own programme: the two qualifying routes, fees, property rules, the 30-day stay rule, and how it differs from federal MM2H"],
  ["/visas/de-rantau/", "DE Rantau digital nomad pass", "Remote-worker pass: the two income thresholds, what it costs, and what it does not allow"],
  ["/visas/employment-pass/", "Employment Pass", "The three Employment Pass categories in force from 1 June 2026, their salary floors, and what changed"],
  ["/visas/student-pass/", "Student Pass", "Studying in Malaysia: how the EMGS application runs, the work limit, and options after graduating"],
];

const TOOLS: [path: string, title: string, note: string][] = [
  ["/compare/", "Compare programmes", "Side-by-side table of PVIP, MM2H, Sarawak MM2H and DE Rantau"],
  ["/tools/eligibility/", "Eligibility checker", "Which programmes a given age, income and capital qualify for"],
  ["/tools/cost-calculator/", "Cost calculator", "Total outlay for a household on each programme and tier"],
  ["/agents/", "Licensed agents", "The official lists of licensed MM2H agents and authorised PVIP agencies"],
];

const ABOUT: [path: string, title: string, note: string][] = [
  ["/about/", "About", "Who writes the guide, and the disclosed commercial relationship with MYPVIP and MY Premium MM2H"],
  ["/about/jason-yap/", "Jason Yap", "The author: his roles at MYPVIP, MY Premium MM2H and MPVIPCA, everything he has written here, and his conflicts of interest"],
  ["/editorial-policy/", "Editorial policy", "How pages are sourced, dated, reviewed and corrected"],
  ["/news/", "News", "Dated reports on rule and fee changes"],
];

const CATEGORY: Record<string, string> = {
  comparisons: "Comparisons",
  "how-to": "How-to guides",
  "expat-living": "Living in Malaysia",
};

const line = (path: string, title: string, note: string) =>
  `- [${title}](${localeUrl(path, "en")}): ${note}`;

export async function GET() {
  const categories = await liveInsightCategories("en");

  const body = [
    `# ${SITE}`,
    "",
    "> An independent guide to Malaysia's long-stay visa programmes: PVIP, MM2H, Sarawak MM2H, DE Rantau, the Employment Pass and the Student Pass. Costs, requirements and timelines, each figure dated and sourced to the official document it comes from.",
    "",
    "Written and reviewed by Jason Yap, Managing Director of two licensed Malaysian visa agencies (MYPVIP and MY Premium MM2H); the relationship is disclosed on every page. Each page carries its review date and a source list. Where an official document has not caught up with a rule change, the page says so and names the source it relies on instead.",
    "",
    "Chinese editions: https://cn.malaysiavisaguide.com (Simplified) and https://tw.malaysiavisaguide.com (Traditional), same paths.",
    "",
    "## Visa guides",
    "",
    ...GUIDES.map((g) => line(...g)),
    "",
    "## Tools",
    "",
    ...TOOLS.map((g) => line(...g)),
    "",
    ...categories.flatMap(({ category, articles }) => [
      `## ${CATEGORY[category] ?? category}`,
      "",
      ...articles.map((a) => line(insightPath(a), a.title, a.dek)),
      "",
    ]),
    "## Optional",
    "",
    ...ABOUT.map((g) => line(...g)),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
