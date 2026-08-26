import Link from "next/link";
import { GuideHead } from "@/components/GuideHead";
import { localeUrl, type Locale } from "@/lib/i18n";
import { isTranslated, linkPath } from "@/lib/translated";
import type { ToolsCopy } from "./types";

const TOOL_PATHS = [
  "/tools/eligibility/",
  "/tools/cost-calculator/",
] as const;

export function ToolsPage({
  locale,
  copy,
}: {
  locale: Locale;
  copy: ToolsCopy;
}) {
  const href = (path: string) => linkPath(path, locale);

  return (
    <div className="space-y-12">
      <ListSchema copy={copy} locale={locale} />

      <header className="space-y-6">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="text-h1 font-semibold">{copy.heading}</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          {copy.description}
        </p>
      </header>

      <section className="space-y-6">
        <GuideHead
          eyebrow={copy.order.eyebrow}
          title={copy.order.title}
          sub={copy.order.sub}
        />

        <ul className="grid gap-6 sm:grid-cols-2">
          {TOOL_PATHS.map((path) => {
            const t = copy.tools[path];
            return (
              <li key={path}>
                <Link
                  href={href(path)}
                  className="card-outline group flex h-full flex-col p-6 transition-transform hover:-translate-y-1"
                >
                  <p className="eyebrow">{t.minutes}</p>
                  <p className="mt-3 font-serif text-h3 font-bold leading-snug text-forest-900">
                    {t.title}
                  </p>
                  <p className="font-display accent-text mt-2 text-lead font-medium italic">
                    {t.question}
                  </p>
                  <p className="mt-4 text-caption leading-relaxed text-ink-muted">
                    {t.body}
                  </p>
                  <p className="mt-6 font-bold text-forest-700">
                    {copy.openLabel} <span aria-hidden>→</span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
        {copy.footnote.before}{" "}
        <Link href={href("/compare/")} className="font-semibold underline">
          {copy.footnote.compareLink}
        </Link>
        {copy.footnote.between}{" "}
        <Link href={href("/visas/pvip/")} className="font-semibold underline">
          {copy.footnote.guideLink}
        </Link>
        {copy.footnote.after}
      </p>
    </div>
  );
}

/**
 * The ItemList crawlers read. URLs are absolute and locale-correct: a Chinese
 * page listing the English URLs would tell Google the two trees hold the same
 * items at the same addresses, which is the "no return tag" pairing failure
 * `translatedRoutes` exists to avoid.
 */
function ListSchema({ copy, locale }: { copy: ToolsCopy; locale: Locale }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.schemaName,
    itemListElement: TOOL_PATHS.map((path, i) => ({
      "@type": "ListItem",
      position: i + 1,
      // Absolute, and pointing at a URL that exists. The cost calculator has no
      // Chinese page, so on a Chinese index it is listed at its English address
      // rather than at a /zh-hans/ URL that would 404 for the crawler.
      url: localeUrl(path, isTranslated(path) ? locale : "en"),
      name: copy.tools[path].title,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
