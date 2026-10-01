/**
 * PVIP agencies terminated after the published list was issued.
 *
 * Hand-maintained, and the ONE place the directory says something the
 * government's own list does not. Immigration's PDF (dated 13 Aug 2026, still
 * unchanged when downloaded on 1 Oct 2026) prints all of these agencies; their
 * termination in September 2026 was reported by Jason Yap on 1 Oct 2026. The
 * page attributes it to him, by name and date, rather than presenting it as
 * Immigration's.
 *
 * When Immigration reissues the PDF without them, re-import and empty this
 * list. Ids are the generated `id`s in agents.json; `assertTerminatedExist()`
 * fails the build if a re-import renames one, so a status cannot quietly fall
 * off a company.
 *
 * The private working copy is the "PVIP Agency Roster 2026" artifact.
 */
export const PVIP_TERMINATED = {
  month: "2026-09",
  reportedBy: "Jason Yap",
  reportedOn: "2026-10-01",
  /** Date printed on the PDF that still lists them. */
  listDated: "2026-08-13",
  ids: [
    "cahayavip",
    "noorsetiam",
    "mypremiersettlers",
    "prxinternational",
    "cowisem",
    "asianakencana",
    "nagamaslanddevelopment",
    "myusventurepartners",
    "vetoconsortium",
    "centuryagency",
    "pexcellmanagement",
    "jdhdevelopment",
    "okaypvipacademy",
    "rizintelligentholding",
    "felcratravelsndtours",
    "esplanadesquare",
    "magnasuccessleisure",
    "agensipelanconganmasjohan",
    "agensicrescomarketing",
    "octagonengineeringm",
    "xeroadvisorsmm2h",
    "successmidwest",
  ],
} as const;
