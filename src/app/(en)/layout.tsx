import type { Metadata } from "next";
import { RootShell, shellMetadata } from "@/components/RootShell";

/**
 * Root layout for the English tree, which is served unprefixed at the domain
 * root — `(en)` is a route group, so it contributes nothing to any URL.
 *
 * It is a root layout rather than a nested one because the Chinese tree needs
 * a different `<html lang>`, and that attribute can only be set where `<html>`
 * is rendered. See src/lib/i18n.ts for why English has no prefix, and
 * RootShell for everything these two layouts share.
 */
export const metadata: Metadata = shellMetadata("en");

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="en">{children}</RootShell>;
}
