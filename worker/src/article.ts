import type { Env, NewsItem } from "./types";
import { extractArticle } from "./extract";

/**
 * Article writing — the step that turns a link into a page on this site.
 *
 * WHY THIS EXISTS AT ALL. The reader should be able to read the news here
 * instead of bouncing to the publisher. Reproducing the publisher's text would
 * do that too, and would be wrong twice over: it infringes their copyright, and
 * Google canonicalises duplicated text to whoever published it first, so the
 * page would never rank. So we write our own article about the story — the
 * facts, the figures, and the thing no wire copy has, which is what the change
 * means for someone actually applying. That is original content, it ranks, and
 * it is genuinely more useful than the source.
 *
 * WHEN IT RUNS. On approval, not on ingest. The daily sweep triages ~20
 * candidates with a small model and files them as pending; only the handful
 * Jason approves get a full article from a large model. One expensive call per
 * published page instead of twenty per day, and nothing is generated for
 * content that will never see a reader.
 *
 * WHAT IT WILL NOT DO. If the source cannot be read — paywall, bot block,
 * JS-only page — this returns null and the item does not publish. It never
 * writes from the headline alone. A confidently-worded article invented around
 * a headline is the single worst thing this pipeline could produce, on a site
 * whose whole proposition is that its figures are checked.
 */

/** Rendered shape of the article body, stored as JSON in news_items.body. */
export interface ArticleBody {
  /** 3–5 scannable takeaways. Also the bit AI Overviews tend to lift. */
  keyPoints: string[];
  sections: { heading: string; paragraphs: string[] }[];
  /** The practitioner read — why an applicant should care. This is the moat. */
  whatItMeans: string[];
}

export interface WrittenArticle {
  headline: string;
  dek: string;
  body: ArticleBody;
  /** A single short quote from the source, attributed on the page. */
  sourceExcerpt: string | null;
  /** Publisher's own date, if the page stated one more precisely than the feed. */
  publishedAt: string | null;
  readingMinutes: number;
  model: string;
}

const PROGRAMME_CONTEXT: Record<string, string> = {
  pvip: "PVIP (Premium Visitor Pass) — RM200,000 participation fee, RM1m fixed deposit, 20-year term",
  mm2h: "MM2H — Silver, Gold and Platinum tiers, USD150k/500k/1m fixed deposits, licensed agent mandatory",
  "sarawak-mm2h":
    "Sarawak MM2H (S-MM2H) — RM500,000 deposit in a Sarawak bank, 10 years renewable, no property purchase",
  "de-rantau": "DE Rantau — the digital nomad pass, USD24,000/yr foreign-sourced income, 12 months",
  "employment-pass": "Employment Pass — employer-sponsored via ESD, EP I/II/III salary tiers",
  "student-pass": "Student Pass — EMGS-processed, institution-sponsored",
  general: "Malaysian immigration policy for foreign nationals",
};

/**
 * Write the article for a stored item. Returns null when the source cannot be
 * read or the model's output fails validation.
 */
export async function writeArticle(
  env: Env,
  item: Pick<NewsItem, "title" | "summary" | "category" | "source_name" | "source_url">,
): Promise<WrittenArticle | null> {
  const source = await extractArticle(item.source_url);
  if (!source) return null;

  const model = env.ARTICLE_MODEL;
  const prompt = buildPrompt(item, source.text);

  let raw: string;
  try {
    const resp = (await env.AI.run(model as keyof AiModels, {
      messages: [
        {
          role: "system",
          content:
            "You are the staff writer for malaysiavisaguide.com, an independent " +
            "reference on Malaysia's long-stay visa programmes. You write plainly " +
            "and precisely for an audience of prospective applicants: retirees, " +
            "high-net-worth individuals and expatriates. You output only JSON.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 3000,
    } as never)) as { response?: unknown; choices?: { message?: { content?: string } }[] };

    raw =
      typeof resp?.response === "string"
        ? resp.response
        : (resp?.choices?.[0]?.message?.content ?? "");
  } catch (err) {
    console.log(`[article] model call failed — ${String(err)}`);
    return null;
  }

  const parsed = parseJson(raw);
  if (!parsed) {
    console.log(`[article] unparseable model output for ${item.source_url}`);
    return null;
  }

  const written = validate(parsed, item, model);
  if (!written) {
    console.log(`[article] output failed validation for ${item.source_url}`);
    return null;
  }

  return { ...written, publishedAt: source.publishedAt };
}

function buildPrompt(
  item: Pick<NewsItem, "title" | "summary" | "category" | "source_name">,
  sourceText: string,
): string {
  return `Write an original news article for malaysiavisaguide.com about the story below.

CONTEXT: this story concerns ${PROGRAMME_CONTEXT[item.category] ?? PROGRAMME_CONTEXT.general}.

THE RULES THAT MATTER MOST:
1. Write in your OWN words throughout. Do not copy or lightly reword sentences
   from the source. Every sentence must be newly composed.
2. Do not invent anything. Every figure, date, name and quote must be present in
   the source text. If the source does not give a number, do not give a number.
   Where the source is vague, say that it is vague.
3. Do not give immigration advice or predict outcomes. Report, then explain the
   practical implications neutrally.
4. British English. Malaysian currency as RM1,000,000. Foreign currency as
   USD 150,000. Dates as 16 March 2026.

Respond with ONLY a JSON object in exactly this shape, no prose around it:

{
  "headline": "Your own headline. 50-70 characters. Specific and factual, not clickbait. Lead with the programme name where relevant.",
  "dek": "One sentence, 100-160 characters, saying what changed and who it affects. This becomes the page's meta description.",
  "keyPoints": ["3 to 5 short factual takeaways, one clause each, each under 140 characters"],
  "sections": [
    {
      "heading": "A short section heading, 3-7 words, no colon",
      "paragraphs": ["2 to 4 paragraphs of 40-90 words each"]
    }
  ],
  "whatItMeans": ["2 to 4 sentences on the practical consequence for someone applying to or holding this visa. Concrete, not hedged filler."],
  "sourceExcerpt": "One sentence quoted verbatim from the source, under 200 characters, that is worth attributing — a statement from an official, or the key figure. Use null if nothing in the source merits quoting."
}

Write 2 to 4 sections, 350-600 words of body text in total.

SOURCE PUBLICATION: ${item.source_name}
SOURCE HEADLINE: ${item.title}
BRIEF: ${item.summary}

SOURCE TEXT:
${sourceText}`;
}

/**
 * Validate and normalise. Every field is size-capped and shape-checked here
 * rather than trusted, because a model that drifts produces rows that a page
 * template then has to defend against at render time — and the page template is
 * the wrong place to discover that `sections` came back as a string.
 */
function validate(
  o: Record<string, unknown>,
  item: Pick<NewsItem, "title">,
  model: string,
): Omit<WrittenArticle, "publishedAt"> | null {
  const headline = str(o.headline).slice(0, 200) || item.title;
  const dek = str(o.dek).slice(0, 400);
  if (dek.length < 40) return null;

  const keyPoints = strArray(o.keyPoints, 6).map((s) => s.slice(0, 300));
  if (keyPoints.length < 2) return null;

  const rawSections = Array.isArray(o.sections) ? o.sections.slice(0, 6) : [];
  const sections: ArticleBody["sections"] = [];
  for (const s of rawSections) {
    if (!s || typeof s !== "object") continue;
    const sec = s as Record<string, unknown>;
    const heading = str(sec.heading).slice(0, 160);
    const paragraphs = strArray(sec.paragraphs, 8).map((p) => p.slice(0, 2000));
    if (!heading || paragraphs.length === 0) continue;
    sections.push({ heading, paragraphs });
  }
  if (sections.length === 0) return null;

  const whatItMeans = strArray(o.whatItMeans, 5).map((s) => s.slice(0, 600));

  const excerpt = str(o.sourceExcerpt).slice(0, 400);
  // A "quote" longer than a couple of sentences stops being a citation and
  // starts being reproduction. Drop it rather than trim it mid-sentence.
  const sourceExcerpt = excerpt.length >= 20 && excerpt.length <= 300 ? excerpt : null;

  const words = sections
    .flatMap((s) => s.paragraphs)
    .concat(keyPoints, whatItMeans)
    .join(" ")
    .split(/\s+/).length;

  return {
    headline,
    dek,
    body: { keyPoints, sections, whatItMeans },
    sourceExcerpt,
    // 220 wpm, floored at 1 — a "0 min read" label looks broken.
    readingMinutes: Math.max(1, Math.round(words / 220)),
    model,
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => str(x))
    .filter((x) => x.length > 0)
    .slice(0, max);
}

/**
 * Pull the JSON object out of a model response. Reasoning models prefix their
 * answer with commentary and sometimes wrap it in a fence, so we take the
 * outermost brace pair rather than expecting clean JSON.
 */
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

/**
 * Write (or rewrite) the article for a row and store it. Returns the slug it
 * published at, or an error string the dashboard can show verbatim.
 *
 * This does NOT change `status` — approving and writing are separate concerns,
 * and keeping them separate is what lets a regeneration run against an
 * already-live article without a moment where it is unpublished.
 */
export async function generateAndStore(
  env: Env,
  id: string,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const row = await env.DB.prepare(
    `SELECT id, title, summary, category, source_name, source_url, slug
       FROM news_items WHERE id = ?`,
  )
    .bind(id)
    .first<Pick<
      NewsItem,
      "id" | "title" | "summary" | "category" | "source_name" | "source_url" | "slug"
    >>();
  if (!row) return { ok: false, error: "No such item." };

  const written = await writeArticle(env, row);
  if (!written) {
    return {
      ok: false,
      error:
        "Could not write an article: the source page could not be read (paywall, " +
        "bot block, or a JavaScript-only page), or the model returned unusable output. " +
        "Nothing was published.",
    };
  }

  // Keep an existing slug. Once a URL is indexed, changing it on a rewrite
  // throws away the ranking it earned and orphans any inbound link.
  const slug = row.slug ?? (await uniqueSlug(env, written.headline, id));

  await env.DB.prepare(
    `UPDATE news_items
        SET slug = ?, headline = ?, dek = ?, body = ?, source_excerpt = ?,
            reading_minutes = ?, article_model = ?,
            published_at = COALESCE(published_at, ?),
            updated_at = datetime('now')
      WHERE id = ?`,
  )
    .bind(
      slug,
      written.headline,
      written.dek,
      JSON.stringify(written.body),
      written.sourceExcerpt,
      written.readingMinutes,
      written.model,
      written.publishedAt,
      id,
    )
    .run();

  return { ok: true, slug };
}

/**
 * A URL-safe slug for the headline, unique within the table.
 *
 * `excludeId` matters on regeneration: the row already owns a slug, and without
 * it a rewrite of the same story would collide with itself and publish at
 * `-2`, quietly abandoning the URL search engines had already indexed.
 */
export async function uniqueSlug(
  env: Env,
  headline: string,
  excludeId: string,
): Promise<string> {
  const base =
    headline
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .split("-")
      // Long slugs get truncated in SERPs; ~9 words reads well and stays legible.
      .slice(0, 9)
      .join("-") || "malaysia-visa-update";

  for (let n = 1; n <= 20; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const clash = await env.DB.prepare(
      "SELECT 1 FROM news_items WHERE slug = ? AND id != ?",
    )
      .bind(slug, excludeId)
      .first();
    if (!clash) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}
