#!/usr/bin/env node
/**
 * The round-trip test for shared/markdown.ts.
 *
 * `parseBody(writeBody(blocks))` must deep-equal `blocks`. That single property
 * is the correctness proof for moving the CMS onto files: markdown is a safe
 * home for this content only if nothing is lost on the way in, and a lossy
 * compiler would corrupt an article silently — no error, no warning, just a
 * missing footnote or a dropped `ordered` flag on a live page.
 *
 * Two suites, and both matter:
 *
 * **Fixtures** cover all eleven block types and the edge cases no real article
 * happens to contain — a paragraph that begins with `## `, a table cell with a
 * literal pipe, prose that starts with a backslash. Those are exactly the cases
 * that would first appear months from now, in an article nobody re-checked.
 *
 * **Live documents** are the ones that actually have to survive the migration.
 * The fixtures prove the grammar; these prove it against what Jason wrote.
 *
 * Run: npm run test:markdown          (fixtures + live)
 *      npm run test:markdown -- --offline   (fixtures only)
 *
 * Deep equality here is strict about key *presence*, not just value: `{}` and
 * `{ ordered: false }` are different documents, and an emitter that normalises
 * an absent optional key into a default would pass a looser test and still
 * produce files that no longer match their source.
 */
import process from "node:process";
import { parseBody, writeBody } from "../shared/markdown.ts";
import {
  splitContentFile,
  writeContentFile,
} from "../shared/frontmatter.ts";

const INSIGHTS_API =
  process.env.INSIGHTS_API_URL ??
  "https://mvg-news.jason-6bf.workers.dev/api/cms/insights";

// --- Strict deep equality ---------------------------------------------------

function equal(a, b, path = "") {
  if (a === b) return null;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return `${path}: one is an array, the other is not`;
    }
    if (a.length !== b.length) {
      return `${path}: length ${a.length} became ${b.length}`;
    }
    for (let i = 0; i < a.length; i++) {
      const err = equal(a[i], b[i], `${path}[${i}]`);
      if (err) return err;
    }
    return null;
  }

  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.join(",") !== kb.join(",")) {
      const lost = ka.filter((k) => !kb.includes(k));
      const gained = kb.filter((k) => !ka.includes(k));
      return (
        `${path}: keys differ` +
        (lost.length ? ` — lost ${lost.join(", ")}` : "") +
        (gained.length ? ` — gained ${gained.join(", ")}` : "")
      );
    }
    for (const k of ka) {
      const err = equal(a[k], b[k], `${path}.${k}`);
      if (err) return err;
    }
    return null;
  }

  return `${path}: ${JSON.stringify(a)} became ${JSON.stringify(b)}`;
}

// --- Harness ----------------------------------------------------------------

let passed = 0;
const failures = [];

function roundTrip(name, blocks) {
  let md;
  try {
    md = writeBody(blocks);
  } catch (err) {
    failures.push({ name, why: `writeBody threw: ${err.message}` });
    return;
  }

  let back;
  try {
    back = parseBody(md);
  } catch (err) {
    failures.push({ name, why: `parseBody threw: ${err.message}`, md });
    return;
  }

  const err = equal(blocks, back);
  if (err) failures.push({ name, why: err, md });
  else passed += 1;
}

/** A second pass proves the emitter is stable, not merely reversible. */
function stable(name, blocks) {
  const once = writeBody(blocks);
  const twice = writeBody(parseBody(once));
  if (once !== twice) {
    failures.push({
      name: `${name} (stability)`,
      why: "writing the parsed output produced different markdown",
      md: `--- first ---\n${once}\n--- second ---\n${twice}`,
    });
  } else {
    passed += 1;
  }
}

function check(name, blocks) {
  roundTrip(name, blocks);
  stable(name, blocks);
}

// --- Fixtures ---------------------------------------------------------------

const t = (v) => ({ t: "text", v });

const fixtures = {
  "empty document": [],

  "headings at both levels": [
    { t: "heading", level: 2, c: [t("A section")] },
    { t: "heading", level: 3, c: [t("A subsection")] },
  ],

  "every inline node, nested": [
    {
      t: "paragraph",
      c: [
        t("Plain, "),
        { t: "strong", c: [t("bold with "), { t: "em", c: [t("italic")] }] },
        t(", "),
        {
          t: "link",
          href: "/visas/pvip/",
          c: [{ t: "strong", c: [t("a bold link")] }],
        },
        t(", "),
        { t: "note", c: [t("a caveat, as at 25 August 2026")] },
        t(", and "),
        { t: "fig", programme: "pvip", field: "participationFee", fmt: "money" },
        t("."),
      ],
    },
  ],

  "text containing every marker character": [
    {
      t: "paragraph",
      c: [
        t("Literal ** and _ and [ and ] and (( and )) and {{ and }} and \\ end."),
      ],
    },
    { t: "paragraph", c: [t("A lone * and ( and { are left unescaped.")] },
  ],

  "paragraphs that look like other blocks": [
    { t: "paragraph", c: [t("## not a heading")] },
    { t: "paragraph", c: [t("- not a list")] },
    { t: "paragraph", c: [t("1. not an ordered list")] },
    { t: "paragraph", c: [t("> not a pullquote")] },
    { t: "paragraph", c: [t("| not | a | table |")] },
    { t: "paragraph", c: [t("{% not a shortcode %}")] },
    { t: "paragraph", c: [t("[^1]: not a footnote")] },
    { t: "paragraph", c: [t("\\ starts with a backslash")] },
    { t: "paragraph", c: [t("\\## backslash then a heading marker")] },
  ],

  "pullquote": [{ t: "pullquote", c: [t("The one sentence worth nodding at.")] }],

  "lists both ways": [
    { t: "list", items: [[t("first")], [t("second")]] },
    { t: "list", ordered: true, items: [[t("step one")], [t("step two")]] },
    {
      t: "list",
      items: [[{ t: "strong", c: [t("Lead-in.")] }, t(" Then the rest.")]],
    },
  ],

  "table, minimal": [
    {
      t: "table",
      head: ["Programme", "Threshold"],
      rows: [{ label: [t("PVIP")], cells: [{ value: [t("RM40,000")] }] }],
    },
  ],

  "table, everything on": [
    {
      t: "table",
      caption: "MM2H tiers on current guidance",
      head: ["", "Deposit", "Stay"],
      rows: [
        {
          label: [t("Silver")],
          cells: [
            {
              value: [
                { t: "fig", programme: "mm2h-silver", field: "deposit", fmt: "money" },
              ],
              note: 1,
            },
            { value: [t("5 years")] },
          ],
        },
        {
          label: [{ t: "strong", c: [t("Platinum")] }],
          cells: [{ value: [t("RM5,000,000")], note: 2 }, { value: [] }],
        },
      ],
      notes: [
        [t("Up to 50% may be withdrawn after twelve months.")],
        [
          t("See "),
          { t: "link", href: "/visas/mm2h/", c: [t("the MM2H guide")] },
          t("."),
        ],
      ],
    },
  ],

  /**
   * Text nodes are never adjacent here, and that is not an oversight.
   * `parseInline` coalesces running text into one node, so a document loaded
   * from D1 or from a file cannot contain two text siblings — and `writeInline`
   * treats the coalescing as a round-trip mismatch and falls back to hard
   * escaping, which is correct output from an input the pipeline cannot
   * produce. Writing the fixture that way tested the fallback, not the format.
   */
  "table cells containing pipes and footnote-shaped text": [
    {
      t: "table",
      head: ["A | B", "C"],
      rows: [
        {
          label: [t("pipe | here")],
          cells: [{ value: [t("also | here and [^1] literal")] }],
        },
      ],
    },
  ],

  "callout, both tones": [
    {
      t: "callout",
      tone: "warning",
      title: "The title",
      body: [[t("First paragraph.")], [t("Second paragraph.")]],
    },
    { t: "callout", tone: "info", body: [[t("No title on this one.")]] },
  ],

  "figure, with and without the optionals": [
    { t: "figure", assetId: "abc123" },
    {
      t: "figure",
      assetId: "def456",
      caption: 'A caption with "quotes" and a \\ backslash',
      aspect: "16/9",
    },
  ],

  "programme blocks": [
    { t: "programmeNotice", programme: "pvip" },
    { t: "keyFacts", programme: "mm2h-silver" },
    { t: "tierTable", programmes: ["mm2h-silver", "pvip"] },
    {
      t: "tierTable",
      programmes: ["de-rantau", "employment-pass"],
      caption: "Work routes",
      variant: "work-study",
    },
  ],

  "cta": [
    {
      t: "cta",
      c: [
        t("Does your route run through your employer, or "),
        { t: "em", c: [t("around")] },
        t(" them?"),
      ],
    },
  ],

  "a shortcode-shaped paragraph inside a callout": [
    {
      t: "callout",
      tone: "info",
      title: "Nested markers",
      body: [[t("{% endcallout %}")], [t("## still a paragraph")]],
    },
  ],
};

for (const [name, blocks] of Object.entries(fixtures)) check(name, blocks);

const fixtureFailures = failures.length;
console.log(
  `fixtures: ${passed} checks passed, ${fixtureFailures} failed ` +
    `(${Object.keys(fixtures).length} documents)`,
);

// --- Frontmatter ------------------------------------------------------------

/**
 * The envelope has to survive the trip too. A dropped `sources` entry is a
 * broken trust claim, not a formatting nit — `InsightLayout` prints that every
 * figure above traces to one of them.
 */
function frontmatterRoundTrip(name, data) {
  const file = writeContentFile(data, "A body paragraph.");
  const back = splitContentFile(file);
  const err = equal(data, back.data);
  if (err) {
    failures.push({ name: `frontmatter: ${name}`, why: err, md: file });
    return;
  }
  if (back.body !== "A body paragraph.") {
    failures.push({
      name: `frontmatter: ${name}`,
      why: `body came back as ${JSON.stringify(back.body)}`,
      md: file,
    });
    return;
  }
  passed += 1;
}

const frontmatterFixtures = {
  "a full insight envelope": {
    title: "Malaysia Employment Pass vs Residence Pass-Talent",
    dek: "Which one frees you from your employer, and what each actually costs.",
    published: "2026-08-23",
    reviewed: "2026-08-23",
    readingMinutes: 9,
    draft: false,
    relatedGuides: [
      { path: "/visas/employment-pass/", title: "Employment Pass" },
      { path: "/visas/pvip/", title: "the PVIP guide" },
    ],
    faq: [{ q: "Can my spouse work?", a: "On an RP-T, yes." }],
    sources: [
      {
        label: "ESD announcement, 15 January 2026",
        url: "https://esd.imi.gov.my/",
        verified: "2026-08-23",
      },
    ],
  },

  "empty lists and a draft": {
    title: "A draft",
    dek: "Not published yet.",
    published: "2026-08-25",
    reviewed: "2026-08-25",
    readingMinutes: 1,
    draft: true,
    relatedGuides: [],
    faq: [],
    sources: [],
  },

  "values that need escaping": {
    title: 'A "quoted" title, with a comma',
    dek: "A backslash \\ and a colon: here, plus a # hash.",
    published: "2026-08-25",
    readingMinutes: 12,
    draft: false,
    sources: [
      {
        label: 'MOTAC, "category table", December 2025',
        url: "https://www.motac.gov.my/?a=1&b=2",
        verified: "2025-12-01",
      },
    ],
  },

  "a news envelope, with scalar lists": {
    headline: "Sarawak immigration detains 42 foreigners in night raids",
    dek: "Authorities in Kuching arrested 42 non-citizens.",
    category: "sarawak-mm2h",
    sourceName: "Malay Mail",
    sourceUrl: "https://www.malaymail.com/news/malaysia/2026/08/12/x/1234",
    publishedAt: "2026-08-12T02:15:00Z",
    readingMinutes: 3,
    keyPoints: [
      "42 foreigners were detained between 10 pm on 10 Aug and 3 am on 12 Aug.",
      "Detentions were made under Section 15(1) and Section 6(1) of the Act.",
      "Ops Sapu: a colon in a key point must not split it into a mapping.",
    ],
    whatItMeans: ["Enforcement is tightening, and a lapsed pass is now costly."],
  },

  "strings that look like other types": {
    title: "true",
    dek: "2026-08-25",
    readingMinutes: 6,
    draft: false,
    faq: [{ q: "42", a: "false" }],
  },
};

for (const [name, data] of Object.entries(frontmatterFixtures)) {
  frontmatterRoundTrip(name, data);
}

/** Flow style is read but never written; check it is understood anyway. */
{
  const flow = [
    "---",
    'title: "Flow style"',
    "readingMinutes: 4",
    "relatedGuides:",
    '  - { path: "/visas/mm2h/", title: "MM2H, tiers and fees" }',
    "  - { path: /visas/pvip/, title: PVIP }",
    "---",
    "",
    "Body.",
  ].join("\n");
  const { data } = splitContentFile(flow);
  const want = [
    { path: "/visas/mm2h/", title: "MM2H, tiers and fees" },
    { path: "/visas/pvip/", title: "PVIP" },
  ];
  const err = equal(want, data.relatedGuides);
  if (err) failures.push({ name: "frontmatter: flow style", why: err, md: flow });
  else passed += 1;
}

console.log(
  `frontmatter: ${Object.keys(frontmatterFixtures).length + 1} envelopes checked`,
);

// --- Live documents ---------------------------------------------------------

if (!process.argv.includes("--offline")) {
  const before = failures.length;
  let docs = 0;

  const index = await fetch(INSIGHTS_API, {
    headers: { accept: "application/json" },
  }).then((r) => {
    if (!r.ok) throw new Error(`the insights index answered ${r.status}`);
    return r.json();
  });

  for (const item of index.items ?? []) {
    const url = `${INSIGHTS_API}/${encodeURIComponent(item.category)}/${encodeURIComponent(item.slug)}`;
    const doc = await fetch(url, { headers: { accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(`${item.slug} answered ${r.status}`);
        return r.json();
      })
      .then((j) => j.item);

    check(`/insights/${item.category}/${item.slug}/`, doc.blocks);
    docs += 1;
  }

  console.log(
    `live:      ${docs} documents, ${failures.length - before} failed`,
  );
}

// --- Report -----------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n${failures.length} round-trip failure(s):\n`);
  for (const f of failures) {
    console.error(`  ✗ ${f.name}`);
    console.error(`    ${f.why}`);
    if (f.md) {
      console.error(
        f.md
          .split("\n")
          .map((l) => `      | ${l}`)
          .join("\n"),
      );
    }
    console.error("");
  }
  console.error(
    "The compiler is lossy. Do not migrate until every document round-trips —\n" +
      "a difference here is an article that would be silently corrupted on disk.",
  );
  process.exit(1);
}

console.log(`\nAll ${passed} checks passed. writeBody is reversible and stable.`);
