import type { ReactNode } from "react";

export type EventCopy = {
  title: string;
  /** Format and language, e.g. "Zoom webinar · in English". */
  format: string;
  speakers: string;
  summary: ReactNode;
  /** Alt text for the event's poster; required when events.ts sets `poster`. */
  posterAlt?: string;
};

export type EventsCopy = {
  meta: { title: string; description: string };
  heading: string;
  lead: string;
  upcoming: { heading: string; none: ReactNode; register: string };
  past: {
    heading: string;
    held: (date: string) => string;
    readGuide: string;
    announcement: string;
    replayStory: string;
  };
  disclosure: string;
  /** The first-visit webinar pop-up (WebinarPopup.tsx). Plain strings only. */
  popup: {
    eyebrow: string;
    /** "Wednesday 18 November · 8pm Malaysia time (UTC+8)" from an ISO date and "20:00". */
    when: (date: string, time: string) => string;
    register: string;
    details: string;
    close: string;
  };
  events: Record<string, EventCopy>;
};
