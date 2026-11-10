import type { ReactNode } from "react";

/** Every word on the author page. See AuthorPage.tsx for the structure. */
export type AuthorCopy = {
  meta: { title: string; description: string };
  /** The line under the name. */
  qualifier: string;
  portraitAlt: string;
  /** For the Person schema's `description`. */
  schemaDescription: string;
  bio: ReactNode;
  roles: { heading: string; items: { role: string; where: ReactNode }[] };
  languages: { heading: string; body: string };
  work: {
    heading: string;
    intro: string;
    guides: string;
    insights: string;
    news: (count: number) => ReactNode;
  };
  conflicts: { heading: string; body: ReactNode };
  contact: { heading: string; body: ReactNode };
  aboutLink: ReactNode;
};
