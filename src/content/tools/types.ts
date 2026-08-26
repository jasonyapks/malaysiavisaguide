import type { ReactNode } from "react";

/**
 * Copy for /tools/ — the index above the eligibility quiz and the cost
 * calculator.
 *
 * `description` does triple duty: the meta description, the OpenGraph
 * description and the lead paragraph on the page. It was one constant in the
 * English file and stays one field here, so the three cannot drift apart.
 *
 * The tool entries are keyed by path rather than listed positionally. The
 * cost calculator is not translated yet, and on a Chinese page `linkPath`
 * sends its card to the English host — the card is still worth showing,
 * because hiding it would hide the tool.
 */
export type ToolsCopy = {
  /** og:title and og:description come from these via the root shell, which
   *  supplies siteName, type, locale and the sitewide image. */
  meta: { title: string };
  description: string;
  eyebrow: string;
  heading: ReactNode;
  order: {
    eyebrow: string;
    title: ReactNode;
    sub: string;
  };
  tools: Record<
    "/tools/eligibility/" | "/tools/cost-calculator/",
    {
      title: string;
      question: string;
      body: string;
      minutes: string;
    }
  >;
  openLabel: string;
  /** The closing note, split around its two inline links. */
  footnote: {
    before: string;
    compareLink: string;
    between: string;
    guideLink: string;
    after: string;
  };
  /** Schema.org ItemList name — not rendered, but read by crawlers. */
  schemaName: string;
};
