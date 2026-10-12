# Licensed agent directory: sources

AI-maintained. Every figure below cites a file in `raw/agents/`. Pages: `/agents/`, `/agents/mm2h/`, `/agents/pvip/`.

## Registers

| Programme | Register | Publisher | Snapshot | Entries |
|---|---|---|---|---|
| MM2H (primary) | [Licensed MM2H Company](https://www.motac.gov.my/en/kategori-semakan-new/licensed-mm2h-company/) on motac.gov.my | MOTAC | `raw/agents/2026-10-12-motac-mm2h-companies.json` | 253 licences |
| MM2H (cross-check) | [Licensed MM2H Companies](https://www.mm2h.gov.my/agencies) on mm2h.gov.my | MOTAC | `raw/agents/2026-10-12-mm2hgov-agencies.html` | 248 licences, with emails |
| PVIP | [Authorised PVIP Application Agencies (PDF)](https://imigresen-online.imi.gov.my/eservices/doc/AUTHORISED_MALAYSIA_PREMIUM_VISA_PROGRAMME_AGENCIES.pdf) | Immigration Department | `raw/agents/2026-10-12-imi-pvip-agencies.pdf` (PDF dated 5 Oct 2026) | 50 agencies |
| S-MM2H | Not included yet | Sarawak Tourism | | |

- **motac.gov.my:** the register page loads its list through `wp-admin/admin-ajax.php` (`action=motac_semakan_filter`, `kategori=syarikat-mm2h-berlesen`). The snapshot is that JSON response, with all records in one page.
- **mm2h.gov.my:** a static HTML table. Emails are Cloudflare-obfuscated (`data-cfemail`, XOR with the first byte), and the import decodes them. Some licence numbers carry a `KPK/LN:` prefix or leading zeros (`MM2H0050`). Its footer says "Last Update: 10/02/2026", but the table holds dates up to July 2026.
- **PVIP:** the PDF as downloaded. Its table is parsed with PyMuPDF `find_tables()`. The 5 Oct 2026 reissue numbers rows `1.` where the August one printed `1`; the import accepts both and now fails if it parses no rows.
- Earlier snapshots (`2026-10-01-*`) stay in `raw/agents/` as the record of the previous lists.

## Cross-check of the two MOTAC lists (2026-10-01)
Source files: the `2026-10-01` MM2H snapshots. Not recounted on 2026-10-12; see "Changes on 2026-10-12" below for what moved. **motac.gov.my is the more current list**, and mm2h.gov.my lags behind it.
- **234 licences** are on both lists.
  - 38 have different expiry dates. In 36 of them motac.gov.my shows a later, renewed expiry. For example, HTC Services runs to 2031 on motac.gov.my but 2026 on mm2h.gov.my.
  - 2 show a later expiry on mm2h.gov.my: HH Consultants (13 Nov 2028 vs 14 Oct 2028) and Intrasource (13 Apr 2029 vs 13 Apr 2028).
  - Another 107 differ only in the start date.
- **13 licences are on mm2h.gov.my only.**
  - 12 are expired: B.T.T. Sightseeing, DCS, Dyna Eight, Explore Malaysiaku Holidays, Faceveil, Integro My Second Home, Mission, MyWay, Truly Malaysia, TY Teoh, Vantage, and Xero Advisors. **Xero Advisors is still on the PVIP list.**
  - 1 is in date but missing from motac.gov.my: **GET EMPOWER (MM2H) MM2H1065**, valid to 10 Dec 2026. The site shows it as "Not on motac.gov.my register".
- **18 licences are on motac.gov.my only.** These are newer licences, 2 branches, and old-format numbers (YTL Land, Aspire, I-Jaya and others).
- **DZH (MM2H)** is MM2H1095 on motac.gov.my and MM2H0050 on mm2h.gov.my, with the same dates. They are merged, and the card shows both numbers.
- **Name spelling:** motac.gov.my prints "EZT LAND & PROPERTY SERVICE", and mm2h.gov.my prints "…SERVICES".

## Shared contact details between differently named companies
The import derives these (same non-free email domain, same phone number, or the same postcode plus office unit) and prints them on both cards. They are a fact from the registers, not a finding that the companies are connected.

| PVIP agency | MM2H company | Shared |
|---|---|---|
| MY PR Program | My Premium (MM2H) | email domain, phone, office address |
| Agensi Pekerjaan HR Resources | Home Resources (MM2H) | email domain, phone, office address |
| Agensi Wode (MM2H) | Wode (MM2H) | email domain, phone |
| Cosmos Plan | Tropical Resort Lifestyle (MM2H) | email domain, phone |
| GLP International Travel | GLP International (MM2H) | phone, office address |
| Agensi Pekerjaan Ecoworks Solutions | Ecoworks Solutions (MM2H) | office address |
| N.S Vision Marketing | N.S Vision (MM2H) | office address |
| Success Midwest | Objective Consultancy (MM2H) | office address |
| Moore BZI | Moore Tour (MM2H) | office address |
| CK Metro | CK Essential (MM2H) | phone |
| Colourful Privilege | Colorful Consultancy (MM2H) | phone |
| Kilat Jalur | Fukaza Resources (MM2H) | phone |
| My Lifestyle Solutions | Well Home (MM2H) | phone |

## On the site
- **Licence status** is worked out at build time from the validity dates:
  - *Valid*: on motac.gov.my and in date.
  - *Expires within 60 days*.
  - *Expired*.
  - *Not on motac.gov.my register*: in date, but listed only on mm2h.gov.my.
- When the two MOTAC lists print different dates, the card shows both.
- **Head office only.** Branch licences (Alter Domus MM2H810/1 and /2, STF Revenue MM2H864/1, Summerplace MM2H817/1) stay in `agents.json` for the drift check but are not shown. The state filter uses the head-office state. This was Jason's decision on 2026-10-01.
- The search, filter and card list span the browser width (fluid columns, at least 22rem each). The prose stays at reading width.
- **Register typos are shown as printed** (`raw/agents/2026-10-12-imi-pvip-agencies.pdf`):
  - One PVIP email has no `@` (Agensi Aestar, `aestar.consultancy.hotmail.com`), so it is shown as text, not a link.
  - "Agensi Pekerjaan Titans Workforce" is printed without "Sdn. Bhd.".
  - One MOTAC postcode is `818000`.

## Changes on 2026-10-12
Source files: the `2026-10-12` snapshots against the `2026-10-01` ones.

**PVIP: Immigration reissued its list (PDF dated 5 Oct 2026), 74 agencies down to 50.**
- 20 of the 22 agencies Jason Yap reported terminated on 2026-10-01 are gone from it.
- **The other two, PRX International (no. 12) and Success Midwest (no. 32), are still on it.** The site follows Immigration and shows them again; `src/lib/data/agent-status.ts` is now empty and the page prints no termination note.
- 5 more are gone that were not among the 22: Agensi Pekerjaan Global Ace, Aubella (MM2H), Endau Gemilang, Oscar Travel Services, SYCC Solutions.
- 1 added: 7 Star (MM2H), no. 50.
- 1 renamed: Ecoworks Solutions is now printed as Agensi Pekerjaan Ecoworks Solutions Sdn. Bhd.
- Contact details changed: GLP International Travel (phone now 03-89992944), HYM Corporate Services (phone 016-4404318, email koaycheeling@hymgroup.com.my), Cermat Ria (email lormay@hotmail.com), CK Metro (the `012--2995268` typo is fixed).

**MM2H (motac.gov.my, still 253 licences):**
- Abadi Impian (MM2H) is no longer on either list.
- Vantage (MM2H) MM2H1022 is back on motac.gov.my, valid 7 Oct 2026 to 7 Oct 2027. 12 licences are now on mm2h.gov.my only.
- Address or phone changed for Armani Global, PPL Consultancy and Action Realty.

## PVIP terminations (not from a register)
- Empty since 2026-10-12; see above. History: on 2026-10-01 Jason Yap reported 22 PVIP agencies terminated in September 2026 (the agencies struck out in his "PVIP Agency Roster 2026" artifact) while the PDF dated 13 Aug 2026 (`raw/agents/2026-10-01-imi-pvip-agencies.pdf`) still listed them, and the site left them out on his attribution.
- To hide an agency Immigration still lists, add its id to `src/lib/data/agent-status.ts`. The build fails if an id stops matching a PVIP agency, and the page prints the attributed note whenever the list is non-empty.

## Refresh
1. Run `npm run agents:check`. It compares all three sources against the import and blocks nothing. On 2026-10-12 it failed with a Node TLS error (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) even with `--use-system-ca`; `curl` fetched all three sources without trouble, so snapshot with curl if it happens again.
2. If any source changed: save new snapshots as `raw/agents/<today>-motac-mm2h-companies.json`, `<today>-mm2hgov-agencies.html` and `<today>-imi-pvip-agencies.pdf`. Never overwrite old snapshots.
3. Run `python3 scripts/import-agents.py <today>`, review what it prints, update this page, then build.
