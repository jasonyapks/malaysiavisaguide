/**
 * PVIP agencies terminated after the published list was issued.
 *
 * Hand-maintained, and the ONE place the directory can say something the
 * government's own list does not. EMPTY since 12 Oct 2026: Immigration
 * reissued its PDF (dated 5 Oct 2026) and the directory follows it again.
 *
 * History: Jason Yap reported 22 agencies terminated in September 2026 while
 * the PDF dated 13 Aug 2026 still printed them. The 5 Oct reissue dropped 20
 * of the 22. It still lists the other two, PRX International and Success
 * Midwest, so they are shown again, on Immigration's authority.
 *
 * To hide an agency again, add its generated `id` from agents.json and set
 * the dates below; the build fails if an id matches no PVIP agency, so a
 * status cannot quietly fall off a company. With `ids` empty the page prints
 * no termination note.
 */
export const PVIP_TERMINATED = {
  month: "2026-09",
  reportedBy: "Jason Yap",
  reportedOn: "2026-10-01",
  /** Date printed on the PDF that still lists them. */
  listDated: "2026-08-13",
  ids: [] as string[],
} as const;
