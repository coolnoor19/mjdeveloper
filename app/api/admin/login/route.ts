import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { clientIp, error, handle, json, sameOrigin, setSessionCookie } from "@/lib/http";
import { signSession } from "@/lib/jwt";
import { hits, record, reset } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

const MAX_FAILS = 5;
const LOCK_SECONDS = 15 * 60;
// Compared against when the username does not exist, so response time does not reveal valid usernames.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("not-a-real-password", 12));

export const POST = handle(async (req: NextRequest) => {
  if (!sameOrigin(req)) return error("Cross-site request blocked.", 403);
  const key = `login:${clientIp(req)}`;
  if ((await hits(key)) >= MAX_FAILS) {
    return error("Too many failed attempts. Please wait 15 minutes and try again.", 429);
  }

  const parsed = loginSchema.safeParse(await req.json().catch(() => ({})));
  const { users } = await collections();
  const user = parsed.success ? await users.findOne({ username: parsed.data.username }) : null;
  const ok = await bcrypt.compare(parsed.success ? parsed.data.password : "", user?.passwordHash ?? (await getDummyHash()));

  if (!user || !ok) {
    await record(key, LOCK_SECONDS);
    return error("Incorrect username or password.", 401);
  }

  await reset(key);
  const token = await signSession({ sub: String(user._id), username: user.username, sv: user.sessionVersion });
  const res = json({ ok: true, username: user.username });
  setSessionCookie(res, token);
  return res;
});
