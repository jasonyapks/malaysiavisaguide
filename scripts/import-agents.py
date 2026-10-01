#!/usr/bin/env python3
"""
Turn the official agent registers into src/lib/data/agents.json.

    python3 scripts/import-agents.py 2026-10-01

Reads the snapshots saved under raw/agents/<date>-*. It does not fetch anything:
snapshot first (see wiki/agents.md), import second, so every entry on the site
traces to a file in raw/ that nobody has edited.

  - MM2H, primary: MOTAC's licensed-MM2H-company register on motac.gov.my. The
    page loads its list over admin-ajax; the snapshot is that JSON response.
  - MM2H, cross-check: the "Licensed MM2H Companies" table on mm2h.gov.my. It is
    also MOTAC's, but it lags: on 2026-10-01 it still showed 36 licences at
    their pre-renewal expiry and 12 expired licences the motac.gov.my register
    had already dropped. It is kept for its validity dates (shown beside
    MOTAC's when they differ), its emails (motac.gov.my prints none) and the
    licences missing from motac.gov.my.
  - PVIP: the Immigration Department's authorised-agency PDF.

Fields are copied as the registers print them. Derived: the state (from the
postcode when a register prints none), the merge of one company across
registers (exact normalised name only), and `related` — companies under a
different name that share an email domain, phone number or office unit with
this one. `related` states the shared detail; it does not claim ownership.

Local only, not part of the build. Needs PyMuPDF (`pip install pymupdf`).
"""
import html
import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
date = sys.argv[1] if len(sys.argv) > 1 else sys.exit("usage: import-agents.py <YYYY-MM-DD>")
MOTAC = ROOT / f"raw/agents/{date}-motac-mm2h-companies.json"
MM2HGOV = ROOT / f"raw/agents/{date}-mm2hgov-agencies.html"
IMI = ROOT / f"raw/agents/{date}-imi-pvip-agencies.pdf"
OUT = ROOT / "src/lib/data/agents.json"

# Display names for the Malay/register spellings of each state.
STATE_NAMES = {
    "Wilayah Persekutuan Kuala Lumpur": "Kuala Lumpur",
    "Wilayah Persekutuan Putrajaya": "Putrajaya",
    "Wilayah Persekutuan Labuan": "Labuan",
    "Pulau Pinang": "Penang",
}

# Postcode ranges, for registers that print no state field.
POSTCODES = [
    (1000, 2999, "Perlis"), (5000, 9999, "Kedah"), (10000, 14999, "Penang"),
    (15000, 18999, "Kelantan"), (20000, 24999, "Terengganu"), (25000, 28999, "Pahang"),
    (30000, 36999, "Perak"), (39000, 39999, "Pahang"), (40000, 48999, "Selangor"),
    (49000, 49999, "Pahang"), (50000, 60999, "Kuala Lumpur"), (62000, 62999, "Putrajaya"),
    (63000, 68999, "Selangor"), (69000, 69999, "Pahang"), (70000, 73999, "Negeri Sembilan"),
    (75000, 78999, "Melaka"), (79000, 86999, "Johor"), (87000, 87999, "Labuan"),
    (88000, 91999, "Sabah"), (93000, 98999, "Sarawak"),
]

FREE_MAIL = {"gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "live.com", "icloud.com"}


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<.*?>", " ", s or ""))).strip()


def norm(name):
    """Comparison key only — never displayed."""
    n = re.sub(r"\bSD[NH]\b|\bBHD\b", "", name.upper())
    return re.sub(r"[^A-Z0-9]", "", n)


def licence_key(lic):
    """'KPK/LN: MM2H 0946' and 'MM2H946' are the same licence."""
    l = lic.upper().replace(" ", "").replace("KPK/LN:", "")
    m = re.match(r"MM2H0*(\d+)(/\d+)?$", l)
    return f"MM2H{m.group(1)}{m.group(2) or ''}" if m else l


def postcode(address):
    m = re.findall(r"\b(\d{5})\b", address or "")
    return m[-1] if m else None


def state_from_postcode(address):
    code = postcode(address)
    if code:
        for lo, hi, st in POSTCODES:
            if lo <= int(code) <= hi:
                return st
    return None


def iso(d):
    """dd/mm/yy or dd/mm/yyyy -> yyyy-mm-dd."""
    d, m, y = d.strip(" ~").split("/")
    return f"{y if len(y) == 4 else '20' + y}-{m}-{d}"


def phones(*values):
    """Last nine digits of every number — enough to compare 03-… with +603…."""
    out = set()
    for v in values:
        for p in re.split(r"/|,", v or ""):
            digits = re.sub(r"\D", "", p)
            if len(digits) >= 8:
                out.add(digits[-9:])
    return out


def unit(address):
    """The office-unit token (e.g. 'C4-3-6', '10-1'), for same-office matching."""
    m = re.search(r"\b([A-Z]?\d+[A-Z]?(?:-[A-Z0-9]+)+)\b", (address or "").upper())
    return m.group(1) if m else None


# --- readers ----------------------------------------------------------------

def motac():
    page = json.loads(MOTAC.read_text())["data"]
    out = []
    for card in page["html"].split('<div class="motac-card">')[1:]:
        card = re.sub(r"<svg.*?</svg>", "", card, flags=re.S)

        def field(cls):
            m = re.search(r'class="%s">(.*?)</div>' % re.escape(cls), card, re.S)
            return clean(m.group(1)) if m else None

        address = field("company-address")
        state = address.rsplit(",", 1)[-1].strip()
        valid = re.findall(r"<span>(.*?)</span>", card.split("col-tempoh")[1])
        out.append({
            "name": field("company-name"),
            "licence": field("col col-lesen"),
            "office": "HQ" if field("col col-jenis") == "Ibu Pejabat" else "Branch",
            "address": address,
            "state": STATE_NAMES.get(state, state),
            "phone": field("company-phone"),
            "valid": [iso(valid[0]), iso(valid[1])],
        })
    assert len(out) == int(page["total"]), f"MOTAC: parsed {len(out)} of {page['total']}"
    return out


def mm2hgov():
    page = MM2HGOV.read_text()
    table = page[page.find("<table"):page.find("</table>")]
    out = []

    def cf(hexstr):  # Cloudflare's email obfuscation: XOR with the first byte.
        b = bytes.fromhex(hexstr)
        return bytes(x ^ b[0] for x in b[1:]).decode()

    for row in re.findall(r"<tr.*?</tr>", table, re.S)[1:]:
        tds = re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)
        name = clean(re.search(r"<strong>(.*?)</strong>", tds[0], re.S).group(1))
        address = clean(tds[0].split("<br/>", 1)[1]) if "<br/>" in tds[0] else ""
        emails = [cf(h) for h in re.findall(r'data-cfemail="([0-9a-f]+)"', tds[2])]
        frm, to = clean(tds[4]).split(" - ")
        st = re.sub(r"^WP ", "", address.rsplit(",", 1)[-1].strip()).title()
        out.append({
            "name": name,
            "licence": clean(tds[1]),
            "address": address,
            "state": STATE_NAMES.get(st, None) or (st if st in {s for *_, s in POSTCODES} else state_from_postcode(address)),
            "phone": clean(tds[3]),
            "email": [e.lower() for e in emails],
            "valid": [iso(frm), iso(to)],
        })
    assert out, "mm2h.gov.my: no rows parsed"
    return out


def imi():
    out = []
    for page in fitz.open(IMI):
        for table in page.find_tables().tables:
            for row in table.extract():
                if not (row[0] or "").strip().isdigit():
                    continue  # header and spacer rows
                _, name, address, phone, email = [(c or "").strip() for c in row]
                address = re.sub(r"\s*\n\s*", " ", address)
                out.append({
                    "no": int(row[0]),
                    "name": re.sub(r"\s*\n\s*", " ", name),
                    "address": address,
                    "state": state_from_postcode(address),
                    "phone": " / ".join(p.strip() for p in phone.split("\n") if p.strip()),
                    "email": [e.strip() for e in email.split("\n") if e.strip()],
                })
    nos = [r["no"] for r in out]
    assert nos == list(range(1, len(out) + 1)), f"PVIP rows out of sequence: {nos}"
    for r in out:
        del r["no"]
    return out


# --- merge ------------------------------------------------------------------

def main():
    mot, gov, pvip = motac(), mm2hgov(), imi()
    notes = []

    # 1. One record per MM2H licence: motac.gov.my first, mm2h.gov.my beside it.
    licences = {}
    for m in mot:
        licences[licence_key(m["licence"])] = {
            "name": m["name"], "licence": m["licence"], "office": m["office"],
            "address": m["address"], "state": m["state"], "phone": m["phone"],
            "email": [], "motac": m["valid"], "mm2hgov": None,
        }
    unmatched = []
    for g in gov:
        rec = licences.get(licence_key(g["licence"]))
        if rec:
            rec["mm2hgov"] = g["valid"]
            rec["email"] = g["email"]
        else:
            unmatched.append(g)
    for g in unmatched:
        # Same company and dates under another number (DZH: 0050 vs 1095).
        twin = [r for r in licences.values()
                if norm(r["name"]) == norm(g["name"]) and r["mm2hgov"] is None and r["motac"] == g["valid"]]
        if len(twin) == 1:
            twin[0].update(mm2hgov=g["valid"], email=g["email"], mm2hgovLicence=g["licence"])
            notes.append(f"{g['name']}: mm2h.gov.my licence {g['licence']} = motac.gov.my {twin[0]['licence']} (same dates)")
            continue
        licences[licence_key(g["licence"])] = {
            "name": g["name"], "licence": g["licence"].replace("KPK/LN: ", "").replace("KPK/LN:", ""),
            "office": "HQ", "address": g["address"], "state": g["state"], "phone": g["phone"],
            "email": g["email"], "motac": None, "mm2hgov": g["valid"],
        }

    # 2. One record per company, across MM2H and PVIP.
    companies = {}
    for lic in licences.values():
        c = companies.setdefault(norm(lic["name"]), {"name": lic["name"], "mm2h": [], "pvip": None})
        c["mm2h"].append({k: v for k, v in lic.items() if k != "name"})
    for p in pvip:
        c = companies.setdefault(norm(p["name"]), {"name": p["name"], "mm2h": [], "pvip": None})
        c["pvip"] = {k: v for k, v in p.items() if k != "name"}
    for key, c in companies.items():
        c["id"] = key.lower()
        # Licences on the current register first, HQ before branch.
        c["mm2h"].sort(key=lambda l: (l["motac"] is None, l["office"] != "HQ", l["licence"]))

    # 3. Shared contact details between differently-named companies.
    def contact(c):
        emails = {e.lower() for l in c["mm2h"] for e in l["email"]}
        addrs = [l["address"] for l in c["mm2h"]]
        tel = phones(*(l["phone"] for l in c["mm2h"]))
        if c["pvip"]:
            emails |= {e.lower() for e in c["pvip"]["email"]}
            addrs.append(c["pvip"]["address"])
            tel |= phones(c["pvip"]["phone"])
        domains = {e.split("@")[1] for e in emails if "@" in e} - FREE_MAIL
        offices = {(postcode(a), unit(a)) for a in addrs if postcode(a) and unit(a)}
        return domains, tel, offices

    info = {k: contact(c) for k, c in companies.items()}
    keys = list(companies)
    for i, a in enumerate(keys):
        for b in keys[i + 1:]:
            da, ta, oa = info[a]
            db, tb, ob = info[b]
            basis = []
            if da & db:
                basis.append("email domain")
            if ta & tb:
                basis.append("phone number")
            if oa & ob:
                basis.append("office address")
            if not basis:
                continue
            for x, y in ((a, b), (b, a)):
                companies[x].setdefault("related", []).append(
                    {"id": companies[y]["id"], "name": companies[y]["name"], "shared": basis})

    rows = sorted(companies.values(), key=lambda c: c["name"].upper())
    OUT.write_text(json.dumps({"checked": date, "companies": rows}, indent=1, ensure_ascii=False) + "\n")

    # --- report -------------------------------------------------------------
    on_mot = sum(1 for l in licences.values() if l["motac"])
    only_gov = [l for l in licences.values() if not l["motac"]]
    differ = [l for l in licences.values() if l["motac"] and l["mm2hgov"] and l["motac"][1] != l["mm2hgov"][1]]
    print(f"MM2H licences: {len(licences)} ({on_mot} on motac.gov.my, {len(only_gov)} only on mm2h.gov.my)")
    print(f"  expiry differs between the two MOTAC sites: {len(differ)}")
    for l in only_gov:
        print(f"  only on mm2h.gov.my: {l['name']} {l['licence']} valid to {l['mm2hgov'][1]}")
    for n in notes:
        print(f"  {n}")
    print(f"PVIP agencies: {len(pvip)}   companies: {len(rows)}")
    print(f"On both MM2H and PVIP: {sum(1 for r in rows if r['mm2h'] and r['pvip'])}")
    print("Shared contact details (shown on the site as 'shares … with'):")
    seen = set()
    for r in rows:
        for rel in r.get("related", []):
            pair = tuple(sorted([r["id"], rel["id"]]))
            if pair not in seen:
                seen.add(pair)
                print(f"  {r['name']}  <->  {rel['name']}: {', '.join(rel['shared'])}")
    missing = [r["name"] for r in rows if r["pvip"] and not r["pvip"]["state"]]
    if missing:
        print(f"PVIP with no state from postcode — fix by hand: {missing}")
    print(f"Wrote {OUT.relative_to(ROOT)}")


main()
