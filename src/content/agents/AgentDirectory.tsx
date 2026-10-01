import Link from "next/link";
import {
  agentsFor,
  agentStates,
  companyStatus,
  licenceStatus,
  mainLicences,
  MM2HGOV_SOURCE,
  registers,
  relatedHref,
  type Agent,
  type AgentProgramme,
  type LicenceStatus,
  type Mm2hLicence,
} from "@/lib/data/agents";
import { reviewDate } from "@/lib/format";
import { site } from "@/lib/site";
import { AgentFilter } from "./AgentFilter";

const LABEL: Record<AgentProgramme, string> = { mm2h: "MM2H", pvip: "PVIP" };

const searchKey = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Disclosure shown above every list. SPEC.md §1: disclosed, not hidden. */
export function AgentDisclosure() {
  return (
    <aside className="rounded-xl border-l-4 border-forest-600 bg-forest-50 px-5 py-4 text-body-sm leading-relaxed text-forest-900">
      <strong>Disclosure.</strong> This guide is written by the Managing
      Director of MYPVIP. Two of its companies, MY PR Program Sdn. Bhd. (PVIP)
      and My Premium (MM2H) Sdn. Bhd., appear on these registers. Every listing
      here is copied from the official government register. Companies are in
      alphabetical order, and a listing is not an endorsement.{" "}
      <Link href="/about/" className="text-forest-700 underline">
        About this guide
      </Link>
    </aside>
  );
}

export function AgentDirectory({ programme }: { programme: AgentProgramme }) {
  const reg = registers[programme];
  const list = agentsFor(programme);
  const listId = `agents-${programme}`;
  const other: AgentProgramme = programme === "mm2h" ? "pvip" : "mm2h";
  // Licence status is worked out when the page is built; the site rebuilds
  // with every news commit, so this is rarely more than a day old.
  const today = new Date().toISOString().slice(0, 10);
  const counts =
    programme === "mm2h"
      ? list.reduce(
          (n, a) => ({
            ...n,
            [companyStatus(a, today)]: (n[companyStatus(a, today)] ?? 0) + 1,
          }),
          {} as Partial<Record<LicenceStatus, number>>,
        )
      : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${LABEL[programme]} agents on the ${reg.name}`,
    numberOfItems: list.length,
    itemListElement: list.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Organization",
        name: a.name,
        url: `${site.url}/agents/${programme}/#${a.id}`,
      },
    })),
  };

  return (
    <div className="space-y-6">
      <p className="text-body-sm text-ink-muted">
        Source:{" "}
        <a
          href={reg.source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest-700 underline"
        >
          {reg.name}
        </a>
        , {reg.publisher}. Copied in full and checked on{" "}
        <strong className="text-ink">{reviewDate(reg.lastVerified)}</strong>.
        {programme === "mm2h" && (
          <>
            {" "}
            Cross-checked against MOTAC&apos;s other list, on{" "}
            <a
              href={MM2HGOV_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 underline"
            >
              mm2h.gov.my
            </a>
            , which lags behind it. Where the two show different validity dates,
            both are printed. Companies that appear only on mm2h.gov.my are
            included and marked, so you can tell a lapsed licence from a
            misspelt name.
          </>
        )}{" "}
        Where two differently named companies print the same email domain, phone
        number or office address, both cards say so. That is a fact from the
        registers, not a finding that the companies are connected, so ask if it
        matters to you. Licences are granted and withdrawn between our checks,
        so confirm on the official source before you sign anything.
      </p>

      <AgentDisclosure />
      <h2 className="font-serif text-h3 font-semibold text-ink">
        Search the {LABEL[programme]} register
      </h2>
      {programme === "mm2h" && (
        <p className="text-body-sm text-ink-muted">
          Licence status is worked out against the validity dates as at{" "}
          <strong className="text-ink">{reviewDate(today)}</strong>.
        </p>
      )}

      <AgentFilter
        listId={listId}
        states={agentStates(programme)}
        total={list.length}
        statusCounts={counts}
        placeholder={`e.g. ${LABEL[programme]} company`}
      />

      <ul
        id={listId}
        className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(22rem,1fr))]"
      >
        {list.map((a) => (
          <AgentCard
            key={a.id}
            agent={a}
            programme={programme}
            other={other}
            today={today}
          />
        ))}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </div>
  );
}

function AgentCard({
  agent,
  programme,
  other,
  today,
}: {
  agent: Agent;
  programme: AgentProgramme;
  other: AgentProgramme;
  today: string;
}) {
  const states =
    programme === "mm2h"
      ? mainLicences(agent).map((l) => l.state)
      : agent.pvip?.state
        ? [agent.pvip.state]
        : [];
  const onOther =
    other === "mm2h" ? agent.mm2h.length > 0 : agent.pvip !== null;

  return (
    <li
      id={agent.id}
      data-agent=""
      data-states={[...new Set(states)].join("|")}
      data-search={searchKey(agent.name)}
      data-status={
        programme === "mm2h" ? companyStatus(agent, today) : undefined
      }
      className="agent-card"
    >
      <h3>{agent.name}</h3>

      {programme === "mm2h"
        ? mainLicences(agent).map((l) => (
            <Licence key={l.licence} l={l} today={today} />
          ))
        : agent.pvip && (
            <dl>
              <Row label="Address">{agent.pvip.address}</Row>
              <Row label="Phone">
                <Phones value={agent.pvip.phone} />
              </Row>
              {agent.pvip.email.length > 0 && (
                <Row label="Email">
                  {agent.pvip.email.map((e, i) => (
                    <span key={e}>
                      {i > 0 && ", "}
                      {/* Printed as the register prints it. Two entries are
                        missing the "@", so they are not turned into links. */}
                      {e.includes("@") ? (
                        <a href={`mailto:${e}`} className="break-all">
                          {e}
                        </a>
                      ) : (
                        <span className="break-all">{e}</span>
                      )}
                    </span>
                  ))}
                </Row>
              )}
            </dl>
          )}

      {onOther && (
        <p className="mt-3 border-t border-sand-200 pt-3 text-caption text-ink-muted">
          Also on the {LABEL[other]} register:{" "}
          <Link href={`/agents/${other}/#${agent.id}`} className="font-medium">
            see {LABEL[other]} listing
          </Link>
        </p>
      )}

      {agent.related?.map((r) => (
        <p
          key={r.id}
          className="mt-3 border-t border-sand-200 pt-3 text-caption text-ink-muted"
        >
          Shares its {joinAnd(r.shared)} with{" "}
          <Link href={relatedHref(r, programme)} className="font-medium">
            {r.name}
          </Link>{" "}
          on the registers
        </p>
      ))}
    </li>
  );
}

const STATUS: Record<LicenceStatus, string> = {
  valid: "\u2713 Valid",
  expiring: "! Expires within 60 days",
  expired: "\u2715 Expired",
  unlisted: "! Not on motac.gov.my register",
};

function Licence({ l, today }: { l: Mm2hLicence; today: string }) {
  const status = licenceStatus(l, today);
  const [from, to] = l.motac ?? l.mm2hgov!;
  const govDiffers = l.motac && l.mm2hgov && l.mm2hgov[1] !== l.motac[1];
  return (
    <dl>
      <Row label="Licence no.">
        <span className="font-mono">{l.licence}</span>
        {l.mm2hgovLicence && (
          <span className="block text-caption text-ink-muted">
            mm2h.gov.my prints this licence as{" "}
            <span className="font-mono">{l.mm2hgovLicence}</span>
          </span>
        )}
      </Row>
      <Row label="Status">
        <span className="lic-status" data-status={status}>
          {STATUS[status]}
        </span>
      </Row>
      <Row label="Validity">
        {reviewDate(from)} &ndash; {reviewDate(to)}
        <span className="block text-caption text-ink-muted">
          {l.motac ? "motac.gov.my register" : "mm2h.gov.my only"}
          {govDiffers && (
            <>
              ; mm2h.gov.my shows {reviewDate(l.mm2hgov![0])} &ndash;{" "}
              {reviewDate(l.mm2hgov![1])}
            </>
          )}
        </span>
      </Row>
      <Row label="Address">{l.address}</Row>
      {l.phone && (
        <Row label="Phone">
          <Phones value={l.phone} />
        </Row>
      )}
      {l.email.length > 0 && (
        <Row label="Email">
          {l.email.map((e, i) => (
            <span key={e}>
              {i > 0 && ", "}
              <a href={`mailto:${e}`}>{e}</a>
            </span>
          ))}
        </Row>
      )}
    </dl>
  );
}

const joinAnd = (xs: string[]) =>
  xs.length < 2
    ? xs.join("")
    : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Registers put several numbers in one field, separated by "/", "//" or ",". */
function Phones({ value }: { value: string }) {
  return value
    .split(/\s*[/,]+\s*/)
    .filter(Boolean)
    .map((p, i) => (
      <span key={p}>
        {i > 0 && " / "}
        <Tel number={p} />
      </span>
    ));
}

function Tel({ number }: { number: string }) {
  const digits = number.replace(/[^0-9]/g, "");
  // Malaysian numbers on the registers are written in national format
  // (03-…, 012-…); one PVIP entry has "607-…", already country-coded.
  const e164 = digits.startsWith("60") ? `+${digits}` : `+6${digits}`;
  return <a href={`tel:${e164}`}>{number}</a>;
}
