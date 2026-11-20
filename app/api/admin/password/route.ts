import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { error, handle, json, requireAdmin, setSessionCookie } from "@/lib/http";
import { signSession } from "@/lib/jwt";
import { fieldErrors, passwordSchema } from "@/lib/validation";

/** Changes the password and signs out every other session. */
export const POST = handle(async (req: NextRequest) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const parsed = passwordSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return error("Please fix the highlighted fields.", 422, { fields: fieldErrors(parsed.error) });

  const { users } = await collections();
  const user = await users.findOne({ _id: g.userId });
  if (!user) return error("Please sign in.", 401);
  if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) {
    return error("Current password is not correct.", 422, { fields: { current: "Current password is not correct." } });
  }

  const sessionVersion = user.sessionVersion + 1;
  await users.updateOne(
    { _id: user._id },
    { $set: { passwordHash: await bcrypt.hash(parsed.data.password, 12), sessionVersion } },
  );
  const res = json({ ok: true });
  setSessionCookie(res, await signSession({ sub: String(user._id), username: user.username, sv: sessionVersion }));
  return res;
});
