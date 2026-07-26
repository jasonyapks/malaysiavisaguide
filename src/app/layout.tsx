import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { navRoutes, site } from "@/lib/site";
import { SiteNav } from "@/components/SiteNav";

// Heavy geometric-humanist sans for headings and UI — the Latin equivalent of
// the reference's Pretendard 800.
const heading = Plus_Jakarta_Sans({
  variable: "--font-heading-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Body text. Same family at text weights keeps the page to one voice.
const sans = Plus_Jakarta_Sans({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// High-contrast serif, used ONLY for the single cobalt accent word on a card.
const accent = Playfair_Display({
  variable: "--font-accent-serif",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    // Kept under ~580px rendered, which is where Google truncates a title in
    // the SERP. The previous version ran to 654px, so "explained" — the one
    // word nobody searches for — was the part being cut off.
    default: `${site.name} — PVIP, MM2H, S-MM2H, DE Rantau`,
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
  return (
    <html
      lang="en"
      className={`${heading.variable} ${sans.variable} ${accent.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* One white sticky bar — brand left, nav centre, language and CTA right,
            as the reference does it. Our own identity, never a government crest. */}
        <header className="sticky top-0 z-20 border-b border-sand-200 bg-white/92 backdrop-blur">
          {/* SiteNav is `flex-1` (basis 0), so in a wrapping row it swallows all
              free space and shunts the right-hand group onto a second line.
              Stop wrapping once there is room for one row. */}
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 lg:flex-nowrap">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <Mark />
              <span className="leading-tight">
                <span className="block whitespace-nowrap font-serif text-[1.05rem] font-extrabold tracking-tight text-forest-900">
                  {site.name}
                </span>
                {/* The disclaimer strapline is what makes the brand block wide
                    enough to push the nav onto a second row — it only earns its
                    space once there is room for it. */}
                <span className="hidden text-[0.7rem] tracking-wide text-ink-muted xl:block">
                  Independent visa guide · not a government body
                </span>
              </span>
            </Link>
            <SiteNav />
            <div className="flex shrink-0 items-center gap-3">
              <LanguagePill />
              <Link
                href="/contact/"
                className="accent-fill hidden rounded-full px-5 py-2 text-[0.85rem] font-bold transition-transform hover:-translate-y-px lg:inline-block"
              >
                Ask a question
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
          {children}
        </main>

        {/* Ice-blue footer with the entity card and a cobalt pill, mirroring the
            reference's closing block. */}
        <footer className="relative overflow-hidden border-t border-sand-200 bg-linear-to-b from-sand-100 to-[#dbe6f4]">
          <div
            aria-hidden
            className="ring-decor -right-24 -top-40 size-[26rem] opacity-70"
          />
          <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-14 text-[0.95rem]">
            <div className="space-y-3">
              <p className="eyebrow">Malaysia Visa Guide</p>
              <h2 className="max-w-2xl text-2xl font-extrabold sm:text-3xl">
                The programmes, the real numbers, and{" "}
                <span className="font-display accent-text font-medium italic">
                  no sales pitch
                </span>
              </h2>
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap gap-x-6 gap-y-2 font-semibold text-forest-700"
            >
              {navRoutes("site").map((r) => (
                <Link key={r.path} href={r.path} className="hover:text-forest-900">
                  {r.title}
                </Link>
              ))}
            </nav>

            {/* SPEC.md §1 — the commercial relationship is disclosed, always, and
                independence from any government body is stated up front. */}
            <div className="card-lux max-w-3xl p-6">
              <p className="eyebrow mb-2">Publisher &amp; disclosure</p>
              <p className="text-ink-muted">
                An independent guide — not affiliated with the Immigration
                Department of Malaysia or any government agency. Published by
                Jason Yap, Managing Director of MYPVIP, a licensed agency whose
                services are described on{" "}
                <Link
                  href="/about/"
                  className="font-semibold text-forest-700 underline underline-offset-2"
                >
                  the about page
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 border-t border-sand-400/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.85rem] text-ink-muted">
                © {new Date().getFullYear()} {site.name}. All rights reserved.
              </p>
              <Link
                href="/contact/"
                className="accent-fill rounded-full px-8 py-3 font-bold transition-transform hover:-translate-y-px"
              >
                Ask a question
              </Link>
            </div>
          </div>
        </footer>

        {/* Cloudflare Web Analytics — cookieless, privacy-first (SPEC §9 was
            "no analytics in v1"; added deliberately, no cookies, no cross-site
            tracking). Token is public by design. */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token":"${site.webAnalyticsToken}"}`}
        />
      </body>
    </html>
  );
}

/** Our own mark — a cobalt monogram, never the government crest. */
function Mark() {
  return (
    <span
      aria-hidden
      className="accent-fill grid size-11 shrink-0 place-items-center rounded-xl font-serif text-[0.95rem] font-extrabold tracking-tight"
    >
      MVG
    </span>
  );
}

/**
 * A visual echo of the official portal's En / 中文 switch. English is the only
 * language in v1 (SPEC.md §2 — Chinese comes first when localisation lands), so
 * the Chinese segment is shown as not-yet-available rather than a dead link.
 */
function LanguagePill() {
  return (
    <div className="flex items-center overflow-hidden rounded-full border border-sand-200 text-[0.75rem] font-bold">
      <span className="bg-forest-900 px-3 py-1 text-sand-50">EN</span>
      {/* Full-strength ink-muted, not /70: the faded version measured 3.15:1 on
          white, under the 4.5:1 floor. "Not yet available" is carried by the
          unfilled pill segment, not by making the text hard to read. */}
      <span className="px-3 py-1 text-ink-muted" title="Chinese — coming soon">
        中文
      </span>
    </div>
  );
}
