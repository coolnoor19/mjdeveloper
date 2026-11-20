import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { ObjectId } from "mongodb";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, verifySession, type SessionClaims } from "./jwt";
import { collections } from "./db";

export function json<T>(data: T, init?: number | ResponseInit) {
  const opts = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data, {
    ...opts,
    headers: { "Cache-Control": "no-store", ...(opts?.headers ?? {}) },
  });
}

export function error(message: string, status = 400, extra?: Record<string, unknown>) {
  return json({ error: message, ...extra }, status);
}

/** Client IP for rate limiting. Behind a proxy or host such as Vercel, x-forwarded-for is set by the platform. */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Blocks cross-site requests to state-changing endpoints. Browsers always send
 * Origin on POST/PATCH/DELETE fetches, so a missing or foreign Origin is rejected.
 */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function parseId(id: string): ObjectId | null {
  return ObjectId.isValid(id) && /^[a-f0-9]{24}$/i.test(id) ? new ObjectId(id) : null;
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

type Guard = { ok: true; session: SessionClaims; userId: ObjectId } | { ok: false; response: NextResponse };

/**
 * Verifies the admin session for an API route: valid signature, user still exists,
 * and the password has not changed since sign-in. Mutating methods also need a same-origin request.
 */
export async function requireAdmin(req: NextRequest): Promise<Guard> {
  if (req.method !== "GET" && req.method !== "HEAD" && !sameOrigin(req)) {
    return { ok: false, response: error("Cross-site request blocked.", 403) };
  }
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const userId = session ? parseId(session.sub) : null;
  if (!session || !userId) return { ok: false, response: error("Please sign in.", 401) };
  const { users } = await collections();
  const user = await users.findOne({ _id: userId }, { projection: { sessionVersion: 1 } });
  if (!user || user.sessionVersion !== session.sv) {
    const res = error("Your session has ended. Please sign in again.", 401);
    clearSessionCookie(res);
    return { ok: false, response: res };
  }
  return { ok: true, session, userId };
}

/** Wraps a handler so database outages return a clean 503 instead of a stack trace. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      unstable_rethrow(err); // let Next.js's own control-flow errors (e.g. from connection()) through
      console.error("[api]", err);
      return error("Something went wrong on our side. Please try again shortly.", 503);
    }
  };
}
