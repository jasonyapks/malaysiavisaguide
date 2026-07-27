import type { Env, NewsItem } from "./types";
import { extractArticle } from "./extract";
import { findAlternateSources, extractText, type AiResponse } from "./news";
import { humanizeArticle } from "./humanize";

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
  /**
   * The source actually read. Normally the item's own source_url, but when that
   * was unreadable and an alternate outlet carried the same story, this is the
   * alternate — and the row must be updated to match, so the page cites what
   * was really read.
   */
  sourceUrl: string;
  sourceName: string;
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
  world:
    "another country's long-stay, retirement, investor or nomad visa — context for a reader comparing it against Malaysia's programmes, not a recommendation of it",
};

/**
 * Write the article for a stored item. Returns null when the source cannot be
 * read or the model's output fails validation.
 *
 * `override` is the manual-intake path: Jason has pasted the story's text into
 * the dashboard because the page could not be fetched. Given that text there is
 * nothing to fetch and nothing to search for, so both the extractor and the
 * alternate-source hunt are skipped entirely — the source has already been read,
 * by a human.
 */
export async function writeArticle(
  env: Env,
  item: Pick<NewsItem, "title" | "summary" | "category" | "source_name" | "source_url">,
  override?: { text: string },
): Promise<WrittenArticle | null> {
  let source = override
    ? { text: override.text, author: null, publishedAt: null, siteName: null }
    : await extractArticle(item.source_url, env);
  let usedUrl = item.source_url;
  let usedName = item.source_name;

  // The approved source could not be read. The story usually is not exclusive,
  // so look for an outlet that ran it and can be read. Whatever we end up
  // reading is what the page must cite — see the return value.
  if (!source) {
    const alternates = await findAlternateSources(item.title, item.source_url);
    console.log(
      `[article] ${item.source_url} unreadable — ${alternates.length} alternate(s) to try`,
    );
    for (const alt of alternates) {
      const attempt = await extractArticle(alt.url, env);
      if (attempt) {
        source = attempt;
        usedUrl = alt.url;
        usedName = alt.sourceName;
        console.log(`[article] using alternate source ${alt.sourceName} — ${alt.url}`);
        break;
      }
    }
  }
  if (!source) return null;

  const model = env.ARTICLE_MODEL;
  // Prompt with the publication actually read, not the one originally filed:
  // the model attributes the quote it picks, and attributing it to a paper we
  // never opened would be a fabricated citation.
  const prompt = buildPrompt({ ...item, source_name: usedName }, source.text);

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
      // Generous on purpose. ARTICLE_MODEL is a reasoning model, and its
      // thinking is billed against the same budget as its answer — too small a
      // cap and it spends the lot reasoning and returns an empty message, which
      // is what an "unparseable model output — 0 chars" log line actually means.
      max_tokens: 8000,
    } as never)) as AiResponse;

    raw = extractText(resp);
  } catch (err) {
    console.log(`[article] model call failed — ${String(err)}`);
    return null;
  }

  const parsed = parseJson(raw);
  if (!parsed) {
    // The ends, not the middle: truncation at max_tokens and a preamble before
    // the JSON are the two ways this fails, and they are only distinguishable
    // from the tail and the head respectively.
    console.log(
      `[article] unparseable model output for ${item.source_url} — ${raw.length} chars` +
        ` | head: ${JSON.stringify(raw.slice(0, 200))}` +
        ` | tail: ${JSON.stringify(raw.slice(-200))}`,
    );
    return null;
  }

  const written = validate(parsed, item, model);
  if (!written) {
    console.log(`[article] output failed validation for ${item.source_url}`);
    return null;
  }

  return {
    ...written,
    publishedAt: source.publishedAt,
    sourceUrl: usedUrl,
    sourceName: usedName,
  };
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
5. Headlines and section headings are sentence case: they read like an ordinary
   sentence, with normal capitalisation. Do NOT capitalise every word, and do
   NOT lower-case words that are already capitalised for a reason — acronyms
   (MM2H, PVIP, URA, S-MM2H), place names, ministries and people keep their
   capitals exactly as written. Never insert a space inside an acronym.
     good: "Higher financial thresholds"
     good: "How the URA affects Sarawak owners"
     bad:  "Higher Financial Thresholds"   (every word capitalised)
     bad:  "how the ur a works"            (acronym broken, no initial capital)

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
  // Validation judges the model's output only. publishedAt comes from the page
  // metadata, and the source fields from whichever page was actually read —
  // neither is the model's to decide.
): Omit<WrittenArticle, "publishedAt" | "sourceUrl" | "sourceName"> | null {
  const headline = initialCap(str(o.headline).slice(0, 200)) || item.title;
  const dek = str(o.dek).slice(0, 400);
  if (dek.length < 40) return null;

  const keyPoints = strArray(o.keyPoints, 6).map((s) => s.slice(0, 300));
  if (keyPoints.length < 2) return null;

  const rawSections = Array.isArray(o.sections) ? o.sections.slice(0, 6) : [];
  const sections: ArticleBody["sections"] = [];
  for (const s of rawSections) {
    if (!s || typeof s !== "object") continue;
    const sec = s as Record<string, unknown>;
    const heading = initialCap(str(sec.heading).slice(0, 160));
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
/**
 * Force an initial capital, and nothing else.
 *
 * Casing is asked for in the prompt, but a model told to use sentence case will
 * sometimes lower-case the first letter along with everything else. That much
 * is safe to repair here because it needs no judgement — unlike the rest of a
 * heading, where "correcting" the case would as easily flatten an acronym or a
 * place name as fix a mistake. So: first letter only, leave the rest alone.
 */
function initialCap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

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
  opts: { humanize?: boolean } = {},
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const row = await env.DB.prepare(
    `SELECT id, title, summary, category, source_name, source_url, slug,
            source_text, origin
       FROM news_items WHERE id = ?`,
  )
    .bind(id)
    .first<Pick<
      NewsItem,
      | "id"
      | "title"
      | "summary"
      | "category"
      | "source_name"
      | "source_url"
      | "slug"
      | "source_text"
      | "origin"
    >>();
  if (!row) return { ok: false, error: "No such item." };

  // A row carrying pasted text never goes near the network. This is what makes
  // approve / regenerate / write-next work on manual items with no second
  // publish path to keep in step.
  const written = await writeArticle(
    env,
    row,
    row.source_text ? { text: row.source_text } : undefined,
  );
  if (!written) {
    return {
      ok: false,
      // Two different failures, and telling them apart matters: with pasted text
      // there is no source to blame, so pointing at the manual-add box would
      // send Jason back to the box he just used.
      error: row.source_text
        ? "Could not write an article from the text you pasted. The model returned " +
          "unusable output, or the text was too thin to write from. Nothing was " +
          "published and your text is still on the item — try Rewrite, or paste a " +
          "fuller version of the story."
        : "Could not write an article. The source page could not be read (paywall, " +
          "bot block, or a JavaScript-only page) and no other outlet carrying the " +
          "same story could be read either — or the model returned unusable output. " +
          "Nothing was published. Paste a readable version of the story into the " +
          "manual-add box to write it anyway.",
    };
  }

  // The Worker's humanize pass. Automatic on manual items — Jason keyed those in
  // himself and expects them to read like a person wrote them — and on request
  // for anything else. Null means the pass produced nothing usable, in which
  // case the unpolished draft stands: this step can never lose an article.
  const humanizing = opts.humanize || row.origin === "manual";
  const polished = humanizing ? ((await humanizeArticle(env, written)) ?? written) : written;

  // Keep an existing slug. Once a URL is indexed, changing it on a rewrite
  // throws away the ranking it earned and orphans any inbound link. Note the
  // slug comes from the ORIGINAL headline, not the humanized one: a rewrite that
  // sharpens the headline must not move the URL underneath it.
  const slug = row.slug ?? (await uniqueSlug(env, written.headline, id));

  // source_url/source_name move with the article. When the original was
  // unreadable and an alternate outlet supplied the text, the citation on the
  // page has to name the outlet actually read — anything else is a false
  // attribution, and this site's only asset is being trustworthy about figures.
  if (written.sourceUrl !== row.source_url) {
    console.log(
      `[article] citation reassigned: ${row.source_name} → ${written.sourceName}`,
    );
  }

  // polish_state queues the row for the real /humanizer skill in a Claude
  // session — set whenever the condensed pass was attempted, including when it
  // failed. A draft the Worker could not clean up needs the real skill more, not
  // less. CASE rather than a plain assignment so a rewrite of an
  // already-polished article does not silently un-flag it.
  const queuePolish = humanizing;

  await env.DB.prepare(
    `UPDATE news_items
        SET slug = ?, headline = ?, dek = ?, body = ?, source_excerpt = ?,
            reading_minutes = ?, article_model = ?,
            source_url = ?, source_name = ?,
            published_at = COALESCE(published_at, ?),
            polish_state = CASE WHEN ? = 1 THEN 'needs-claude' ELSE polish_state END,
            updated_at = datetime('now')
      WHERE id = ?`,
  )
    .bind(
      slug,
      polished.headline,
      polished.dek,
      JSON.stringify(polished.body),
      // Never the humanized one. sourceExcerpt is a real quotation from the
      // publisher; rewriting it would put words in their mouth.
      written.sourceExcerpt,
      polished.readingMinutes,
      written.model,
      written.sourceUrl,
      written.sourceName,
      written.publishedAt,
      queuePolish ? 1 : 0,
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
