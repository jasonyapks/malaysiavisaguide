import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RootShell, shellMetadata } from "@/components/RootShell";
import { isPrefixedLocale, prefixedLocales } from "@/lib/i18n";

/**
 * Root layout for the translated trees — /zh-hans/… and /zh-hant/….
 *
 * ## Why a dynamic segment rather than two literal folders
 *
 * `zh-hans/` and `zh-hant/` as real directories would mean two copies of every
 * route file, and the two Chinese trees are identical in structure by
 * definition — they differ only in which dictionary they read. One `[locale]`
 * tree means a page added for Simplified cannot be forgotten for Traditional.
 *
 * `generateStaticParams` returns both locales unconditionally, which is what
 * makes this safe under `output: "export"`: a dynamic route whose params come
 * back empty is a hard build failure there, not an empty section. See the
 * comment at the top of next.config.ts for the full version of that trap.
 *
 * This segment does not shadow the English routes. `(en)/about/page.tsx`
 * serves `/about/`; this one only ever produces the two paths named below, so
 * `/about/` is never a candidate for `[locale]`.
 */
export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return shellMetadata(locale);
}

export default async function TranslatedRootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  // Belt and braces: generateStaticParams already limits the built paths to the
  // two real locales, so this only fires if someone adds a param without
  // adding a dictionary. Better a 404 than a page rendered with `undefined`
  // strings throughout.
  if (!isPrefixedLocale(locale)) notFound();

  return <RootShell locale={locale}>{children}</RootShell>;
}
