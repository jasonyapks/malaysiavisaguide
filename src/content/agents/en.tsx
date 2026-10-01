import Link from "next/link";
import type { AgentsCopy } from "./types";

export const copy: AgentsCopy = {
  hub: {
    meta: {
      title: "Licensed MM2H and PVIP agents in Malaysia",
      description:
        "Check that an MM2H or PVIP agent is on the official government register before you pay. Searchable lists copied from MOTAC and the Immigration Department, plus a vetting checklist.",
    },
    title: "Licensed MM2H and PVIP agents",
    standfirst: (
      <>
        Anyone can call themselves a visa consultant. Only the companies on two
        government registers can actually file an MM2H or PVIP application.
        Before you sign or pay anything, find the company on the register
        below.
      </>
    ),
    cardTitle: {
      mm2h: "MM2H: licensed companies",
      pvip: "PVIP: authorised agencies",
    },
    cardBody: (count, publisher, checked) => (
      <>
        {count} companies, copied from the register published by the{" "}
        {publisher} and checked {checked}. Search by name or filter by state.
      </>
    ),
    why: {
      heading: "Why the register is the only check that counts",
      body: (href) => (
        <>
          <p>
            <strong>PVIP:</strong> the Immigration Department&apos;s list states
            that applications must be submitted through an authorised agency,
            and that there is no direct submission to the Immigration office.
          </p>
          <p>
            <strong>MM2H:</strong> MOTAC&apos;s current guide says an
            application should be submitted through an MM2H tour-operating
            business licensed by the ministry. The{" "}
            <Link href={href("/visas/mm2h/")}>MM2H guide</Link> quotes the
            requirement in full.
          </p>
          <p>
            A website, a WhatsApp number or a brand name proves nothing. What
            counts is the registered company name, and for MM2H the licence
            number. Both must match the register.
          </p>
        </>
      ),
    },
  },

  list: {
    mm2h: {
      meta: {
        title: "Licensed MM2H agents: the MOTAC register",
        description: (n) =>
          `All ${n} MOTAC-licensed MM2H companies, searchable by name and state, with licence numbers, validity status and contact details, cross-checked against mm2h.gov.my.`,
      },
      title: "Licensed MM2H agents",
      standfirst: (
        <>
          MOTAC&apos;s current guide routes every MM2H application through a
          tour-operating company it has licensed for MM2H. If the company you
          are talking to is not on its register, it cannot take your file to
          MOTAC. Search the full register below by name, or narrow it by state.
        </>
      ),
      guideLabel: "MM2H guide",
    },
    pvip: {
      meta: {
        title: "Authorised PVIP agents: Immigration's list",
        description: (n) =>
          `All ${n} Immigration-authorised PVIP application agencies, searchable by name and state, with addresses and contact details copied from the official list.`,
      },
      title: "Authorised PVIP agencies",
      standfirst: (
        <>
          Immigration does not accept PVIP applications directly. Every
          application goes through an agency the government has appointed, and
          Immigration publishes the list. If the company you are talking to is
          not on it, it cannot lodge your application. Search the full list
          below by name, or narrow it by state.
        </>
      ),
      guideLabel: "PVIP guide",
    },
    breadcrumb: "Licensed agents",
    guideLine: (link) => <>Costs, requirements and timelines are in the {link}.</>,
  },

  publisher: {
    mm2h: "Ministry of Tourism, Arts and Culture (MOTAC)",
    pvip: "Immigration Department of Malaysia",
  },

  disclosure: (href) => (
    <>
      <strong>Disclosure.</strong> This guide is written by the Managing
      Director of MYPVIP. Two of its companies, MY PR Program Sdn. Bhd. (PVIP)
      and My Premium (MM2H) Sdn. Bhd., appear on these registers. Every listing
      here is copied from the official government register. Companies are in
      alphabetical order, and a listing is not an endorsement.{" "}
      <Link href={href("/about/")}>About this guide</Link>
    </>
  ),

  checklist: (href) => (
    <>
      <h2 className="font-serif text-h3 font-semibold text-ink">
        How to check an agent before you pay
      </h2>
      <ol className="ml-5 list-decimal space-y-2">
        <li>
          <strong>Match the company name, not the brand.</strong> The name on
          your contract and invoices must be a company on the register. A
          referrer, a marketing brand or a &ldquo;partner&rdquo; is not the
          agent, even if they are paid by one.
        </li>
        <li>
          <strong>For MM2H, match the licence number and its dates.</strong>{" "}
          Several unrelated companies on MOTAC&apos;s register have similar
          names. Ask for the licence number in writing and check that it has
          not expired.
        </li>
        <li>
          <strong>For PVIP, ask for the approval letter.</strong> The{" "}
          <Link href={href("/visas/pvip/")}>PVIP guide</Link> sets out what
          Immigration requires of an agency, and how to check it with SSM.
        </li>
        <li>
          <strong>Get the fees in writing, separated.</strong> Government fees
          and the agent&apos;s own fee should be listed as separate lines. For
          MM2H, the government fixes the agency fee itself. The{" "}
          <Link href={href("/visas/mm2h/")}>MM2H guide</Link> gives the
          figures, so any quote above them is wrong.
        </li>
        <li>
          <strong>Pay the registered company.</strong> Pay into an account in
          the company&apos;s registered name, not a personal account.
        </li>
      </ol>
      <h3 className="font-serif text-lead font-semibold text-ink">Red flags</h3>
      <ul className="ml-5 list-disc space-y-2">
        <li>
          A promise of guaranteed approval. The decision belongs to the
          government, not to the agent.
        </li>
        <li>A company name you cannot find on the register.</li>
        <li>Fees quoted only as a single lump sum, or only verbally.</li>
        <li>Being asked to pay an individual rather than the company.</li>
      </ul>
    </>
  ),

  directory: {
    source: ({ register, publisher, checked, mm2hgov }) => (
      <>
        Source: {register}, {publisher}. Copied in full and checked on{" "}
        {checked}.
        {mm2hgov && (
          <>
            {" "}
            Cross-checked against MOTAC&apos;s other list, on {mm2hgov}, which
            lags behind it. Where the two show different validity dates, both
            are printed. Companies that appear only on mm2h.gov.my are included
            and marked, so you can tell a lapsed licence from a misspelt name.
          </>
        )}{" "}
        Where two differently named companies print the same email domain,
        phone number or office address, both cards say so. That is a fact from
        the registers, not a finding that the companies are connected, so ask
        if it matters to you. Licences are granted and withdrawn between our
        checks, so confirm on the official source before you sign anything.
      </>
    ),
    searchHeading: (label) => `Search the ${label} register`,
    statusAsAt: (date) => (
      <>Licence status is worked out against the validity dates as at {date}.</>
    ),
    status: {
      valid: "✓ Valid",
      expiring: "! Expires within 60 days",
      expired: "✕ Expired",
      unlisted: "! Not on motac.gov.my register",
    },
    row: {
      licence: "Licence no.",
      status: "Status",
      validity: "Validity",
      address: "Address",
      phone: "Phone",
      email: "Email",
    },
    mm2hgovPrints: (licence) => <>mm2h.gov.my prints this licence as {licence}</>,
    validityFrom: { motac: "motac.gov.my register", mm2hgov: "mm2h.gov.my only" },
    mm2hgovShows: (range) => `; mm2h.gov.my shows ${range}`,
    alsoOn: (label, link) => (
      <>
        Also on the {label} register: {link}
      </>
    ),
    alsoOnLink: (label) => `see ${label} listing`,
    shares: (shared, company) => (
      <>
        Shares its {shared} with {company} on the registers
      </>
    ),
    shared: {
      "email domain": "email domain",
      "phone number": "phone number",
      "office address": "office address",
    },
    joinList: (xs) =>
      xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`,
    schemaName: (label, register) => `${label} agents on the ${register}`,
  },

  filter: {
    searchLabel: "Search by company name",
    placeholder: "e.g. {label} company",
    stateLabel: "State",
    allStates: "All states",
    statusLabel: "Licence status",
    anyStatus: "Any status",
    validNow: "Valid now ({n})",
    lapsed: "Expired or not on current register ({n})",
    showing: "Showing {shown} of {total} companies",
    total: "{total} companies",
    clear: "Clear filters",
    noMatch:
      "No company on this register matches. Check the spelling against the name on the agent's contract or letterhead. If it is still not here, it is not on the register this page was copied from. Check the official source linked above before you pay anything.",
  },

  states: {},
};
