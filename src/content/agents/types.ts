import type { ReactNode } from "react";
import type { AgentProgramme, LicenceStatus, Related } from "@/lib/data/agents";

/**
 * The licensed-agent directory's copy, per locale.
 *
 * Only the page's own words are translated. Everything copied from a register
 * — company names, licence numbers, addresses, phones, emails, the registers'
 * own titles — is printed as the register prints it, in every locale (Jason's
 * call, 2026-10-01): a reader matching a contract against the list needs the
 * exact string the government published, not a translation of it.
 *
 * `Href` resolves a canonical path for the page's locale (see linkPath).
 */
type Href = (path: string) => string;

/** Strings only — this half crosses into the client component. */
export type FilterCopy = {
  searchLabel: string;
  /** "{label}" is replaced with MM2H or PVIP. */
  placeholder: string;
  stateLabel: string;
  allStates: string;
  statusLabel: string;
  anyStatus: string;
  /** "{n}" is replaced with the count. */
  validNow: string;
  lapsed: string;
  /** "{shown}" and "{total}" are replaced. */
  showing: string;
  total: string;
  clear: string;
  noMatch: string;
};

export type AgentsCopy = {
  hub: {
    meta: { title: string; description: string };
    title: string;
    standfirst: ReactNode;
    cardTitle: Record<AgentProgramme, string>;
    cardBody: (count: number, publisher: string, checked: string) => ReactNode;
    why: { heading: string; body: (href: Href) => ReactNode };
  };
  list: Record<
    AgentProgramme,
    {
      /** `terminated`: PVIP agencies reported terminated (0 for MM2H). */
      meta: {
        title: string;
        description: (count: number, terminated: number) => string;
      };
      title: string;
      standfirst: ReactNode;
      guideLabel: string;
    }
  > & {
    breadcrumb: string;
    guideLine: (link: ReactNode) => ReactNode;
  };
  /** The registers' publishers, in the reader's language. */
  publisher: Record<AgentProgramme, string>;
  disclosure: (href: Href) => ReactNode;
  checklist: (href: Href) => ReactNode;
  directory: {
    source: (p: {
      register: ReactNode;
      publisher: string;
      checked: ReactNode;
      mm2hgov: ReactNode | null;
    }) => ReactNode;
    searchHeading: (label: string) => string;
    statusAsAt: (date: ReactNode) => ReactNode;
    status: Record<LicenceStatus, string>;
    pvipStatus: { active: string };
    /** Added to the PVIP source paragraph: who reported the terminations, when. */
    pvipTerminations: (p: {
      count: number;
      month: string;
      by: string;
      on: string;
      listDated: string;
    }) => ReactNode;
    row: {
      licence: string;
      status: string;
      validity: string;
      address: string;
      phone: string;
      email: string;
    };
    mm2hgovPrints: (licence: ReactNode) => ReactNode;
    validityFrom: { motac: string; mm2hgov: string };
    mm2hgovShows: (range: string) => string;
    alsoOn: (label: string, link: ReactNode) => ReactNode;
    alsoOnLink: (label: string) => string;
    shares: (shared: string, company: ReactNode) => ReactNode;
    shared: Record<Related["shared"][number], string>;
    joinList: (items: string[]) => string;
    schemaName: (label: string, register: string) => string;
  };
  filter: FilterCopy;
  /** Display names for the state filter; the register's own value is the key. */
  states: Record<string, string>;
};
