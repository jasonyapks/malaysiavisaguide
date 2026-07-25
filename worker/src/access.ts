import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import type { Env } from "./types";

/**
 * Cloudflare Access guard — the "only Jason can reach the dashboard" rule.
 *
 * The dashboard and every /api/admin route sit behind a Cloudflare Access
 * application (see worker/README.md). Access authenticates the user at the edge
 * and injects a signed JWT on the `Cf-Access-Jwt-Assertion` header. We verify
 * that JWT here as defense-in-depth, so the admin surface is protected even if
 * the Access application were ever misconfigured. Per Cloudflare docs
 * (2025-10 one-click Access for Workers).
 *
 * Returns the authenticated user's email on success, or null on any failure.
 */
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export async function requireAccess(
  request: Request,
  env: Env,
): Promise<string | null> {
  if (!env.POLICY_AUD || env.POLICY_AUD.startsWith("PLACEHOLDER")) return null;

  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return null;

  try {
    if (!jwks) {
      jwks = createRemoteJWKSet(
        new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`),
      );
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer: env.TEAM_DOMAIN,
      audience: env.POLICY_AUD,
    });
    return emailOf(payload);
  } catch {
    return null;
  }
}

function emailOf(payload: JWTPayload): string {
  const email = payload["email"];
  return typeof email === "string" ? email : "authenticated";
}
