import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { toProject } from "@/lib/dto";
import { error, handle, json, parseId, requireAdmin } from "@/lib/http";
import { deleteImage, ImageError, saveImage } from "@/lib/images";
import { readProjectForm } from "@/lib/project-form";

type Ctx = RouteContext<"/api/admin/projects/[id]">;

/** Updates a project. The photo is replaced only if a new one is uploaded. */
export const PATCH = handle(async (req: NextRequest, ctx: Ctx) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const id = parseId((await ctx.params).id);
  if (!id) return error("Not found.", 404);
  const { projects } = await collections();
  const existing = await projects.findOne({ _id: id });
  if (!existing) return error("Not found.", 404);

  const form = await readProjectForm(req);
  if (!form.ok) return error("Please fix the highlighted fields.", 422, { fields: form.fields });

  let imageId = existing.imageId;
  if (form.image) {
    try {
      imageId = await saveImage(form.image);
    } catch (e) {
      if (e instanceof ImageError) return error(e.message, 422, { fields: { image: e.message } });
      throw e;
    }
  }
  const doc = await projects.findOneAndUpdate(
    { _id: id },
    { $set: { ...form.data, imageId, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (form.image) await deleteImage(existing.imageId);
  if (!doc) return error("Not found.", 404);
  return json({ project: toProject(doc) });
});

export const DELETE = handle(async (req: NextRequest, ctx: Ctx) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const id = parseId((await ctx.params).id);
  if (!id) return error("Not found.", 404);
  const { projects } = await collections();
  const doc = await projects.findOneAndDelete({ _id: id });
  if (!doc) return error("Not found.", 404);
  await deleteImage(doc.imageId);
  return json({ ok: true });
});
