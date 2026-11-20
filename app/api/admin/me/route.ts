import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { handle, json, requireAdmin } from "@/lib/http";

/** Current admin plus the unread enquiry count for the sidebar badge. */
export const GET = handle(async (req: NextRequest) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const { enquiries } = await collections();
  return json({ username: g.session.username, newEnquiries: await enquiries.countDocuments({ status: "new" }) });
});
