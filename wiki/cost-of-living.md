# Cost of living series: sources

AI-maintained. Every figure in the six cost-of-living articles traces to a file in `raw/cost-of-living/` or to the URL listed there. Snapshot date for all: 2026-10-23.

## Articles

| # | Path under `content/insights/` | Status |
|---|---|---|
| 1 | `expat-living/cost-of-living-kuala-lumpur-foreigner` (hub) | Draft |
| 2 | `expat-living/kl-neighbourhoods-rent-for-expats` | Draft |
| 3 | `expat-living/healthcare-insurance-costs-kl-expats` | Draft |
| 4 | `expat-living/international-school-fees-kl` | Draft |
| 5 | `expat-living/kl-daily-costs-cars-groceries-alcohol` | Draft |
| 6 | `comparisons/kl-vs-penang-vs-johor-bahru-cost-of-living` | Draft |

## Sources in `raw/cost-of-living/`

| Topic | File | What it gives |
|---|---|---|
| Household spending | `2026-10-23-dosm-hes-2024-state-tables.txt` | DOSM HES 2024 excerpt: KL mean RM8,178 / median RM6,789; Penang 5,850 / 4,860; Johor 5,927 / 5,280; per capita; Table 3.1 composition by state. The 18 MB PDF isn't stored; its URL is in the file header. |
| Rent | `2026-10-23-propertyguru-rent-sample.json` | Asking-rent quartiles by bedroom count for 10 KL areas and 7 Penang/Johor areas. Only the summary is stored, not the individual listings. |
| Foreigner hospital charges | `2026-10-23-moh-caj-bagi-warga-asing.txt` | MOH outpatient and ward rates for foreigners (page updated 23 Sep 2025). |
| SST for non-citizens | `2026-10-23-mysst-faq-expansion-service-tax-2025.html` | 6% on private healthcare for non-citizens; 6% on private education above RM60k; residential rent not taxable. |
| Exchange rate | `2026-10-23-bnm-exchange-rate-1200.json` | BNM 12:00 rates; USD middle 4.0848. |
| Schools | `2026-10-23-garden-international-school-fees-2026-27.txt`, `…-alice-smith-fees-2026-27.pdf`, `…-iskl-fees-2026-27.txt`, `…-nexus-fees-2026-27.html`, `…-uplands-penang-fees-2026-27.txt`, `…-dalat-penang-fees-2026-27.html` | Published 2026/27 schedules. |
| MM2H study permission and insurance | `2026-10-23-motac-mm2h-application-guidelines-booklet-2026-05.pdf` | Item 6, Permission to Study (14 working days); renewal needs health insurance only if under 60. |
| Child age limits | `2026-10-23-school-pass-notes.txt` | Per-programme dependant ages, from `src/lib/data/programmes.ts`. |
| Healthcare and insurance | `2026-10-23-healthcare-insurance-notes.txt` | Hospital package prices, GP fee order, BNM repricing measures, MediAsas. |
| Fuel and transport | `2026-10-23-fuel-transport.txt` | RON95 RM1.99 (BUDI95) vs RM4.32 unsubsidised, 22–28 Oct 2026; My50 vs Rapid Bulanan. |
| Grocery prices | `2026-10-23-pricecatcher-october-2026-medians.txt` | KPDN PriceCatcher medians for KL, Penang and Johor. |

## Known weak points (re-check before publishing)

- **Petrol** is weekly. The price comes from paultan.org's tracker of MOF releases, because the MOF feed was empty.
- **The GP fee range of RM10–80** rests on a Malay Mail headline. The gazette PDF (P.U.(A) 150/2026) returns 403.
- **Alcohol excise** (beer RM192.50/L of pure alcohol) comes from a news report, not the gazetted order.
- **Penang and Johor foreign-buyer property floors** conflict across sources, so the articles don't state them.
- **Whether non-citizens can enrol in MediAsas** isn't stated by any source.
- **Whether an Employment Pass Category III holder can bring dependants:** `programmes.ts` says "Spouse (salary above RM5,000 required)". The hub article tells readers to check their category.
