import type { ReactNode } from "react";

export type EventCopy = {
  title: string;
  /** Format and language, e.g. "Zoom webinar · in English". */
  format: string;
  speakers: string;
  summary: ReactNode;
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
  events: Record<string, EventCopy>;
};
