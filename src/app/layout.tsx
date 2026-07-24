import type { Metadata } from "next";
import { Poppins, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { navRoutes, site } from "@/lib/site";

// Bold geometric sans for headings, echoing the official portal's display type.
const heading = Poppins({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
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
    // Relative path resolves against metadataBase, so the absolute og:image URL
    // follows site.url automatically at domain cutover. Per-page title and
    // description flow into og:title/og:description; the image is sitewide.
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Malaysia Visa Guide — an independent guide to PVIP, MM2H, Sarawak MM2H, DE Rantau and the Student and Employment passes.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
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
  const navLinks = [
    ...navRoutes("programmes"),
    ...navRoutes("work-study"),
    ...navRoutes("tools"),
  ];

  return (
    <html lang="en" className={`${heading.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Row 1 — white brand bar. Our own identity, never the government crest. */}
        <div className="border-b border-sand-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid size-11 place-items-center rounded-lg bg-forest-900 font-serif text-lg font-bold text-sand-50"
              >
                MV
              </span>
              <span className="leading-tight">
                <span className="block font-serif text-lg font-bold text-forest-900">
                  {site.name}
                </span>
                <span className="block text-[0.8rem] text-ink-muted">
                  Independent visa guide · not a government body
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* Row 2 — pale-cyan navigation band with a language pill. */}
        <header className="sticky top-0 z-20 border-b border-sand-200 bg-sand-100/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
            <Link
              href="/"
              aria-label="Home"
              className="text-forest-700 hover:text-forest-900"
            >
              <HomeIcon />
            </Link>
            <nav
              aria-label="Primary"
              className="flex flex-1 flex-wrap gap-x-5 gap-y-1 text-[0.95rem] font-medium"
            >
              {navLinks.map((r) => (
                <Link
                  key={r.path}
                  href={r.path}
                  className="text-forest-700 hover:text-forest-900"
                >
                  {r.title}
                </Link>
              ))}
            </nav>
            <LanguagePill />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
          {children}
        </main>

        <footer className="bg-forest-900 text-sand-100">
          <div className="mx-auto max-w-6xl space-y-4 px-6 py-12 text-[0.95rem]">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              {navRoutes("site").map((r) => (
                <Link key={r.path} href={r.path} className="hover:underline">
                  {r.title}
                </Link>
              ))}
            </nav>
            {/* SPEC.md §1 — the commercial relationship is disclosed, always, and
                independence from any government body is stated up front. */}
            <p className="max-w-2xl text-sand-100/80">
              An independent guide — not affiliated with the Immigration
              Department of Malaysia or any government agency. Published by Jason
              Yap, Chairman of the PVIP Agent Association and Managing Director of
              MYPVIP, a licensed agency whose services are described on{" "}
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

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

/**
 * A visual echo of the official portal's En / 中文 switch. English is the only
 * language in v1 (SPEC.md §2 — Chinese comes first when localisation lands), so
 * the Chinese segment is shown as not-yet-available rather than a dead link.
 */
function LanguagePill() {
  return (
    <div className="flex items-center overflow-hidden rounded-full border border-sand-400/50 text-[0.8rem] font-semibold">
      <span className="bg-forest-900 px-3 py-1 text-sand-50">EN</span>
      <span className="px-3 py-1 text-ink-muted/70" title="Chinese — coming soon">
        中文
      </span>
    </div>
  );
}
