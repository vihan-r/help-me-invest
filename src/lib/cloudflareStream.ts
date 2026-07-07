import "server-only";

import { SignJWT, importJWK } from "jose";

const keyId = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;
const jwkBase64 = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_JWK;

/** Whether server-side token signing is configured (signing key present). */
export const streamSigningConfigured = Boolean(keyId && jwkBase64);

/**
 * Signs a short-lived Cloudflare Stream playback token (RS256 JWT) for one video
 * UID, using the account's signing key.
 *
 * Server-only: importing "server-only" makes a client import a build error, so
 * the private key (the base64 JWK) never reaches the browser. This is called
 * ONLY after a page's auth check — signed-out users never receive a token, and a
 * "require signed URLs" video returns 403 to anyone without one. That's the real,
 * server-enforced gate (not just hidden UI).
 *
 * The JWK is base64-encoded by Cloudflare and must be decoded before use. `kid`
 * appears in both the JWT header and body, `sub` is the video UID.
 */
export async function signStreamToken(videoId: string, expiresIn = "2h"): Promise<string> {
  if (!keyId || !jwkBase64) {
    throw new Error("Cloudflare Stream signing key is not configured");
  }
  const jwk = JSON.parse(Buffer.from(jwkBase64, "base64").toString("utf8"));
  const key = await importJWK(jwk, "RS256");
  return new SignJWT({ kid: keyId, sub: videoId })
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}
