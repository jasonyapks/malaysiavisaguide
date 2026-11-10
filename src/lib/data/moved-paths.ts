/**
 * News articles whose URL changed, old path → new path (audit task B1-7,
 * approved 10 Nov 2026: nine slugs that had been cut off mid-phrase).
 *
 * Read by functions/_middleware.ts, which answers the old URL with a 301 on
 * whichever host was asked — the paths are the same on all three. Never delete
 * a line: the old URLs are in Google and in other people's links.
 */
export const movedPaths: Record<string, string> = {
  "/news/immigration-says-266-foreigners-in-forest-city-have-valid/": "/news/immigration-says-266-foreigners-in-forest-city-have-valid-documents/",
  "/news/forest-city-releases-guidance-on-sfz-mm2h-requirements-amid/": "/news/forest-city-releases-guidance-on-sfz-mm2h-requirements/",
  "/news/uae-golden-visa-2026-10-year-residency-for-indian/": "/news/uae-golden-visa-2026-10-year-residency-for-indian-professionals/",
  "/news/pm-calls-for-crackdown-on-visitor-and-student-visa/": "/news/pm-calls-for-crackdown-on-visitor-and-student-visa-abuse/",
  "/news/mm2h-programme-revamp-raises-entry-bars-may-deter-middle/": "/news/mm2h-programme-revamp-raises-entry-bars/",
  "/news/eb-5-draft-rules-could-curtail-bridge-financing-for/": "/news/eb-5-draft-rules-could-curtail-bridge-financing/",
  "/news/malaysia-tops-digital-nomad-hub-rankings-in-2026-a/": "/news/malaysia-tops-digital-nomad-hub-rankings-in-2026/",
  "/news/singapore-launches-ai-work-pass-under-one-pass-to/": "/news/singapore-launches-ai-work-pass-under-one-pass/",
  "/news/malaysia-requires-evisa-for-citizens-of-31-countries-for/": "/news/malaysia-requires-evisa-for-citizens-of-31-countries/",
};
