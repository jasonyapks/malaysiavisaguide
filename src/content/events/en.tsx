import Link from "next/link";
import type { EventsCopy } from "./types";

/**
 * Everything said about an event here comes from the news stories that
 * announced it and carried its replay. No transcript yet — see events.ts.
 */
export const copy: EventsCopy = {
  meta: {
    title: "Webinars and events",
    description:
      "MYPVIP's webinars on Malaysian long-stay visas: upcoming sessions and how to register, and full replays of past sessions with a written version of each.",
  },
  heading: "Webinars and events",
  lead: "Sessions run by MYPVIP on Malaysia's long-stay visas. Upcoming ones are listed with their registration link; past ones stay here with the full recording.",

  upcoming: {
    heading: "Upcoming",
    none: (
      <>
        No session is scheduled at the moment. New dates are announced on the{" "}
        <Link href="/news/">news page</Link> first.
      </>
    ),
    register: "Register",
  },

  past: {
    heading: "Replays",
    held: (date) => `Held ${date}, 8pm Malaysia time (UTC+8)`,
    readGuide: "Read the session as a written guide",
    announcement: "The announcement",
    replayStory: "The replay story",
  },

  disclosure:
    "Disclosure: these sessions are hosted by MYPVIP. Jason Yap, who publishes this guide, is its Managing Director.",

  events: {
    "pvip-visa-to-business-owner-2026-11": {
      title:
        "From PVIP Visa to Business Owner: Unlocking Malaysia's Business Opportunities",
      format: "Zoom webinar · in English · free",
      speakers:
        "Hosted by PVIP consultant Chee Mee Ho, with guest speaker Datin Jiniy Seelan, managing partner of JS Partners Chartered Accountant. Both are MYPVIP business associates.",
      summary: (
        <>
          <p>
            The session runs in three parts. First, PVIP as more than a
            residency: up to 20 years, no minimum stay, and the right to work
            and run your own company. Second, the company itself: why most
            founders choose a Sdn Bhd over a branch or representative office,
            which sectors allow 100% foreign ownership, and how incorporation
            runs through SSM.
          </p>
          <p>
            Third, what comes after incorporation: tax registration, the
            corporate bank account, hiring, and why the tighter Employment Pass
            rules from June 2026 do not apply to PVIP founders. It ends with a
            live Q&amp;A.
          </p>
        </>
      ),
    },
    "pvip-business-opportunities-2026-11-18": {
      title:
        "Unlocking Malaysia's Business Opportunities: A Practical Guide for PVIP Applicants",
      format: "Zoom webinar · in English · free",
      speakers:
        "With PVIP consultant Chee Mee and guest speaker Datin Jiniy Seelan, managing partner of JS Partners Chartered Accountant. Both are MYPVIP business associates.",
      summary: (
        <>
          <p>
            A second run of the 1 November session, in three parts: PVIP as
            more than a residency, setting up your company, and launching and
            growing your business, from PVIP to operations. It ends with a live
            Q&amp;A.
          </p>
        </>
      ),
    },
  },
};
