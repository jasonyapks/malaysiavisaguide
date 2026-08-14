import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
import { localePath, htmlLang, ogLocale, type Locale } from "@/lib/i18n";
import { localisedNavRoutes, site } from "@/lib/site";
import { getUi } from "@/lib/ui";
import { SiteNav } from "@/components/SiteNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import CookieConsent from "@/components/CookieConsent";

/**
 * The document shell — `<html>` down to `</body>`, shared by every root layout.
 *
 * ## Why this is a component and not just the root layout
 *
 * There are two root layouts, `app/(en)/layout.tsx` and `app/[locale]/layout.tsx`,
 * because `<html lang>` has to differ between the English tree and the Chinese
 * ones and there is no API for setting it from a nested segment. Two root
 * layouts means the header, the footer, the consent banner and the analytics
 * block would otherwise exist in duplicate — and a fix applied to one copy and
 * not the other is the kind of bug that only shows up in the language nobody
 * on the team reads. So the layouts are three lines each and everything real
 * lives here.
 */

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

/**
 * Sitewide metadata for a locale. Each root layout exports the result.
 *
 * No `alternates.languages` here: hreflang has to name the *page*, not the
 * site, and a value set on the root layout would be inherited by every page
 * that does not override it — pointing every Chinese article at the Chinese
 * home page. `pageMetadata()` in lib/metadata.ts builds the per-page set.
 */
export function shellMetadata(locale: Locale): Metadata {
  const ui = getUi(locale);
  return {
    metadataBase: new URL(site.url),
    title: {
      // Kept under ~580px rendered, which is where Google truncates a title in
      // the SERP. The previous version ran to 654px, so "explained" — the one
      // word nobody searches for — was the part being cut off.
      default: `${ui.siteName} — PVIP, MM2H, S-MM2H, DE Rantau`,
      template: `%s — ${ui.siteName}`,
    },
    description: ui.siteDescription,
    openGraph: {
      siteName: ui.siteName,
      type: "website",
      locale: ogLocale[locale],
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
}

export function RootShell({
  locale,
  children,
}: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  const ui = getUi(locale);
  const home = localePath("/", locale);
  const contact = localePath("/contact/", locale);

  // SPEC.md §4.4 — Organization schema sitewide. `name` follows the locale so a
  // Chinese SERP shows the Chinese publisher name.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ui.siteName,
    url: site.url,
    description: ui.siteDescription,
  };

  return (
    <html
      lang={htmlLang[locale]}
      className={`${heading.variable} ${sans.variable} ${accent.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* Resolve googletagmanager's DNS early. React 19 hoists this into
            <head>, which is why it can be written here — the same hoisting the
            gtag block at the bottom of this file is careful to work around.

            dns-prefetch rather than preconnect, deliberately: the loader below
            is only created after the document has parsed, so a TLS connection
            opened at page start would sit idle and Lighthouse would score it as
            an unused preconnect. DNS is the part that is genuinely worth
            resolving ahead of the request.

            Nothing here for static.cloudflareinsights.com — that beacon is
            injected at the edge, not by us, and we cannot time a hint to it. */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

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
            <Link href={home} className="flex shrink-0 items-center gap-3">
              <Mark />
              <span className="leading-tight">
                <span className="block whitespace-nowrap font-serif text-body-sm font-extrabold tracking-tight text-forest-900">
                  {ui.siteName}
                </span>
                {/* Stacked, not run on one line: as a single 45-character row
                    this strapline set the width of the whole brand block and
                    pushed the nav onto a second row. Broken in two it is half as
                    wide, which is what lets it appear from `lg` rather than only
                    at `xl`. The mid-dot separator goes with the line break. */}
                <span className="hidden text-eyebrow leading-snug tracking-wide text-ink-muted lg:block">
                  <span className="block whitespace-nowrap">
                    {ui.strapline[0]}
                  </span>
                  <span className="block whitespace-nowrap">
                    {ui.strapline[1]}
                  </span>
                </span>
              </span>
            </Link>
            <SiteNav
              groups={navGroupsFor(locale)}
              menuLabel={ui.menu}
              ariaPrimary={ui.ariaPrimaryNav}
            />
            <div className="flex shrink-0 items-center gap-3">
              <LanguageSwitcher locale={locale} label={ui.ariaLanguage} />
              <Link
                href={contact}
                className="accent-fill hidden rounded-full px-5 py-2 text-caption font-bold transition-transform hover:-translate-y-px lg:inline-block"
              >
                {ui.askQuestion}
              </Link>
            </div>
          </div>
        </header>

        {/* py-8 on phones, py-14 from `sm`. The generous desktop rhythm was
            costing a fifth of a 390px screen before the h1 even appeared, and
            vertical space is the scarcest thing there is on a phone. */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 sm:py-14">
          {children}
        </main>

        {/* Ice-blue footer with the entity card and a cobalt pill, mirroring the
            reference's closing block. */}
        <footer className="relative overflow-hidden border-t border-sand-200 bg-linear-to-b from-sand-100 to-[#dbe6f4]">
          <div
            aria-hidden
            className="ring-decor -right-24 -top-40 size-[26rem] opacity-70"
          />
          <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-14 text-body-sm">
            <div className="space-y-3">
              <p className="eyebrow">{ui.siteName}</p>
              <h2 className="max-w-2xl text-h2 font-extrabold">
                {ui.footer.heading}{" "}
                <span className="font-display accent-text font-medium italic">
                  {ui.footer.headingAccent}
                </span>
              </h2>
            </div>

            <nav
              aria-label={ui.ariaFooterNav}
              className="flex flex-wrap gap-x-6 gap-y-2 font-semibold text-forest-700"
            >
              {/* "reading" as well as "site". The header renders those two
                  sections inside a dropdown that only mounts when opened, so
                  they contribute no crawlable link — the footer is where
                  /insights/ and /news/ are actually reachable by a crawler on
                  every page. Removing this would silently de-link both. */}
              {[
                ...localisedNavRoutes("reading", locale),
                ...localisedNavRoutes("site", locale),
              ].map((r) => (
                <Link key={r.path} href={r.path} className="hover:text-forest-900">
                  {r.title}
                </Link>
              ))}
            </nav>

            {/* SPEC.md §1 — the commercial relationship is disclosed, always, and
                independence from any government body is stated up front. */}
            <div className="card-outline max-w-3xl p-6">
              <p className="eyebrow mb-2">{ui.footer.disclosureTitle}</p>
              <p className="text-ink-muted">
                {ui.footer.disclosureBefore}
                <a
                  href="https://mypvip.com"
                  rel="nofollow noopener"
                  className="font-semibold text-forest-700 underline underline-offset-2"
                >
                  {ui.footer.disclosureMypvip}
                </a>
                {ui.footer.disclosureBetween}
                <Link
                  href={localePath("/about/", locale)}
                  className="font-semibold text-forest-700 underline underline-offset-2"
                >
                  {ui.footer.disclosureAbout}
                </Link>
                {ui.footer.disclosureAfter}
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 border-t border-sand-400/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-caption text-ink-muted">
                © {new Date().getFullYear()} {ui.siteName}. {ui.footer.rights}
              </p>
              <Link
                href={contact}
                className="accent-fill rounded-full px-8 py-3 font-bold transition-transform hover:-translate-y-px"
              >
                {ui.askQuestion}
              </Link>
            </div>
          </div>
        </footer>

        {/* No hand-placed Cloudflare beacon here. One was removed on 2026-07-28:
            its token recorded nothing, because Cloudflare injects its own beacon at
            the edge for this zone under a different site tag (6d5e4a6a…) — that is
            the tag the Worker dashboard queries. Re-adding a beacon tag by hand will
            not help; Cloudflare Web Analytics keeps working without it. */}

        {/* Google Analytics 4 (gtag.js) behind Consent Mode v2. Unlike the
            edge-injected Cloudflare beacon, this sets first-party cookies and shares
            data with Google, so it stays denied until the visitor opts in via
            <CookieConsent />. Pageviews on client-side navigation are handled by GA's
            own Enhanced measurement ("page changes based on browser history events"),
            not by this snippet.

            ORDER MATTERS, and this block loads gtag.js itself rather than sitting
            next to a <script src> tag for it. React 19 hoists src-bearing scripts
            into <head> while leaving inline ones in <body> — which put the loader
            ~31KB *earlier* in the document than the consent defaults meant to gate
            it, so the tag could execute unconsented. Injecting the loader on the
            last line makes the ordering unconditional instead of a hoisting
            side effect. Don't split this back into two tags. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var c = 'denied';
try { if (localStorage.getItem('mvg-consent') === 'granted') c = 'granted'; } catch (e) {}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: c,
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${site.gaMeasurementId}');
var s = document.createElement('script');
s.async = true;
s.src = 'https://www.googletagmanager.com/gtag/js?id=${site.gaMeasurementId}';
document.head.appendChild(s);`,
          }}
        />
        <CookieConsent
          strings={ui.consent}
          privacyHref={localePath("/privacy/", locale)}
        />
      </body>
    </html>
  );
}

/**
 * The nav groups, flattened to exactly what the client component needs.
 *
 * Deliberately not "pass `ui` down": SiteNav is a client component, so
 * everything handed to it is serialised into the RSC payload of every page.
 * Sending the whole dictionary would put the 404 copy and the footer
 * disclosure into the bundle of every route to save one function.
 */
function navGroupsFor(locale: Locale) {
  const ui = getUi(locale);
  return (["programmes", "work-study", "tools", "reading"] as const).map(
    (key) => ({
      key,
      label: ui.navGroups[key],
      items: localisedNavRoutes(key, locale).map((r) => ({
        path: r.path,
        title: r.title,
      })),
    }),
  );
}

/**
 * Our own mark — the towers from the Malaysia Visa Guide logo, never the
 * government crest.
 *
 * Only the icon is used here: the supplied logo is a vertical lockup whose
 * wordmark would duplicate the site name rendered beside it, and stacked type
 * does not fit a horizontal header bar. The full lockup lives at
 * `/logo-full.png` for social and print use.
 *
 * `priority` because it sits in the header of every page — it is always in the
 * initial viewport, so lazy-loading it only delays the LCP region.
 */
function Mark() {
  return (
    <Image
      // WebP at 80×168, not the 126×264 PNG that used to be here. This mark is
      // preloaded on every page — `priority` below — so its weight sits on the
      // critical path sitewide, and 24KB of lossless PNG bought nothing: the
      // slot renders at roughly 27×56 CSS px, so even a 3× display is served
      // more pixels than it can use. 6.6KB now, visually identical at this size.
      src="/logo-mark.webp"
      alt=""
      aria-hidden
      width={80}
      height={168}
      priority
      // h-14 matches the height of the stacked name + two-line strapline beside
      // it, so the towers start and finish with the text block instead of
      // floating short against it. Header height is unchanged — the text block
      // was already the taller of the two.
      className="h-14 w-auto shrink-0"
    />
  );
}
