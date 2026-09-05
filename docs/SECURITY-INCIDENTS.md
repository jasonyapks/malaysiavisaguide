# Security incidents — response runbook

What to do when something goes wrong, and the clock that starts when it does.
Written to be followed under pressure, so it is short and it is specific to what
this site actually holds.

Malaysia's PDPA has carried **mandatory breach notification since 1 June 2025**.
The deadlines below are legal ones, not internal targets.

---

## What we hold, and where the risk actually is

Knowing this in advance is most of the response. The site has no user accounts,
no payments, and no client database — the personal data surface is narrower than
it looks.

| Data | Where it lives | Exposure if breached |
|---|---|---|
| Contact enquiries — name, email, message, programme | Submitted via `/api/contact` → Web3Forms → the admin inbox | Real personal data. The main notifiable surface. |
| Analytics | GA4 + Cloudflare Analytics | Pseudonymous. Consent-gated in the EEA/UK/CH. |
| CMS session | `/admin/`, behind Cloudflare Access | **A GitHub token is held in `localStorage`** — see `public/_headers`. Compromise here means repo write access, not reader data. |
| Site content | Public git repo | Not confidential. |

The two credentials worth protecting hardest are that **GitHub token** and the
**Pages project secrets** (`TURNSTILE_SECRET_KEY`, `WEB3FORMS_ACCESS_KEY`).
Neither is reader data, which is why a compromise there is a security incident
but may not be a *notifiable* one. Decide that deliberately — see below.

---

## The clock

Both deadlines run from **becoming aware**, not from the breach happening.

1. **Within 72 hours** — notify the Personal Data Protection Commissioner, if
   the breach causes or is likely to cause **significant harm** to any data
   subject. The threshold is also treated as met where **more than 1,000
   individuals** are affected.
2. **Within 7 days of that notification** — notify the affected people
   themselves, where significant harm is likely.

Failing to notify is an offence: a fine up to **RM250,000**, up to **2 years**
imprisonment, or both.

If it is genuinely unclear whether the threshold is met, notify. The cost of an
unnecessary notification is an hour of work; the cost of a missed one is the
line above.

---

## Steps

**1. Contain — first, before anything else.**
- Suspected CMS/token compromise: revoke the GitHub token immediately, then
  review recent commits and deployments for anything you did not author.
- Suspected Pages secret exposure: rotate `TURNSTILE_SECRET_KEY` and
  `WEB3FORMS_ACCESS_KEY` in the Pages project, then redeploy.
- Suspected Cloudflare account compromise: reset the password, revoke API
  tokens, review Access policies on `/admin/`.
- Do not delete evidence while containing. Logs are how the assessment gets
  made.

**2. Establish the facts.** Write them down as you go, with times.
- What data, whose, how much, over what window?
- Is it still ongoing?
- How was it discovered?

**3. Assess against the threshold.** Significant harm, or >1,000 people? Record
the reasoning either way — a decision not to notify needs to be as documented as
a decision to notify.

**4. Notify.** The Commissioner within 72 hours; affected people within 7 days
of that. Say what happened, what data, what you have done, and what they should
do.

**5. Write it up afterwards.** What failed, what change prevents a repeat. Add
it to this file if it changes the runbook.

---

## Reporting a vulnerability to us

`public/.well-known/security.txt` publishes `admin@malaysiavisaguide.com` as the
contact. Anything arriving there is treated as step 2 above until shown
otherwise.

---

## Sources

The obligations above are summarised from the following. Where a figure here
disagrees with the regulator, the regulator wins — check before relying on it.

- [Personal Data Protection Commissioner — Guidelines on Data Breach Notification](https://www.pdp.gov.my/ppdpv1/en/akta/personal-data-protection-guidelines-on-data-breach-notification-dbn/)
- [Hogan Lovells — Malaysia imposes data breach reporting](https://www.hoganlovells.com/en/publications/malaysia-imposes-data-breach-reporting-what-your-business-needs-to-know)
- [DLA Piper — Guidelines issued on data breach notification and DPO appointment](https://privacymatters.dlapiper.com/2025/03/malaysia-guidelines-issued-on-data-breach-notification-and-data-protection-officer-appointment/)
- [Tay & Partners — Data breach: the first 72 hours](https://taypartners.com.my/data-breach-the-first-72-hours/)

Last reviewed: 5 September 2026.
