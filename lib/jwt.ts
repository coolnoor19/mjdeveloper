// Session token signing and verification. No database or Node-only imports,
// so proxy.ts can use it as well as the route handlers.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mj_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface SessionClaims {
  sub: string; // user id
  username: string;
  sv: number; // session version
}

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ username: claims.username, sv: claims.sv })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.username !== "string" || typeof payload.sv !== "number") {
      return null;
    }
    return { sub: payload.sub, username: payload.username, sv: payload.sv };
  } catch {
    return null;
  }
}
