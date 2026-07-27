/**
 * The humanize pass — a second model call that strips the tells of machine
 * writing out of an already-drafted article.
 *
 * WHY IT IS SEPARATE FROM THE WRITE. Asking one call to both report a story
 * accurately and police its own prose gets neither: the model spends its budget
 * on the facts and falls back on the same stock cadences every time. Splitting
 * it means the second call has one job, sees only the draft, and can be judged
 * on whether the draft got better.
 *
 * WHAT IT IS A COPY OF. The rules below are condensed from the /humanizer skill
 * (Wikipedia's "Signs of AI writing", WikiProject AI Cleanup) — the subset that
 * actually fires on news prose. The full skill is 412 lines and runs in a Claude
 * session; this is the part that fits in a system prompt and runs on
 * ARTICLE_MODEL. It is deliberately the weaker of the two. Rows it touches are
 * flagged `polish_state = 'needs-claude'` so the real skill gets the last word
 * before the deploy that publishes them — see schema-003-manual.sql.
 *
 * WHAT IT MUST NEVER DO. Change a number, invent a fact, or touch the
 * `sourceExcerpt` — that is a real quotation from a publisher, and editing it
 * would be putting words in their mouth. The excerpt is never passed in here at
 * all, and the figures are checked on the way out by numericFidelity(). A pass
 * that fails any check returns null and the unpolished draft stands.
 */

import type { Env, NewsItem } from "./types";
import type { ArticleBody, WrittenArticle } from "./article";
import { extractText, type AiResponse } from "./news";

const SYSTEM_PROMPT = `You are a newspaper sub-editor. You are given a draft
article as JSON. You rewrite the prose so it reads as though a person wrote it,
and you return the same JSON structure. You output only JSON.`;

/**
 * The rules. Phrased as things to remove rather than a style to imitate,
 * because "write naturally" produces the house style of the model and a list of
 * specific tells produces edits.
 */
const RULES = `Rewrite the prose to remove the signs of machine writing. Keep the
same JSON structure: the same number of keyPoints, the same number of sections,
the same headings-to-paragraphs arrangement.

REMOVE THESE PATTERNS

1. Inflated significance. Cut "marks a pivotal moment", "underscores the
   importance of", "reflects a broader shift", "stands as a testament to",
   "setting the stage for", "a key turning point", "the evolving landscape".
   A policy change is a policy change. Say what changed.

2. Participle padding. Sentences that end with a tacked-on "-ing" clause adding
   fake depth: "...raising the threshold, reflecting the government's commitment
   to quality applicants." Cut the clause or make it its own sentence with a real
   subject.

3. Promotional language. "robust", "seamless", "comprehensive", "vibrant",
   "rich cultural heritage", "state-of-the-art", "world-class", "attractive
   proposition". This is a reference site, not a brochure.

4. Vague attribution. "experts say", "it is widely regarded", "many believe",
   "observers note" — with no named source. Either the draft names who said it,
   in which case name them, or the claim goes.

5. The rule of three. Not every list needs exactly three items and not every
   sentence needs three adjectives. If the draft has two real things to say, say
   two.

6. Negative parallelism. "It is not just X, but Y." "This isn't about X — it's
   about Y." State Y.

7. Em dash overuse. At most one em dash per section. Commas, full stops and
   brackets do the same work without the tell.

8. Filler openers. "It's worth noting that", "It is important to understand",
   "In today's world", "When it comes to", "In conclusion". Delete them and
   start with the sentence that follows.

9. Machine vocabulary. delve, tapestry, testament, landscape (figurative),
   navigate (figurative), leverage (as a verb), foster, underscore, pivotal,
   crucial, showcase, myriad, realm, intricate, multifaceted, ever-evolving.

10. Uniform rhythm. Every sentence the same length is the loudest tell of all.
    Vary them. A short one lands.

VOICE. Plain British English for people deciding whether to apply for a visa.
Neutral and factual is the correct human voice for reference writing, so do NOT
add opinions, jokes, first person, or a personality the draft did not have. Do
not make it chattier. Make it less padded.

ABSOLUTE RULES, WHICH OVERRIDE EVERY RULE ABOVE

- Do not add any fact, name, number, date, currency figure, deadline or
  institution that is not already in the draft. If removing padding would leave
  a sentence too thin, leave the sentence plain rather than filling it.
- Every number and every currency figure in the draft must appear in your
  rewrite, unchanged. RM200,000 stays RM200,000. Do not round, convert,
  reformat, or spell out figures.
- Do not add a conclusion, a summary, or a "what this means going forward"
  paragraph. The draft's structure is final.

Return ONLY this JSON, with no commentary:
{"headline": string, "dek": string, "keyPoints": [string], "sections": [{"heading": string, "paragraphs": [string]}], "whatItMeans": [string]}`;

/**
 * Rewrite a drafted article. Returns null when the pass produced nothing
 * trustworthy — the caller keeps the original draft in that case, which is why
 * every failure path here is a `return null` and never a throw.
 */
export async function humanizeArticle(
  env: Env,
  written: WrittenArticle,
): Promise<WrittenArticle | null> {
  // sourceExcerpt is deliberately absent from what the model sees. It cannot
  // rewrite what it is not given.
  const draft = JSON.stringify(
    {
      headline: written.headline,
      dek: written.dek,
      keyPoints: written.body.keyPoints,
      sections: written.body.sections,
      whatItMeans: written.body.whatItMeans,
    },
    null,
    2,
  );

  let raw: string;
  try {
    const resp = (await env.AI.run(env.ARTICLE_MODEL as keyof AiModels, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${RULES}\n\nDRAFT:\n${draft}` },
      ],
      // Same budget as the write. This model reasons before it answers and the
      // reasoning is billed against the same cap — see article.ts.
      max_tokens: 8000,
    } as never)) as AiResponse;
    raw = extractText(resp);
  } catch (err) {
    console.log(`[humanize] model call failed — ${String(err)}`);
    return null;
  }

  const parsed = parseJson(raw);
  if (!parsed) {
    console.log(`[humanize] unparseable output — ${raw.length} chars`);
    return null;
  }

  const body = shapeBody(parsed, written.body);
  if (!body) {
    console.log("[humanize] output did not match the draft's shape — keeping the draft");
    return null;
  }

  const headline = str(parsed.headline).slice(0, 200) || written.headline;
  const dek = str(parsed.dek).slice(0, 400);
  if (dek.length < 40) {
    console.log("[humanize] dek came back too short — keeping the draft");
    return null;
  }

  // The check that earns this feature its place. A rewrite that quietly drops
  // RM200,000 or turns USD150,000 into USD150k is worse than no rewrite at all,
  // on a site whose whole proposition is that its figures are checked.
  const drift = numericFidelity(written, { headline, dek, body });
  if (drift) {
    console.log(`[humanize] ${drift} — keeping the draft`);
    return null;
  }

  const words = body.sections
    .flatMap((s) => s.paragraphs)
    .concat(body.keyPoints, body.whatItMeans)
    .join(" ")
    .split(/\s+/).length;

  return {
    ...written,
    headline,
    dek,
    body,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

/**
 * Humanize an article that is already stored — the dashboard's "Humanise"
 * button. Distinct from the pass inside generateAndStore, which runs on a draft
 * that has not been written to the row yet: this one is for cleaning up
 * something the sweep wrote and published weeks ago, without regenerating it
 * from the source and risking a different article.
 */
export async function humanizeStored(
  env: Env,
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await env.DB.prepare(
    `SELECT headline, dek, body, article_model FROM news_items WHERE id = ?`,
  )
    .bind(id)
    .first<Pick<NewsItem, "headline" | "dek" | "body" | "article_model">>();
  if (!row) return { ok: false, error: "No such item." };
  if (!row.body || !row.headline || !row.dek) {
    return { ok: false, error: "Nothing to humanise — this item has no article yet." };
  }

  let body: ArticleBody;
  try {
    body = JSON.parse(row.body) as ArticleBody;
  } catch {
    return { ok: false, error: "The stored article body is not valid JSON." };
  }

  const polished = await humanizeArticle(env, {
    headline: row.headline,
    dek: row.dek,
    body,
    // Not read by the pass — sourceExcerpt is never shown to the model — but the
    // type wants them, and stating them here documents that they are untouched.
    sourceExcerpt: null,
    publishedAt: null,
    sourceUrl: "",
    sourceName: "",
    readingMinutes: 0,
    model: row.article_model ?? env.ARTICLE_MODEL,
  });

  if (!polished) {
    return {
      ok: false,
      error:
        "The humanise pass produced nothing usable — the model's output was " +
        "unparseable, changed the article's shape, or dropped a figure. The " +
        "article is untouched. Try again, or run the full /humanizer skill on it.",
    };
  }

  await env.DB.prepare(
    `UPDATE news_items
        SET headline = ?, dek = ?, body = ?, reading_minutes = ?,
            polish_state = 'needs-claude', updated_at = datetime('now')
      WHERE id = ?`,
  )
    .bind(
      polished.headline,
      polished.dek,
      JSON.stringify(polished.body),
      polished.readingMinutes,
      id,
    )
    .run();

  return { ok: true };
}

/**
 * Accept the rewrite only if it kept the draft's shape. The prompt asks for the
 * same counts; a model that returns four sections where the draft had two has
 * either merged the reporting or invented some, and both are grounds to bin it.
 */
function shapeBody(o: Record<string, unknown>, original: ArticleBody): ArticleBody | null {
  const keyPoints = strArray(o.keyPoints).map((s) => s.slice(0, 300));
  const whatItMeans = strArray(o.whatItMeans).map((s) => s.slice(0, 600));
  if (keyPoints.length !== original.keyPoints.length) return null;
  if (whatItMeans.length !== original.whatItMeans.length) return null;

  if (!Array.isArray(o.sections) || o.sections.length !== original.sections.length) return null;
  const sections: ArticleBody["sections"] = [];
  for (const s of o.sections) {
    if (!s || typeof s !== "object") return null;
    const sec = s as Record<string, unknown>;
    const heading = str(sec.heading).slice(0, 160);
    const paragraphs = strArray(sec.paragraphs).map((p) => p.slice(0, 2000));
    if (!heading || paragraphs.length === 0) return null;
    sections.push({ heading, paragraphs });
  }
  return { keyPoints, sections, whatItMeans };
}

/**
 * The set of numeric tokens must come through the rewrite unchanged — nothing
 * lost, and nothing new.
 *
 * Sets rather than counts: merging two sentences that both cited RM200,000 into
 * one is a legitimate edit, and counting occurrences would reject it.
 *
 * The no-new-numbers half is what makes the check bite. Losing a figure on its
 * own is a weak signal, because the same figure usually appears more than once
 * in an article and one surviving mention hides the loss. Every way of corrupting
 * a figure that matters — rounding RM176.9m to "about RM177 million", converting
 * a currency, spelling a number out as a different one — puts a token in the
 * rewrite that was never in the draft. And the prompt forbids adding figures
 * outright, so there is no legitimate reason for a new one to appear.
 */
function numericFidelity(
  before: Pick<WrittenArticle, "headline" | "dek" | "body">,
  after: Pick<WrittenArticle, "headline" | "dek" | "body">,
): string | null {
  const flat = (a: Pick<WrittenArticle, "headline" | "dek" | "body">) =>
    [a.headline, a.dek, ...a.body.keyPoints, ...a.body.whatItMeans]
      .concat(a.body.sections.flatMap((s) => [s.heading, ...s.paragraphs]))
      .join(" ");

  // Digit runs with their separators: 200,000 / 176.9 / 2026 all match as one
  // token, so a reformat reads as a change, which is exactly what we want.
  const tokens = (s: string) => new Set(s.match(/\d[\d,.]*\d|\d/g) ?? []);
  const a = tokens(flat(before));
  const b = tokens(flat(after));

  const lost = [...a].filter((n) => !b.has(n));
  const invented = [...b].filter((n) => !a.has(n));
  if (lost.length) return `figures lost: ${lost.join(", ")}`;
  if (invented.length) return `figures invented: ${invented.join(", ")}`;
  return null;
}

/** Outermost brace pair, tolerating fences and preamble. Same trick as article.ts. */
function parseJson(s: string): Record<string, unknown> | null {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : s;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => str(x)).filter((x) => x.length > 0);
}
