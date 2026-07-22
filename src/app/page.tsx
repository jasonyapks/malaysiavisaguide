import Link from "next/link";
import { navRoutes } from "@/lib/site";

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="space-y-5">
        <h1 className="text-5xl font-semibold">
          Malaysia&apos;s long-stay visas, explained without the sales pitch
        </h1>
        {/* Answer-first opener — SPEC.md §3. */}
        <p className="text-xl text-ink-muted">
          Four programmes let you live in Malaysia long term: PVIP, MM2H,
          Sarawak MM2H and DE Rantau. They differ enormously in cost, tenure and
          who they suit. This guide covers what each one really requires,
          including applying without an agent.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">The four programmes</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {navRoutes("programmes").map((r) => (
            <li key={r.path}>
              <Link
                href={r.path}
                className="block rounded-lg border border-sand-200 bg-white px-5 py-4 hover:border-forest-300"
              >
                <span className="font-serif text-lg font-semibold text-forest-900">
                  {r.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Work out where you stand</h2>
        <ul className="space-y-2">
          {navRoutes("tools").map((r) => (
            <li key={r.path}>
              <Link href={r.path} className="text-forest-700 underline">
                {r.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="rounded-md border border-sand-200 bg-sand-100 px-5 py-4 text-[0.95rem] text-ink-muted">
        Scaffold only — content lands in SPEC.md §5, steps 2–6.
      </p>
    </div>
  );
}
