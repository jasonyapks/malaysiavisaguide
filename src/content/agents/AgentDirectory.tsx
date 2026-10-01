import Link from "next/link";
import {
  agentsFor,
  agentStates,
  licenceStatus,
  mainLicences,
  pvipStatus,
  statusGroup,
  MM2HGOV_SOURCE,
  registers,
  relatedHref,
  type Agent,
  type AgentProgramme,
  type Mm2hLicence,
} from "@/lib/data/agents";
import { PVIP_TERMINATED } from "@/lib/data/agent-status";
import { reviewDate } from "@/lib/format";
import { localeUrl, type Locale } from "@/lib/i18n";
import { linkPath } from "@/lib/translated";
import { AgentFilter } from "./AgentFilter";
import type { AgentsCopy } from "./types";

const LABEL: Record<AgentProgramme, string> = { mm2h: "MM2H", pvip: "PVIP" };

const searchKey = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Disclosure shown above every list. SPEC.md §1: disclosed, not hidden. */
export function AgentDisclosure({
  locale,
  copy,
}: {
  locale: Locale;
  copy: AgentsCopy;
}) {
  return (
    <aside className="rounded-xl border-l-4 border-forest-600 bg-forest-50 px-5 py-4 text-body-sm leading-relaxed text-forest-900 [&_a]:text-forest-700 [&_a]:underline">
      {copy.disclosure((p) => linkPath(p, locale))}
    </aside>
  );
}

export function AgentDirectory({
  programme,
  locale,
  copy,
}: {
  programme: AgentProgramme;
  locale: Locale;
  copy: AgentsCopy;
}) {
  const t = copy.directory;
  const reg = registers[programme];
  const list = agentsFor(programme);
  const listId = `agents-${programme}`;
  // Licence status is worked out when the page is built; the site rebuilds
  // with every news commit, so this is rarely more than a day old.
  const today = new Date().toISOString().slice(0, 10);
  const current = list.filter(
    (a) => statusGroup(a, programme, today) === "current",
  ).length;
  const f = copy.filter;
  const statusOptions = [
    {
      value: "current",
      label: (programme === "mm2h" ? f.validNow : f.pvipActive).replace(
        "{n}",
        String(current),
      ),
    },
    {
      value: "lapsed",
      label: (programme === "mm2h" ? f.lapsed : f.pvipTerminated).replace(
        "{n}",
        String(list.length - current),
      ),
    },
  ];
  const month = new Date(
    `${PVIP_TERMINATED.month}-01T00:00:00Z`,
  ).toLocaleDateString(locale === "en" ? "en-GB" : "zh-CN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.schemaName(LABEL[programme], reg.name),
    numberOfItems: list.length,
    itemListElement: list.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Organization",
        name: a.name,
        url: `${localeUrl(`/agents/${programme}/`, locale)}#${a.id}`,
      },
    })),
  };

  const ext = (href: string, label: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-forest-700 underline"
    >
      {label}
    </a>
  );

  return (
    <div className="space-y-6">
      <p className="text-body-sm text-ink-muted">
        {t.source({
          register: ext(reg.source, reg.name),
          publisher: copy.publisher[programme],
          checked: (
            <strong className="text-ink">
              {reviewDate(reg.lastVerified, locale)}
            </strong>
          ),
          mm2hgov:
            programme === "mm2h" ? ext(MM2HGOV_SOURCE, "mm2h.gov.my") : null,
        })}
        {programme === "pvip" &&
          t.pvipTerminations({
            count: PVIP_TERMINATED.ids.length,
            month,
            by: PVIP_TERMINATED.reportedBy,
            on: reviewDate(PVIP_TERMINATED.reportedOn, locale),
            listDated: reviewDate(PVIP_TERMINATED.listDated, locale),
          })}
      </p>

      <AgentDisclosure locale={locale} copy={copy} />
      <h2 className="font-serif text-h3 font-semibold text-ink">
        {t.searchHeading(LABEL[programme])}
      </h2>
      {programme === "mm2h" && (
        <p className="text-body-sm text-ink-muted">
          {t.statusAsAt(
            <strong className="text-ink">{reviewDate(today, locale)}</strong>,
          )}
        </p>
      )}

      <AgentFilter
        listId={listId}
        states={agentStates(programme).map((s) => [s, copy.states[s] ?? s])}
        total={list.length}
        statusOptions={statusOptions}
        label={LABEL[programme]}
        copy={copy.filter}
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
            today={today}
            locale={locale}
            copy={copy}
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
  today,
  locale,
  copy,
}: {
  agent: Agent;
  programme: AgentProgramme;
  today: string;
  locale: Locale;
  copy: AgentsCopy;
}) {
  const t = copy.directory;
  const other: AgentProgramme = programme === "mm2h" ? "pvip" : "mm2h";
  const states =
    programme === "mm2h"
      ? mainLicences(agent).map((l) => l.state)
      : agent.pvip?.state
        ? [agent.pvip.state]
        : [];
  const onOther =
    other === "mm2h" ? agent.mm2h.length > 0 : agent.pvip !== null;
  // Hash links: resolve the page for this locale, then append the anchor.
  const anchor = (target: string) => {
    const [path, hash] = target.split("#");
    return `${linkPath(path, locale)}#${hash}`;
  };

  return (
    <li
      id={agent.id}
      data-agent=""
      data-states={[...new Set(states)].join("|")}
      data-search={searchKey(agent.name)}
      data-group={statusGroup(agent, programme, today)}
      className="agent-card"
    >
      <h3>{agent.name}</h3>

      {programme === "mm2h"
        ? mainLicences(agent).map((l) => (
            <Licence
              key={l.licence}
              l={l}
              today={today}
              locale={locale}
              copy={copy}
            />
          ))
        : agent.pvip && (
            <dl>
              <Row label={t.row.status}>
                <span
                  className="lic-status"
                  data-status={
                    pvipStatus(agent) === "terminated" ? "expired" : "valid"
                  }
                >
                  {t.pvipStatus[pvipStatus(agent)]}
                </span>
                {pvipStatus(agent) === "terminated" && (
                  <span className="block text-caption text-ink-muted">
                    {t.terminatedNote(
                      reviewDate(PVIP_TERMINATED.listDated, locale),
                    )}
                  </span>
                )}
              </Row>
              <Row label={t.row.address}>{agent.pvip.address}</Row>
              <Row label={t.row.phone}>
                <Phones value={agent.pvip.phone} />
              </Row>
              {agent.pvip.email.length > 0 && (
                <Row label={t.row.email}>
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
          {t.alsoOn(
            LABEL[other],
            <Link
              href={anchor(`/agents/${other}/#${agent.id}`)}
              className="font-medium"
            >
              {t.alsoOnLink(LABEL[other])}
            </Link>,
          )}
        </p>
      )}

      {agent.related?.map((r) => (
        <p
          key={r.id}
          className="mt-3 border-t border-sand-200 pt-3 text-caption text-ink-muted"
        >
          {t.shares(
            t.joinList(r.shared.map((k) => t.shared[k])),
            <Link
              href={anchor(relatedHref(r, programme))}
              className="font-medium"
            >
              {r.name}
            </Link>,
          )}
        </p>
      ))}
    </li>
  );
}

function Licence({
  l,
  today,
  locale,
  copy,
}: {
  l: Mm2hLicence;
  today: string;
  locale: Locale;
  copy: AgentsCopy;
}) {
  const t = copy.directory;
  const status = licenceStatus(l, today);
  const [from, to] = l.motac ?? l.mm2hgov!;
  const govDiffers = l.motac && l.mm2hgov && l.mm2hgov[1] !== l.motac[1];
  const range = (v: [string, string]) =>
    `${reviewDate(v[0], locale)} \u2013 ${reviewDate(v[1], locale)}`;
  return (
    <dl>
      <Row label={t.row.licence}>
        <span className="font-mono">{l.licence}</span>
        {l.mm2hgovLicence && (
          <span className="block text-caption text-ink-muted">
            {t.mm2hgovPrints(
              <span className="font-mono">{l.mm2hgovLicence}</span>,
            )}
          </span>
        )}
      </Row>
      <Row label={t.row.status}>
        <span className="lic-status" data-status={status}>
          {t.status[status]}
        </span>
      </Row>
      <Row label={t.row.validity}>
        {range([from, to])}
        <span className="block text-caption text-ink-muted">
          {l.motac ? t.validityFrom.motac : t.validityFrom.mm2hgov}
          {govDiffers && t.mm2hgovShows(range(l.mm2hgov!))}
        </span>
      </Row>
      <Row label={t.row.address}>{l.address}</Row>
      {l.phone && (
        <Row label={t.row.phone}>
          <Phones value={l.phone} />
        </Row>
      )}
      {l.email.length > 0 && (
        <Row label={t.row.email}>
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
