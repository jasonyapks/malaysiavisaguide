/**
 * Source-article extraction.
 *
 * To write an original article ABOUT a news story we first have to read the
 * story. This fetches the source page and pulls out the readable body text plus
 * whatever publication metadata it exposes.
 *
 * The extracted text is INPUT TO THE MODEL AND NOTHING ELSE. It is never stored
 * on a row and never rendered — see the header of schema-002-articles.sql. The
 * only publisher wording that survives into the page is the one short attributed
 * quote the model is asked to pick out.
 *
 * There is no DOM in Workers, so this is regex over HTML. That is normally the
 * wrong tool, and it is the right one here: news sites are a long tail of
 * mutually inconsistent markup, a real parser would still need per-site rules,
 * and the consumer is a language model that tolerates a stray nav item far
 * better than it tolerates an empty string. Precision matters less than never
 * throwing.
 */

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

/** Below this many characters the page is a paywall, a consent wall, or a JS shell. */
const MIN_USABLE_CHARS = 400;

/** Cap what we hand the model. ~12k chars is a long feature and well inside context. */
const MAX_CHARS = 12000;

export interface Extracted {
  /** Readable body text, whitespace-collapsed. */
  text: string;
  /** Byline if the page declares one. */
  author: string | null;
  /** ISO publish date from metadata, more trustworthy than the feed's pubDate. */
  publishedAt: string | null;
  /** The publisher's own name for itself, e.g. "The Star". */
  siteName: string | null;
}

/**
 * Fetch and extract. Returns null when there is not enough text to write from —
 * a paywall, a bot block, a client-rendered page. The caller must treat null as
 * "cannot write an article about this", never as "write from the headline
 * alone": invention is the one failure mode that would actually damage the
 * site's credibility.
 */
export async function extractArticle(url: string): Promise<Extracted | null> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": BROWSER_UA,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-MY,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`[extract] ${url} — status ${res.status}`);
      return null;
    }
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) {
      console.log(`[extract] ${url} — not html (${type})`);
      return null;
    }
    html = await res.text();
  } catch (err) {
    console.log(`[extract] ${url} — fetch failed: ${String(err)}`);
    return null;
  }

  const text = readableText(html);
  if (text.length < MIN_USABLE_CHARS) {
    console.log(`[extract] ${url} — only ${text.length} chars, unusable`);
    return null;
  }

  return {
    text: text.slice(0, MAX_CHARS),
    author: meta(html, "author") ?? meta(html, "article:author"),
    publishedAt: isoDate(
      meta(html, "article:published_time") ??
        meta(html, "publish-date") ??
        meta(html, "date") ??
        jsonLdDate(html),
    ),
    siteName: meta(html, "og:site_name"),
  };
}

/**
 * Strip a page down to its prose.
 *
 * Order is load-bearing: kill the elements whose text is never article text
 * first, then prefer an <article> if the page has one, and only fall back to
 * paragraph-harvesting across the whole document if it doesn't.
 */
function readableText(html: string): string {
  let s = html;

  // Elements whose contents are never prose. script/style would otherwise
  // contribute code, and nav/header/footer/aside contribute menus that read to
  // a model like part of the story.
  for (const tag of [
    "script",
    "style",
    "noscript",
    "template",
    "svg",
    "nav",
    "header",
    "footer",
    "aside",
    "form",
    "figure",
    "iframe",
  ]) {
    s = s.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "gi"), " ");
  }
  s = s.replace(/<!--[\s\S]*?-->/g, " ");

  // Prefer the semantic container when the publisher provides one.
  const article =
    firstMatch(s, /<article\b[^>]*>([\s\S]*?)<\/article>/i) ??
    firstMatch(s, /<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const scope = article ?? s;

  // Harvest paragraphs rather than flattening the container: a <p> is a strong
  // signal for prose, and it lets short junk lines be dropped by length.
  const paragraphs = [...scope.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => clean(m[1]))
    // Under ~60 chars is a caption, a share prompt, or "Advertisement".
    .filter((p) => p.length > 60);

  if (paragraphs.length >= 2) return paragraphs.join("\n\n");

  // No usable paragraphs — some publishers render body copy in divs. Flatten.
  return clean(scope);
}

function clean(s: string): string {
  return decodeEntities(s.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(s: string, re: RegExp): string | null {
  const m = s.match(re);
  return m ? m[1] : null;
}

/** Read a <meta> value by name or property, in either attribute order. */
function meta(html: string, key: string): string | null {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${k}["'][^>]+content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${k}["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const v = firstMatch(html, re);
    if (v && v.trim()) return decodeEntities(v.trim());
  }
  return null;
}

/** Many publishers only date the story inside their NewsArticle JSON-LD. */
function jsonLdDate(html: string): string | null {
  return firstMatch(html, /"datePublished"\s*:\s*"([^"]+)"/i);
}

function isoDate(v: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    // Last, so a literal "&amp;lt;" does not become "<".
    .replace(/&amp;/g, "&");
}
