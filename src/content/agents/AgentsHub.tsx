import Link from "next/link";
import { registerCount, registers } from "@/lib/data/agents";
import { reviewDate } from "@/lib/format";
import { AgentDisclosure } from "./AgentDirectory";

/**
 * /agents/ — why the register matters, the two lists, and how to vet an
 * agent. English only for now.
 */
export const hubMeta = {
  title: "Licensed MM2H and PVIP agents in Malaysia",
  description:
    "Check that an MM2H or PVIP agent is on the official government register before you pay. Searchable lists copied from MOTAC and the Immigration Department, plus a vetting checklist.",
};

const PROSE =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";

export function AgentsHub() {
  const cards = [
    {
      href: "/agents/mm2h/",
      title: "MM2H: licensed companies",
      count: registerCount("mm2h"),
      reg: registers.mm2h,
    },
    {
      href: "/agents/pvip/",
      title: "PVIP: authorised agencies",
      count: registerCount("pvip"),
      reg: registers.pvip,
    },
  ];

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">Licensed MM2H and PVIP agents</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          Anyone can call themselves a visa consultant. Only the companies on two
          government registers can actually file an MM2H or PVIP application.
          Before you sign or pay anything, find the company on the register
          below.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group block h-full rounded-xl border border-sand-200 bg-white px-6 py-5 transition-colors duration-150 hover:border-forest-600 hover:bg-forest-50 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-forest-700"
            >
              <span className="block font-serif text-h3 font-semibold text-forest-900 underline-offset-4 group-hover:underline">
                {c.title} &rarr;
              </span>
              <span className="mt-2 block text-body-sm text-ink-muted">
                {c.count} companies, copied from the register published by
                the {c.reg.publisher} and checked{" "}
                {reviewDate(c.reg.lastVerified)}. Search by name or filter by
                state.
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <AgentDisclosure />

      <section className={PROSE}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          Why the register is the only check that counts
        </h2>
        <p>
          <strong>PVIP:</strong> the Immigration Department&apos;s list states
          that applications must be submitted through an authorised agency, and
          that there is no direct submission to the Immigration office.
        </p>
        <p>
          <strong>MM2H:</strong> MOTAC&apos;s current guide says an application
          should be submitted through an MM2H tour-operating business licensed
          by the ministry. The{" "}
          <Link href="/visas/mm2h/">MM2H guide</Link> quotes the requirement in
          full.
        </p>
        <p>
          A website, a WhatsApp number or a brand name proves nothing. What
          counts is the registered company name, and for MM2H the licence
          number. Both must match the register.
        </p>
      </section>

      <VettingChecklist />
    </article>
  );
}

/** Shared by the hub and both list pages. */
export function VettingChecklist() {
  return (
    <section className={PROSE}>
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
          <Link href="/visas/pvip/">PVIP guide</Link> sets out what
          Immigration requires of an agency, and how to check it with SSM.
        </li>
        <li>
          <strong>Get the fees in writing, separated.</strong> Government fees
          and the agent&apos;s own fee should be listed as separate lines. For
          MM2H, the government fixes the agency fee itself. The{" "}
          <Link href="/visas/mm2h/">MM2H guide</Link> gives the figures, so
          any quote above them is wrong.
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
    </section>
  );
}
