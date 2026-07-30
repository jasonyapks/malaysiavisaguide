import type { Env } from "./types";

/**
 * Publishing, from the dashboard.
 *
 * WHY THIS EXISTS. The site is a static export, so approving an article writes a
 * D1 row and nothing a reader can see changes. Something has to run `next build`
 * and upload the result, and a Worker cannot run a Next.js build. What it *can*
 * do is ask Cloudflare Pages to run one: the project is connected to the repo, so
 * `POST /deployments` starts a build from the production branch, which fetches
 * this Worker's own API and bakes the current content in.
 *
 * WHY NOT A DEPLOY HOOK. The plan called for one. A deploy hook is an unguessable
 * URL that triggers a build with no auth, which means it has to be created by hand
 * in the dashboard and stored as a second secret. `POST /deployments` does the same
 * job with the API token the status panel already needs, so there is one credential
 * instead of two and nothing for Jason to click. The tradeoff is that the token is
 * broader than a hook URL — Pages: Edit can also roll back and delete — which is
 * acceptable for a token only this Worker holds, and better than a bearer URL that
 * anyone who ever sees it can fire forever.
 *
 * Needs CF_PAGES_TOKEN (Cloudflare Pages: Edit). Absent, publishing and the status
 * panel both degrade to a clear message rather than breaking the dashboard — the
 * same policy analytics.ts applies.
 */

const API = "https://api.cloudflare.com/client/v4";
const PROJECT = "malaysiavisaguide";

/** Where a build has got to, flattened from Cloudflare's stage/status pair. */
export type Phase = "queued" | "building" | "deploying" | "success" | "failure";

export interface Deployment {
  id: string;
  short: string;
  phase: Phase;
  /** Cloudflare's own words, for the panel's detail line. */
  stage: string;
  elapsedSeconds: number;
  commit: string | null;
  commitMessage: string | null;
  url: string | null;
  createdAt: string;
}

export interface DeployStatus {
  ok: boolean;
  error?: string;
  latest: Deployment | null;
  /** True while a build is in flight — the publish guard reads this. */
  busy: boolean;
}

const NOT_CONFIGURED =
  "Publishing not configured yet — CF_PAGES_TOKEN is not set.";

/**
 * A build is in flight for any phase that is not yet terminal. Publishing checks
 * this before firing: two builds of the same branch race, and the loser can
 * overwrite the winner with an identical-but-older artifact. Cheap to prevent,
 * confusing to debug.
 */
function isBusy(phase: Phase): boolean {
  return phase === "queued" || phase === "building" || phase === "deploying";
}

/**
 * Cloudflare reports a stage name and a status; the panel wants one word.
 *
 * Stages run queued → initialize → clone_repo → build → deploy, each
 * active | success | failure | canceled | skipped. Only `deploy:success` is done;
 * a failure at any stage is a failure. Note the asymmetry — `build:success` is
 * NOT success, it just means the upload is next. Reading it as success is how you
 * end up telling Jason the site is live while it is still uploading.
 */
function toPhase(stage: string | undefined, status: string | undefined): Phase {
  if (status === "failure" || status === "canceled") return "failure";
  if (stage === "deploy") return status === "success" ? "success" : "deploying";
  if (stage === "queued") return "queued";
  return "building";
}

function toDeployment(raw: Record<string, any>): Deployment {
  const stage = raw.latest_stage?.name as string | undefined;
  const status = raw.latest_stage?.status as string | undefined;
  const created = raw.created_on as string;
  const phase = toPhase(stage, status);

  // Elapsed stops climbing once the build is done, so a finished deployment reads
  // as how long it took rather than how long ago it was.
  const endedAt =
    phase === "success" || phase === "failure"
      ? (raw.latest_stage?.ended_on ?? raw.modified_on ?? null)
      : null;
  const end = endedAt ? new Date(endedAt) : new Date();

  return {
    id: raw.id,
    short: raw.short_id ?? String(raw.id).slice(0, 8),
    phase,
    stage: `${stage ?? "unknown"}:${status ?? "unknown"}`,
    elapsedSeconds: Math.max(
      0,
      Math.round((end.getTime() - new Date(created).getTime()) / 1000),
    ),
    commit: raw.deployment_trigger?.metadata?.commit_hash?.slice(0, 7) ?? null,
    commitMessage:
      raw.deployment_trigger?.metadata?.commit_message?.split("\n")[0] ?? null,
    url: raw.url ?? null,
    createdAt: created,
  };
}

async function cf(
  env: Env,
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; result: any } | { ok: false; error: string }> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.CF_PAGES_TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => null)) as any;
  if (!res.ok || !body?.success) {
    const msg =
      body?.errors?.map((e: any) => e.message).join("; ") ||
      `Cloudflare returned ${res.status}.`;
    return { ok: false, error: msg };
  }
  return { ok: true, result: body.result };
}

/** The production deployment list, newest first. */
export async function getDeployStatus(env: Env): Promise<DeployStatus> {
  if (!env.CF_PAGES_TOKEN) {
    return { ok: false, error: NOT_CONFIGURED, latest: null, busy: false };
  }

  try {
    const res = await cf(
      env,
      `/accounts/${env.CF_ACCOUNT_ID}/pages/projects/${PROJECT}/deployments?env=production&per_page=1`,
    );
    if (!res.ok) return { ok: false, error: res.error, latest: null, busy: false };

    const rows = Array.isArray(res.result) ? res.result : [];
    if (rows.length === 0) {
      return { ok: true, latest: null, busy: false };
    }
    const latest = toDeployment(rows[0]);
    return { ok: true, latest, busy: isBusy(latest.phase) };
  } catch (err) {
    return { ok: false, error: String(err), latest: null, busy: false };
  }
}

/**
 * Start a build. Returns the deployment so the panel can begin polling it
 * immediately rather than waiting a tick to discover its own work.
 *
 * Refuses while one is already running — see isBusy. The caller gets the
 * in-flight deployment back with `queued: true`, which is what the UI shows, so a
 * second click reads as "already going" instead of doing nothing visible.
 */
export async function triggerPublish(
  env: Env,
): Promise<
  | { ok: true; queued: boolean; deployment: Deployment | null }
  | { ok: false; error: string }
> {
  if (!env.CF_PAGES_TOKEN) return { ok: false, error: NOT_CONFIGURED };

  const current = await getDeployStatus(env);
  if (current.ok && current.busy) {
    return { ok: true, queued: true, deployment: current.latest };
  }

  // Pages wants multipart here even for a git build; `branch` is the only field
  // that matters, and it pins the build to production rather than whatever
  // Cloudflare would otherwise infer.
  const form = new FormData();
  form.set("branch", "main");

  const res = await cf(
    env,
    `/accounts/${env.CF_ACCOUNT_ID}/pages/projects/${PROJECT}/deployments`,
    { method: "POST", body: form },
  );
  if (!res.ok) return { ok: false, error: res.error };

  return { ok: true, queued: false, deployment: toDeployment(res.result) };
}

/**
 * The tail of a failed build's log.
 *
 * Worth an endpoint of its own: the one real failure this project has had was a
 * single line of config in a build log nobody was reading, and it failed silently
 * on every push for days. Putting the tail in the dashboard turns "it didn't
 * work" into a diagnosis without leaving the page.
 */
export async function getBuildLog(
  env: Env,
  id: string,
  lines = 20,
): Promise<{ ok: boolean; error?: string; lines: string[] }> {
  if (!env.CF_PAGES_TOKEN) return { ok: false, error: NOT_CONFIGURED, lines: [] };

  try {
    const res = await cf(
      env,
      `/accounts/${env.CF_ACCOUNT_ID}/pages/projects/${PROJECT}/deployments/${id}/history/logs`,
    );
    if (!res.ok) return { ok: false, error: res.error, lines: [] };

    const all: string[] = (res.result?.data ?? [])
      .map((l: any) => l.line)
      .filter((l: unknown): l is string => typeof l === "string");
    return { ok: true, lines: all.slice(-lines) };
  } catch (err) {
    return { ok: false, error: String(err), lines: [] };
  }
}
