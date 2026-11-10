/**
 * Webinars and events — the language-neutral facts. Titles and descriptions
 * are in src/content/events/<locale>.tsx, keyed by `id`.
 *
 * To add an event: add an entry here and its copy in en.tsx and zh-hans.tsx
 * (then `npm run i18n:hant`). An event with `registrationUrl` and a `date` in
 * the future is listed as upcoming; once it has a `youtubeId` it is a replay.
 * Do not add a transcript that Jason has not read: an auto-generated one
 * misquotes figures.
 */
export type SiteEvent = {
  id: string;
  /** ISO date and local start time, Malaysia time (UTC+8). */
  date: string;
  time: string;
  registrationUrl?: string;
  youtubeId?: string;
  /** The news stories that announced it and carried the replay. */
  newsPaths: string[];
  /** The written version of the session, where one exists. */
  guidePath?: string;
};

export const events: SiteEvent[] = [
  {
    id: "pvip-visa-to-business-owner-2026-11",
    date: "2026-11-01",
    time: "20:00",
    youtubeId: "lP0LaHg1U3A",
    newsPaths: [
      "/news/pvip-agency-mypvip-to-hold-webinar-on-running-a-business-in-malaysia/",
      "/news/watch-the-replay-mypvip-webinar-on-running-a-business-in-malaysia/",
    ],
    guidePath: "/insights/how-to/pvip-and-company-incorporation-malaysia/",
  },
];
