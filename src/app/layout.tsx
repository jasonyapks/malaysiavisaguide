import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { navRoutes, site } from "@/lib/site";

const serif = Source_Serif_4({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  display: "swap",
});

const sans = Source_Sans_3({
  variable: "--font-body-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — PVIP, MM2H, S-MM2H and DE Rantau explained`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en",
  },
};

// SPEC.md §4.4 — Organization schema sitewide.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        <header className="border-b border-sand-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-8 gap-y-3 px-6 py-5">
            <Link
              href="/"
              className="font-serif text-xl font-semibold text-forest-900"
            >
              {site.name}
            </Link>
            <nav aria-label="Primary" className="flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
              {[...navRoutes("programmes"), ...navRoutes("tools")].map((r) => (
                <Link
                  key={r.path}
                  href={r.path}
                  className="text-ink-muted hover:text-forest-700"
                >
                  {r.title}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
          {children}
        </main>

        <footer className="border-t border-sand-200 bg-forest-900 text-sand-100">
          <div className="mx-auto max-w-5xl space-y-4 px-6 py-10 text-[0.95rem]">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              {navRoutes("site").map((r) => (
                <Link key={r.path} href={r.path} className="hover:underline">
                  {r.title}
                </Link>
              ))}
            </nav>
            {/* SPEC.md §1 — the commercial relationship is disclosed, always. */}
            <p className="max-w-2xl text-sand-100/80">
              An independent guide. Published by Jason Yap, Chairman of the PVIP
              Agent Association and Managing Director of MYPVIP — a licensed
              agency whose services are described on{" "}
              <Link href="/about/" className="underline">
                the about page
              </Link>
              .
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
