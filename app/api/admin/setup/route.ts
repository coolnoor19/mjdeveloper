import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { connection, type NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { error, handle, json, sameOrigin } from "@/lib/http";
import { fieldErrors, setupSchema } from "@/lib/validation";

function tokenMatches(given: string): boolean {
  const expected = process.env.SETUP_TOKEN ?? "";
  if (expected.length < 12) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Whether the one-time admin setup is still open. */
export const GET = handle(async () => {
  await connection();
  const { users } = await collections();
  return json({ needed: (await users.countDocuments({}, { limit: 1 })) === 0, configured: (process.env.SETUP_TOKEN ?? "").length >= 12 });
});

/** Creates the first admin. Locked once any admin exists, and requires SETUP_TOKEN from the server env. */
export const POST = handle(async (req: NextRequest) => {
  if (!sameOrigin(req)) return error("Cross-site request blocked.", 403);
  const { users } = await collections();
  if ((await users.countDocuments({}, { limit: 1 })) > 0) return error("Setup is already complete.", 403);

  const parsed = setupSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return error("Please fix the highlighted fields.", 422, { fields: fieldErrors(parsed.error) });
  if (!tokenMatches(parsed.data.token)) {
    return error("The setup token is not correct.", 403, { fields: { token: "The setup token is not correct." } });
  }

  try {
    await users.insertOne({
      username: parsed.data.username,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      sessionVersion: 1,
      createdAt: new Date(),
    });
  } catch {
    return error("Setup is already complete.", 403);
  }
  return json({ ok: true }, 201);
});
