# Handoff

## What & Why

The **domain cutover** for malaysiavisaguide.com (SPEC.md §10) is **done**. The Next.js site
now serves on the real domain; the old WordPress box is still running but unreferenced.

Read `SPEC.md` §10 (v1.3) for the runbook and the reasoning behind each record.

## Done

**Domain cutover — complete 2026-07-25:**

- Cloudflare zone `7afcc60082075738aabceb9ae2c9dfd0`, Free plan, active.
  Nameservers `jose.ns.cloudflare.com` / `sharon.ns.cloudflare.com`, confirmed at the
  registry (whois shows Cloudflare only, all mschosting entries gone).
- All 12 DNS records created via API and verified against the pre-cutover live zone.
  DKIM verified byte-for-byte (404 chars, re-entered as one concatenated string).
- **§10b — apex + `www` attached to the Pages project** via the Pages API.
  *`wrangler pages domain add` no longer exists in wrangler 4.113* — there is no domain
  subcommand at all. Use `POST /accounts/{account}/pages/projects/{project}/domains`.
- **Cloudflare did NOT rewrite the apex itself.** Attaching the custom domain left the old
  `A → 103.6.196.47` in place and the domain sat at `initializing`. The flip only happened
  once the apex A was deleted and replaced with a **proxied CNAME → `malaysiavisaguide.pages.dev`**
  (CNAME flattening serves the apex). `www` was repointed the same way.
- **§10e — `site.url` flipped** to `https://malaysiavisaguide.com`, rebuilt, deployed.
  Commit `5a58913` on `main`, pushed.
- Post-cutover checks all pass against the Cloudflare origin (`server: cloudflare`):
  `/`, `/robots.txt`, `/sitemap.xml`, `/visas/pvip/`, `/news/` all 200; `/pvip` and `/pvip/`
  both 301 → `/visas/pvip/`; `/sample-page/` 301 → `/`; `www` 301s to apex.
  Sitemap has 16 URLs and zero stale `pages.dev` references.
- **Mail path untouched and verified after the flip:** 3× MX, `mail`, `webmail`, `ftp` all
  still DNS-only on `103.6.196.47`; SPF still omits `+a`.

**News blog (same day):** `/news/` is a blog with a prerendered page per story, 2 articles
live. Worker `mvg-news` redeployed, migration 002 applied to remote D1.

## The mail question — resolved, but not the way SPEC assumed

SPEC §10 gates the cutover on a test mail to/from `admin@malaysiavisaguide.com`. That test
**fails**, and it is *not* a cutover fault:

> `550 no mailbox by that name is currently available`

A 550 is a hard rejection **from mschosting's mail server** — the sender resolved the domain,
found the MX, connected, and spoke SMTP before being refused. A broken cutover looks nothing
like this (timeout / connection refused / no MX found, plus hours of deferred retries).

**`admin@` appears never to have existed.** The domain was registered 2026-07-03 and hosting
provisioned 2026-07-04 — it is weeks old. There is zero inbound or outbound history for
`admin@malaysiavisaguide.com` anywhere in Jason's Gmail. The only mail this domain has ever
produced is outbound WordPress notifications (`wordpress@`, `jason@`) to jason@mypvip.com.
SPEC's premise that "the domain carries live email" overstated the risk.

**Outstanding:** if `admin@` is wanted, create it in the mschosting/cPanel control panel.
This is a mailbox-provisioning task, not a DNS one. Nothing about the site depends on it.

## Remaining

- **§10f — leave WordPress running, unreferenced, until ~2026-08-08** (two weeks), then ask
  the host to decommission. Rollback insurance.
- Create the `admin@` mailbox in cPanel if it is actually wanted (see above).
- **Unrelated, still open:** Web3Forms key (contact form is in email-fallback mode); 4 news
  items approved-but-unwritten (sources paywalled/bot-blocked); no recency filter on the
  news sweep.

## Traps worth knowing

- **DNS caching will lie to you.** For hours after the flip, the local resolver and even
  `1.1.1.1` still returned `103.6.196.47`, so plain `curl` hit **WordPress** (`server: LiteSpeed`,
  `wp-content` in the body) and `/pvip/` appeared to 200 instead of 301. Always verify with
  `dig @jose.ns.cloudflare.com` and
  `curl --resolve malaysiavisaguide.com:443:104.21.28.166`. Check the `server:` header —
  `cloudflare` means you reached the new site, `LiteSpeed` means you reached the old one.
- **Port 25 is blocked from this machine.** SMTP cannot be probed locally; `nc` connects but
  no banner ever arrives. Mail delivery has to be tested by actually sending.
- **`mail`, `webmail`, `ftp` must stay grey-cloud forever.** Proxying a mail host breaks SMTP
  and fails silently.
- **`ftp` is an A record, not the CNAME-to-apex it originally was.** Now that the apex is a
  proxied CNAME, a CNAME-to-apex would resolve `ftp` to Cloudflare IPs and break FTP.
- **SPF drops `+a +mx`.** `+a` would authorise Cloudflare's proxy IPs now that the apex is
  proxied. Dropping `+mx` was verified safe: `mx3`/`mx4` → `103.7.9.50` + `103.26.41.96`,
  both covered by `se6.mschosting.online` in the include chain (7 lookups, under 10).
- **Rollback** is repointing nameservers at `ns1`, `ns2`, `ns4.mschosting.cloud` at Exabytes.
  The WordPress box is untouched and still serving on `103.6.196.47`.
- News blog: never reproduce publisher text (infringement *and* duplicate content); write an
  original article instead. Expensive model runs on approval only. Articles publish on
  deploy, not approval.

## Next Step

Nothing is blocking. The site is live on the real domain. Pick up either the Web3Forms key,
the 4 unwritten news items, or the news-sweep recency filter — and diary §10f for ~2026-08-08.
