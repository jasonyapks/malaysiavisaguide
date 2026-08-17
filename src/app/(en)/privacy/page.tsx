import type { Metadata } from "next";
import Link from "next/link";
import { CookiePreferences } from "@/components/CookiePreferences";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What this site measures, what it stores, who else sees it, and how to turn analytics off — in plain terms.",
  alternates: { canonical: "/privacy/" },
};

/** Shown at the foot of the page. Update whenever the substance changes. */
const LAST_UPDATED = "28 July 2026";

const prose =
  "space-y-4 text-body-sm leading-relaxed text-ink-muted [&_a]:text-forest-700 [&_a]:underline [&_strong]:text-ink";

export default function Page() {
  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <h1 className="text-h1 font-semibold">Privacy</h1>
        <p className="border-l-4 border-forest-600 bg-forest-50 py-4 pl-5 pr-4 text-lead leading-relaxed text-forest-900">
          This site sells nothing, runs no advertising, and has no login. The
          only things it collects are a count of which pages get read and, if you
          send an enquiry, the details you type into the form. Analytics cookies
          default to off in the EEA, the UK and Switzerland, and to on everywhere
          else. Either way, the switch below is yours to change.
        </p>
      </header>

      <section className={prose}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          Who runs this site
        </h2>
        <p>
          Malaysia Visa Guide is written and run by <strong>Jason Yap</strong>,
          who also runs two licensed Malaysian visa agencies — the{" "}
          <Link href="/about/">About page</Link> sets out that conflict of
          interest in full. For anything on this page, including a request to
          see or delete what is held about you, email{" "}
          <a href="mailto:admin@malaysiavisaguide.com">
            admin@malaysiavisaguide.com
          </a>
          .
        </p>
      </section>

      <section className={prose}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          What gets measured
        </h2>
        <p>There are two measurement tools, and they behave differently.</p>
        <p>
          <strong>Cloudflare Web Analytics</strong> runs on every visit. It sets
          no cookies, does not fingerprint your browser, and cannot follow you to
          another site. It reports only aggregate counts — pages viewed, country,
          referring site, broad device type. Because it identifies no one and
          stores nothing on your device, it needs no consent and there is no
          switch for it.
        </p>
        <p>
          <strong>Google Analytics 4</strong> is on by default everywhere except
          the EEA, the UK and Switzerland, where it stays off until you accept
          it — and wherever you are, the switch below always overrides that
          default. It sets cookies in your browser and sends Google the pages
          you viewed, an approximate location derived from your IP address, and
          your device and browser type. Google does not store your IP address
          itself, but it is the one thing here that involves a third party
          building a picture of a visit, which is exactly why there is a switch
          for it. Google handles that data under its{" "}
          <a
            href="https://policies.google.com/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            own privacy policy
          </a>
          .
        </p>
        <p>
          With analytics off, the Google tag still loads, and it still sends one
          cookieless signal per page carrying the address and title of the page
          you are on. What it does not do is write a cookie or store anything on
          your device, so there is no identifier joining one page to the next or
          one visit to the next. Signals sent in that state do not appear in this
          site&apos;s reports.
        </p>
      </section>

      <section className={prose}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          What is stored on your device
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-sand-400">
                <th scope="col" className="py-2 pr-4 font-semibold text-ink">
                  Name
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold text-ink">
                  What it is
                </th>
                <th scope="col" className="py-2 font-semibold text-ink">
                  Set when
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand-200">
                <td className="py-3 pr-4 align-top font-mono text-caption">
                  mvg-consent
                </td>
                <td className="py-3 pr-4 align-top">
                  Your answer to the cookie banner. Stored in your browser, never
                  sent anywhere.
                </td>
                <td className="py-3 align-top">
                  When you accept or decline
                </td>
              </tr>
              <tr className="border-b border-sand-200">
                <td className="py-3 pr-4 align-top font-mono text-caption">
                  _ga, _ga_*
                </td>
                <td className="py-3 pr-4 align-top">
                  Google Analytics. Distinguishes one browser from another so
                  repeat visits are not counted as new people.
                </td>
                <td className="py-3 align-top">
                  Off by default in the EEA, UK &amp; Switzerland; on by
                  default elsewhere
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          That is the whole list. There are no advertising cookies, no social
          media pixels and no cross-site trackers on this site.
        </p>
      </section>

      <section className={prose}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          If you send an enquiry
        </h2>
        <p>
          The <Link href="/contact/">contact form</Link> collects your name,
          email address, the programme you picked and your message. It is
          delivered by <strong>Web3Forms</strong>, a form-forwarding service that
          passes the submission to an email inbox — so your message passes
          through Web3Forms&apos; systems on the way, under their{" "}
          <a
            href="https://web3forms.com/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            privacy policy
          </a>
          .
        </p>
        <p>
          Those details are used to reply to you and nothing else. They are not
          added to a mailing list, not sold, and not passed to either of the visa
          agencies unless you ask to be put in touch. Sending a question does not
          start a visa application.
        </p>
      </section>

      <section className={`${prose} space-y-5`}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          Turning analytics on or off
        </h2>
        <p>
          You can change your mind at any time, and changing it back is no harder
          than granting it in the first place.
        </p>
        <CookiePreferences />
      </section>

      <section className={prose}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          Your rights
        </h2>
        <p>
          This site is read from many countries, so two regimes are worth naming.
          If you are in the UK or EU, the <strong>UK GDPR and EU GDPR</strong>{" "}
          give you the right to ask what is held about you, to have it corrected
          or erased, to object to processing, and to withdraw consent at any
          time — the control above is the withdrawal route for analytics. You may
          also complain to your national data protection authority. If you are in
          Malaysia, the <strong>Personal Data Protection Act 2010</strong> gives
          you comparable rights of access and correction.
        </p>
        <p>
          In practice the only personal data held here is an enquiry you chose to
          send. Email{" "}
          <a href="mailto:admin@malaysiavisaguide.com">
            admin@malaysiavisaguide.com
          </a>{" "}
          and it will be found, sent to you, or deleted on request.
        </p>
      </section>

      <section className={prose}>
        <h2 className="font-serif text-h3 font-semibold text-ink">
          Changes to this policy
        </h2>
        <p>
          If what the site collects changes, this page changes with it and the
          date below moves. A change that widens what is collected will also
          re-ask for consent rather than assuming the old answer still covers it.
        </p>
        <p className="text-caption">
          <strong>Last updated:</strong> {LAST_UPDATED}
        </p>
      </section>
    </article>
  );
}
