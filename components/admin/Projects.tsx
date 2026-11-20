"use client";
/* eslint-disable @next/next/no-img-element -- photos are served from MongoDB through /api/images */
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Project } from "@/lib/dto";
import { api, ApiError } from "./api";
import { Button, Card, Field, Modal, PageHeader, Spinner, useConfirm, useToast } from "./ui";

const MAX = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

function toForm(p: Partial<Project>, image?: File | null): FormData {
  const f = new FormData();
  f.set("title", p.title ?? "");
  f.set("location", p.location ?? "");
  f.set("category", p.category ?? "");
  f.set("year", p.year ?? "");
  f.set("description", p.description ?? "");
  f.set("sortOrder", String(p.sortOrder ?? 0));
  f.set("isPublished", String(p.isPublished ?? true));
  if (image) f.set("image", image);
  return f;
}

function ProjectForm({ initial, onSaved }: { initial: Project | null; onSaved: () => void }) {
  const [v, setV] = useState<Partial<Project>>(
    initial ?? { title: "", location: "", category: "", year: String(new Date().getFullYear()), description: "", sortOrder: 0, isPublished: true },
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.image ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const toast = useToast();

  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!TYPES.includes(f.type)) return setErrors((e) => ({ ...e, image: "Only JPG, PNG or WebP photos are allowed." }));
    if (f.size > MAX) return setErrors((e) => ({ ...e, image: "The photo must be 5 MB or smaller." }));
    setErrors((e) => { const next = { ...e }; delete next.image; return next; });
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  const set = (k: keyof Project) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((s) => ({ ...s, [k]: k === "sortOrder" ? Number(e.target.value) : e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!initial && !file) return setErrors({ image: "Please choose a project photo." });
    setBusy(true);
    setErrors({});
    try {
      await api(initial ? `/api/admin/projects/${initial.id}` : "/api/admin/projects", {
        method: initial ? "PATCH" : "POST",
        body: toForm(v, file),
      });
      toast(initial ? "Project updated" : "Project added");
      onSaved();
    } catch (ex) {
      if (ex instanceof ApiError) setErrors({ ...ex.fields, _: ex.message });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {errors._ && <p role="alert" className="rounded-xl bg-brand/[0.07] px-4 py-3 text-sm font-medium text-brand-deep">{errors._}</p>}
      <div>
        <span className="mb-1.5 block text-sm font-semibold">Project photo</span>
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`relative flex aspect-[16/9] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center transition-colors ${drag ? "border-brand bg-brand/5" : errors.image ? "border-brand/50" : "border-ink/15 hover:border-ink/40"}`}
        >
          {preview ? (
            <>
              <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
              <span className="absolute bottom-3 rounded-full bg-ink/80 px-4 py-2 text-sm font-semibold text-paper backdrop-blur">Change photo</span>
            </>
          ) : (
            <span className="px-6 text-muted">
              <b className="block text-ink">Drop a photo here or tap to choose</b>
              JPG, PNG or WebP, up to 5 MB. Landscape photos look best.
            </span>
          )}
          <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        {errors.image && <p className="mt-1.5 text-sm font-medium text-brand">{errors.image}</p>}
      </div>

      <Field label="Project name" htmlFor="p-title" error={errors.title}>
        <input id="p-title" className="field-input" maxLength={120} required value={v.title} onChange={set("title")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="p-loc" error={errors.location}>
          <input id="p-loc" className="field-input" maxLength={100} placeholder="e.g. Puri" value={v.location} onChange={set("location")} />
        </Field>
        <Field label="Project type" htmlFor="p-cat" error={errors.category} hint="Used as a filter on the website">
          <input id="p-cat" className="field-input" maxLength={100} placeholder="e.g. Housing layout" value={v.category} onChange={set("category")} />
        </Field>
        <Field label="Year completed" htmlFor="p-year" error={errors.year}>
          <input id="p-year" className="field-input" inputMode="numeric" maxLength={4} value={v.year} onChange={set("year")} />
        </Field>
        <Field label="Display order" htmlFor="p-order" error={errors.sortOrder} hint="Smaller numbers show first">
          <input id="p-order" type="number" className="field-input" value={v.sortOrder} onChange={set("sortOrder")} />
        </Field>
      </div>
      <Field label="Short description (optional)" htmlFor="p-desc" error={errors.description} hint={`${(v.description ?? "").length} / 400`}>
        <textarea id="p-desc" className="field-input min-h-24" maxLength={400} value={v.description} onChange={set("description")} />
      </Field>
      <label className="flex items-center gap-3 rounded-xl border border-ink/10 bg-card p-4">
        <input type="checkbox" className="size-5 accent-[var(--color-leaf)]" checked={!!v.isPublished} onChange={(e) => setV((s) => ({ ...s, isPublished: e.target.checked }))} />
        <span><b className="block text-sm">Show on website</b><span className="text-sm text-muted">Untick to keep it as a hidden draft.</span></span>
      </label>
      <Button type="submit" disabled={busy}>{busy ? <><Spinner /> Saving…</> : initial ? "Save changes" : "Upload and publish"}</Button>
    </form>
  );
}

export function Projects() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [editing, setEditing] = useState<Project | null | "new">(null);
  const toast = useToast();
  const confirm = useConfirm();

  const load = useCallback(() => {
    api<{ projects: Project[] }>("/api/admin/projects").then((r) => setItems(r.projects)).catch((e) => toast(e.message, "err"));
  }, [toast]);
  useEffect(load, [load]);
  const close = useCallback(() => setEditing(null), []);

  async function togglePublish(p: Project) {
    setItems((list) => list?.map((x) => (x.id === p.id ? { ...x, isPublished: !p.isPublished } : x)) ?? null);
    try {
      await api(`/api/admin/projects/${p.id}`, { method: "PATCH", body: toForm({ ...p, isPublished: !p.isPublished }) });
      toast(p.isPublished ? "Hidden from website" : "Published on website");
    } catch (ex) {
      toast(ex instanceof ApiError ? ex.message : "Could not update", "err");
      load();
    }
  }

  async function remove(p: Project) {
    if (!(await confirm({ title: "Delete this project?", body: `"${p.title}" and its photo will be removed permanently.` }))) return;
    try {
      await api(`/api/admin/projects/${p.id}`, { method: "DELETE" });
      toast("Project deleted");
      load();
    } catch (ex) {
      toast(ex instanceof ApiError ? ex.message : "Could not delete", "err");
    }
  }

  const live = items?.filter((p) => p.isPublished).length ?? 0;
  return (
    <>
      <PageHeader
        title="Projects"
        sub={items ? `${live} of ${items.length} shown in the “Projects we have delivered” gallery.` : "Photos shown in the website gallery."}
        actions={<Button variant="brand" onClick={() => setEditing("new")}>+ Add project</Button>}
      />

      {!items ? (
        <div className="grid place-items-center py-20 text-muted"><Spinner className="size-6" /></div>
      ) : items.length === 0 ? (
        <Card className="bg-blueprint px-6 py-16 text-center">
          <p className="text-lg font-semibold">No projects yet</p>
          <p className="mt-1 text-muted">Add your first completed project with a photo. It appears on the website straight away.</p>
          <Button variant="brand" className="mt-6" onClick={() => setEditing("new")}>Add project</Button>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Card className="flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/10] bg-ink/5">
                  <img src={p.image} alt="" loading="lazy" className={`size-full object-cover ${p.isPublished ? "" : "opacity-50 grayscale"}`} />
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${p.isPublished ? "bg-leaf text-white" : "bg-ink/80 text-paper"}`}>
                    {p.isPublished ? "Live" : "Hidden"}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-semibold">#{p.sortOrder}</span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-bold leading-tight">{p.title}</p>
                  <p className="mt-1 text-sm text-muted">{[p.location, p.category, p.year].filter(Boolean).join(" · ") || "No details"}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(p)}>{p.isPublished ? "Hide" : "Publish"}</Button>
                    <Button size="sm" variant="danger" className="ml-auto" onClick={() => remove(p)}>Delete</Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal wide open={editing !== null} onClose={close} title={editing === "new" ? "Add a project" : "Edit project"}>
        {editing !== null && (
          <ProjectForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? null : editing}
            onSaved={() => { close(); load(); }}
          />
        )}
      </Modal>
    </>
  );
}
