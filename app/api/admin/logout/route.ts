import type { NextRequest } from "next/server";
import { clearSessionCookie, error, json, sameOrigin } from "@/lib/http";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return error("Cross-site request blocked.", 403);
  const res = json({ ok: true });
  clearSessionCookie(res);
  return res;
}
