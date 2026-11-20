import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { toEnquiry } from "@/lib/dto";
import { error, handle, json, parseId, requireAdmin } from "@/lib/http";
import { enquiryUpdateSchema, fieldErrors } from "@/lib/validation";

type Ctx = RouteContext<"/api/admin/enquiries/[id]">;

/** Update status (new / contacted / closed) and the private admin note. */
export const PATCH = handle(async (req: NextRequest, ctx: Ctx) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const id = parseId((await ctx.params).id);
  if (!id) return error("Not found.", 404);
  const parsed = enquiryUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return error("Invalid update.", 422, { fields: fieldErrors(parsed.error) });

  const { enquiries } = await collections();
  const doc = await enquiries.findOneAndUpdate(
    { _id: id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!doc) return error("Not found.", 404);
  return json({ enquiry: toEnquiry(doc) });
});

export const DELETE = handle(async (req: NextRequest, ctx: Ctx) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const id = parseId((await ctx.params).id);
  if (!id) return error("Not found.", 404);
  const { enquiries } = await collections();
  const r = await enquiries.deleteOne({ _id: id });
  if (!r.deletedCount) return error("Not found.", 404);
  return json({ ok: true });
});
