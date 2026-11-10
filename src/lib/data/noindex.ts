/**
 * News stories kept on the site but hidden from search (audit task B5-7,
 * Jason's decision of 10 Nov 2026).
 *
 * These eight cover other countries' visa schemes with no Malaysia angle. They
 * stay readable at their URLs, but carry `noindex` and are left out of every
 * sitemap, so they stop diluting what the site is about. To bring one back,
 * add a "what this means for Malaysia applicants" section to the article and
 * remove its slug here.
 */
export const noindexNewsSlugs: ReadonlySet<string> = new Set([
  "dubai-introduces-five-year-multiple-entry-tourist-visa",
  "eb-5-draft-rules-could-curtail-bridge-financing",
  "portugal-golden-visa-delays-spark-legal-challenge-for-investors",
  "portugal-golden-visa-faces-new-citizenship-rule-demand-slows",
  "singapore-launches-ai-work-pass-under-one-pass",
  "taiwan-extends-its-digital-nomad-visa-to-two-years",
  "uae-golden-visa-2026-10-year-residency-for-indian-professionals",
  "uae-introduces-flexible-on-arrival-visas-for-indian-expatriates",
]);
