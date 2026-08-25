import type { Env } from "./types";

/**
 * Commit a file to the site repo through the GitHub Contents API.
 *
 * This is what replaced `publish.ts`. Approving a news article used to write a
 * D1 row and then ask the Pages API to start a build; now it writes a file, and
 * a push to `main` is already a deploy. The two-step publish is gone, and with
 * it the failure it produced — "I approved it and it's still a 404", which
 * happened whenever the second step was forgotten or quietly failed.
 *
 * ## Only approved articles are committed
 *
 * The sweep queues roughly a dozen candidates a day and most are rejected. The
 * pending queue is a queue, not content: it stays in D1. Committing candidates
 * would put thousands of files and a junk commit per item into the repo, and
 * `git log` would stop being useful for the thing it is actually for.
 *
 * ## The token
 *
 * `GITHUB_TOKEN` is a fine-grained personal access token scoped to Contents:
 * read and write on `jasonyapks/malaysiavisaguide` and nothing else. It is a
 * secret (`wrangler secret put GITHUB_TOKEN`), never in wrangler.jsonc.
 *
 * Note the repo belongs to the `jasonyapks` GitHub identity, not
 * jason@mypvip.com — a token minted from the wrong account authenticates fine
 * and then 404s on the repo, which reads like a bad path rather than a bad
 * token. `describeRepoError` below says so in the message.
 */

const API = "https://api.github.com";
const REPO = "jasonyapks/malaysiavisaguide";
const BRANCH = "main";

/**
 * GitHub requires a User-Agent and rejects the request without one. Naming the
 * Worker means a rate-limit or abuse report points at something identifiable.
 */
const HEADERS_BASE = {
  accept: "application/vnd.github+json",
  "user-agent": "mvg-news-worker",
  "x-github-api-version": "2022-11-28",
};

export interface CommitResult {
  ok: boolean;
  /** The commit sha, on success. */
  sha?: string;
  /** A message written to be read in the dashboard, not in a log. */
  error?: string;
}

/**
 * Base64 for a UTF-8 string.
 *
 * `btoa` is latin1-only and throws on anything above U+00FF, which for this
 * content means every curly quote, en dash and “—” in an article body. Encoding
 * to bytes first is the fix. Chunked because `String.fromCharCode(...bytes)`
 * blows the argument limit on a long article.
 */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function describeRepoError(status: number): string {
  if (status === 401) {
    return "GitHub rejected the token (401). It is missing, expired, or revoked.";
  }
  if (status === 403) {
    return (
      "GitHub refused the write (403). The token is valid but lacks " +
      "Contents: write on the repository, or the rate limit is exhausted."
    );
  }
  if (status === 404) {
    return (
      `GitHub could not find ${REPO} (404). A fine-grained token only sees ` +
      `repositories it was explicitly granted, and this repo belongs to the ` +
      `jasonyapks account — a token minted from a different GitHub identity ` +
      `authenticates fine and then 404s here.`
    );
  }
  if (status === 409) {
    return (
      "The file changed on GitHub between reading its sha and writing (409). " +
      "Safe to retry — nothing was written."
    );
  }
  return `GitHub answered ${status}.`;
}

/** The blob sha of an existing file, or null if the path is new. */
async function currentSha(env: Env, path: string): Promise<string | null> {
  const url = `${API}/repos/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { ...HEADERS_BASE, authorization: `Bearer ${env.GITHUB_TOKEN}` },
  });

  // A new file is the normal case for a first publish, not an error.
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(describeRepoError(res.status));

  const body = (await res.json()) as { sha?: string };
  return body.sha ?? null;
}

/**
 * Create or update one file on `main`.
 *
 * Idempotent in the way that matters: if the content is byte-identical to what
 * is already there, GitHub creates no commit and answers 200, so re-approving
 * an unchanged article does not spam the history or trigger a rebuild.
 */
export async function commitFile(
  env: Env,
  path: string,
  content: string,
  message: string,
): Promise<CommitResult> {
  if (!env.GITHUB_TOKEN) {
    return {
      ok: false,
      error:
        "GITHUB_TOKEN is not set on this Worker, so the article was written to " +
        "D1 but not committed. Run `wrangler secret put GITHUB_TOKEN`.",
    };
  }

  try {
    const sha = await currentSha(env, path);

    const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}`, {
      method: "PUT",
      headers: {
        ...HEADERS_BASE,
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: toBase64(content),
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) return { ok: false, error: describeRepoError(res.status) };

    const body = (await res.json()) as { commit?: { sha?: string } };
    return { ok: true, sha: body.commit?.sha };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Delete one file from `main`.
 *
 * Used when an article is retired. A missing file is reported as success: the
 * caller wanted it gone, and it is.
 */
export async function deleteFile(
  env: Env,
  path: string,
  message: string,
): Promise<CommitResult> {
  if (!env.GITHUB_TOKEN) {
    return { ok: false, error: "GITHUB_TOKEN is not set on this Worker." };
  }

  try {
    const sha = await currentSha(env, path);
    if (!sha) return { ok: true };

    const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}`, {
      method: "DELETE",
      headers: {
        ...HEADERS_BASE,
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ message, sha, branch: BRANCH }),
    });

    if (!res.ok) return { ok: false, error: describeRepoError(res.status) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
