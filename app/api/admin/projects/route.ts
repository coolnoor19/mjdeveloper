import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { toProject } from "@/lib/dto";
import { error, handle, json, requireAdmin } from "@/lib/http";
import { ImageError, saveImage } from "@/lib/images";
import { readProjectForm } from "@/lib/project-form";

/** All projects, published and hidden. */
export const GET = handle(async (req: NextRequest) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const { projects } = await collections();
  const docs = await projects.find().sort({ sortOrder: 1, createdAt: -1 }).toArray();
  return json({ projects: docs.map(toProject) });
});

/** Creates a project from a multipart form with a required photo. */
export const POST = handle(async (req: NextRequest) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const form = await readProjectForm(req);
  if (!form.ok) return error("Please fix the highlighted fields.", 422, { fields: form.fields });
  if (!form.image) return error("Please choose a project photo.", 422, { fields: { image: "Please choose a project photo." } });

  let imageId;
  try {
    imageId = await saveImage(form.image);
  } catch (e) {
    if (e instanceof ImageError) return error(e.message, 422, { fields: { image: e.message } });
    throw e;
  }
  const { projects } = await collections();
  const now = new Date();
  const doc = { ...form.data, imageId, createdAt: now, updatedAt: now };
  const { insertedId } = await projects.insertOne(doc);
  return json({ project: toProject({ ...doc, _id: insertedId }) }, 201);
});
