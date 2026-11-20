import { connection } from "next/server";
import { getDb } from "@/lib/db";

/** Liveness check for Docker and uptime monitors. */
export async function GET() {
  await connection();
  try {
    await (await getDb()).command({ ping: 1 });
    return Response.json({ ok: true, db: "up" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
