import "server-only";
import { fieldErrors, projectSchema } from "./validation";

/** Reads the multipart project form: text fields plus an optional "image" file. */
export async function readProjectForm(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return { ok: false as const, fields: { _: "Invalid form data." } };
  const raw: Record<string, unknown> = {};
  for (const k of ["title", "location", "category", "year", "description", "sortOrder", "isPublished"]) {
    const v = form.get(k);
    if (typeof v === "string") raw[k] = v;
  }
  if (raw.isPublished === undefined) raw.isPublished = "false";
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, fields: fieldErrors(parsed.error) };
  const file = form.get("image");
  return { ok: true as const, data: parsed.data, image: file instanceof File && file.size > 0 ? file : null };
}
