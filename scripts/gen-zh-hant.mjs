#!/usr/bin/env node
/**
 * Generate the Traditional Chinese source files from the Simplified ones.
 *
 * Every `zh-hans.ts` / `zh-hans.tsx` under src/ gets a `zh-hant` sibling
 * written next to it. The generated files are COMMITTED — they are typechecked,
 * linted and reviewable in a diff like any other source, and a fresh clone
 * builds without needing this script to have run. `--check` re-runs the
 * conversion and fails if the committed output has drifted, which is what
 * prebuild uses.
 *
 * ## Content markdown is converted too, and is NOT committed
 *
 * `content/zh-hans/**.md` — the translated news and insight articles — gets the
 * same treatment into `content/zh-hant/`, with two differences. Those files are
 * gitignored build artifacts, because unlike the source modules they are
 * neither typechecked nor reviewed: they are one mechanical conversion of a
 * file that was itself machine-written, and a diff of 27 of them on every
 * publish would bury the English article that actually changed.
 *
 * Which means `--check` cannot apply to them: in CI the directory does not
 * exist yet and "drifted" would be true on every clean build. So the content
 * tree is always rewritten, in both modes, and the whole tree is cleared first
 * — a Simplified file that was deleted must not leave a Traditional orphan
 * behind that the build would then publish.
 *
 * ## Why generate rather than translate twice
 *
 * Simplified and Traditional differ in script, not in language. Hand-writing
 * both means 35,000 words maintained in duplicate, and the moment a figure is
 * corrected in one and not the other the site is quoting two different numbers
 * for the same fee — the exact failure the single-source rule in SPEC.md §4.1
 * exists to prevent. So Simplified is the source of truth and Traditional is
 * derived. Fix Chinese copy in `zh-hans.*` and rerun; never edit `zh-hant.*`.
 *
 * ## Why `to.tw` and not `to.twp`
 *
 * `twp` additionally swaps vocabulary for Taiwan idioms (软件 → 軟體, 网络 →
 * 網路). We serve one Traditional tree to both Hong Kong and Taiwan, and those
 * two disagree on exactly that vocabulary — HK writes 軟件/網絡. `tw` converts
 * characters to Taiwan-standard forms and leaves word choice alone, which
 * reads correctly in both places. The immigration and finance vocabulary this
 * site actually uses (簽證, 存款, 移民, 准證) is identical across both regions
 * anyway, so the phrase layer would buy nothing and cost neutrality.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import path from "node:path";
import * as OpenCC from "opencc-js";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");

/**
 * Terminology OpenCC gets right characterwise but wrong for this domain, plus
 * anything where Malaysian Chinese usage differs from both mainland and Taiwan.
 * Applied after the script conversion, so write the keys in Traditional.
 *
 * Malaysian Chinese media writes 馬來西亞 place names in its own established
 * forms; these are the ones that appear on the site.
 */
const TERMINOLOGY = [
  // Malaysian Chinese press writes 砂拉越, not the Taiwan-standard 沙勞越.
  ["沙勞越", "砂拉越"],
  ["沙撈越", "砂拉越"],
  // 菜單 converts characterwise from 菜单 but means a restaurant menu in
  // Traditional usage. The UI control is 選單 in both Taiwan and Hong Kong.
  ["菜單", "選單"],
  // Likewise 信息 → 資訊 for "information"; 訊息 would mean a chat message.
  ["信息", "資訊"],
];

const converter = OpenCC.ConverterFactory(
  OpenCC.Locale.from.cn,
  OpenCC.Locale.to.tw.concat([TERMINOLOGY]),
);

/**
 * OpenCC only ever rewrites Han characters, so identifiers, imports, JSX tag
 * names and every ASCII string in the file survive untouched. The one thing it
 * cannot know about is our own locale slug: a file that says `"zh-hans"` — in
 * an import path, a type, or a locale key — has to say `"zh-hant"` in the
 * generated copy. That substitution is ASCII, so it is done here by hand.
 */
function convert(source) {
  return converter(source).replaceAll("zh-hans", "zh-hant");
}

const BANNER = `// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run \`npm run i18n:hant\`; edits here are overwritten.
`;

const sources = globSync("src/**/zh-hans.{ts,tsx}", { cwd: ROOT });

if (sources.length === 0) {
  console.error("gen-zh-hant: no zh-hans sources found under src/ — aborting.");
  process.exit(1);
}

const drifted = [];
let written = 0;

for (const rel of sources) {
  const from = path.join(ROOT, rel);
  const to = path.join(ROOT, rel.replace(/zh-hans(\.tsx?)$/, "zh-hant$1"));
  const generated = BANNER + convert(readFileSync(from, "utf8"));

  let current = null;
  try {
    current = readFileSync(to, "utf8");
  } catch {
    // Not generated yet.
  }

  if (current === generated) continue;

  if (CHECK) {
    drifted.push(path.relative(ROOT, to));
    continue;
  }

  writeFileSync(to, generated);
  written += 1;
  console.log(`gen-zh-hant: wrote ${path.relative(ROOT, to)}`);
}

/**
 * The translated content tree: content/zh-hans/**.md → content/zh-hant/**.md.
 *
 * Cleared and rewritten wholesale. It is small, it is derived, and rebuilding
 * it costs milliseconds — whereas reconciling deletions incrementally is the
 * kind of code that leaves one orphan behind and publishes it.
 */
const CONTENT_FROM = path.join(ROOT, "content", "zh-hans");
const CONTENT_TO = path.join(ROOT, "content", "zh-hant");

const contentSources = globSync("content/zh-hans/**/*.md", { cwd: ROOT });
rmSync(CONTENT_TO, { recursive: true, force: true });

for (const rel of contentSources) {
  const from = path.join(ROOT, rel);
  const to = path.join(CONTENT_TO, path.relative(CONTENT_FROM, from));
  mkdirSync(path.dirname(to), { recursive: true });
  // No banner: the file is content, and a comment is not markdown frontmatter.
  writeFileSync(to, convert(readFileSync(from, "utf8")));
}

console.log(
  `gen-zh-hant: ${contentSources.length} content file(s) converted into content/zh-hant/.`,
);

if (CHECK && drifted.length > 0) {
  console.error(
    `gen-zh-hant: ${drifted.length} generated file(s) are out of date:\n` +
      drifted.map((f) => `  ${f}`).join("\n") +
      `\nRun \`npm run i18n:hant\` and commit the result.`,
  );
  process.exit(1);
}

console.log(
  CHECK
    ? `gen-zh-hant: ${sources.length} file(s) up to date.`
    : `gen-zh-hant: ${written} written, ${sources.length - written} already current.`,
);
