"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { EnquiryStatus } from "@/lib/db";
import type { Enquiry } from "@/lib/dto";
import { SERVICE_OPTIONS } from "@/lib/site";
import { api, ApiError, fmtDate, timeAgo } from "./api";
import { useMe } from "./AdminShell";
import { Button, Card, Modal, PageHeader, Spinner, STATUS, StatusBadge, useConfirm, useToast } from "./ui";

type ListRes = {
  items: Enquiry[];
  page: number;
  pages: number;
  total: number;
  counts: { all: number; new: number; contacted: number; closed: number };
};
type Tab = "all" | EnquiryStatus;
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "closed", label: "Closed" },
];

function Detail({ e, onChange, onDelete }: { e: Enquiry; onChange: (e: Enquiry) => void; onDelete: () => void }) {
  const [note, setNote] = useState(e.note);
  const [saving, setSaving] = useState<string>("");
  const toast = useToast();
  const confirm = useConfirm();
  const { refresh } = useMe();

  async function patch(body: { status?: EnquiryStatus; note?: string }, what: string) {
    setSaving(what);
    try {
      const r = await api<{ enquiry: Enquiry }>(`/api/admin/enquiries/${e.id}`, { method: "PATCH", json: body });
      onChange(r.enquiry);
      refresh();
      toast(what === "note" ? "Note saved" : `Marked as ${STATUS[r.enquiry.status].label.toLowerCase()}`);
    } catch (ex) {
      toast(ex instanceof ApiError ? ex.message : "Could not save", "err");
    }
    setSaving("");
  }

  const subject = encodeURIComponent("Your enquiry to MJ Developer");
  const greeting = encodeURIComponent(`Dear ${e.name},\n\nThank you for contacting MJ Developer about ${e.service.toLowerCase()}.\n\n`);
  const tel = e.phone.replace(/[^0-9+]/g, "");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-lg font-bold text-paper">{e.name.charAt(0).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="text-xl font-bold">{e.name}</p>
          <p className="text-sm text-muted">Received {fmtDate(e.createdAt)} ({timeAgo(e.createdAt)})</p>
        </div>
      </div>

      <dl className="grid gap-3 rounded-2xl border border-ink/10 bg-card p-4 text-sm sm:grid-cols-2">
        <div><dt className="text-muted">Email</dt><dd><a className="break-all font-semibold hover:underline" href={`mailto:${e.email}`}>{e.email}</a></dd></div>
        <div><dt className="text-muted">Mobile</dt><dd><a className="font-semibold hover:underline" href={`tel:${tel}`}>{e.phone}</a></dd></div>
        <div className="sm:col-span-2"><dt className="text-muted">Service</dt><dd className="font-semibold">{e.service}</dd></div>
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted">Message</h3>
        <p className="whitespace-pre-wrap rounded-2xl bg-paper-2 p-4 leading-relaxed">{e.message || <span className="text-muted">No message was included.</span>}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a href={`mailto:${e.email}?subject=${subject}&body=${greeting}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-ink font-semibold text-paper hover:bg-ink-3">Reply by email</a>
        <a href={`tel:${tel}`} className="inline-flex h-11 items-center justify-center rounded-xl border border-ink/15 bg-card font-semibold hover:border-ink/40">Call</a>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted">Status</h3>
        <div role="radiogroup" aria-label="Status" className="grid grid-cols-3 gap-1 rounded-xl bg-ink/[0.05] p-1">
          {(Object.keys(STATUS) as EnquiryStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={e.status === s}
              disabled={!!saving}
              onClick={() => e.status !== s && patch({ status: s }, "status")}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${e.status === s ? "bg-card shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <span className={`size-2 rounded-full ${STATUS[s].dot}`} />
              {STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="note" className="mb-2 block text-sm font-semibold text-muted">Private note</label>
        <textarea
          id="note"
          className="field-input min-h-28"
          maxLength={2000}
          placeholder="e.g. Called on Monday, site visit booked for the 14th."
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" disabled={note === e.note || !!saving} onClick={() => patch({ note }, "note")}>
            {saving === "note" ? <Spinner /> : null} Save note
          </Button>
        </div>
      </div>

      <div className="border-t border-ink/10 pt-5">
        <Button
          variant="danger"
          size="sm"
          onClick={async () => {
            if (await confirm({ title: "Delete this enquiry?", body: `The enquiry from ${e.name} will be removed permanently.` })) onDelete();
          }}
        >
          Delete enquiry
        </Button>
      </div>
    </div>
  );
}

export function Enquiries({ initialStatus, initialOpen }: { initialStatus?: string; initialOpen?: string }) {
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.key === initialStatus) ? (initialStatus as Tab) : "all");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [service, setService] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListRes | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [openId, setOpenId] = useState<string | null>(initialOpen ?? null);
  const toast = useToast();
  const { refresh } = useMe();

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (tab !== "all") p.set("status", tab);
    if (query) p.set("q", query);
    if (service) p.set("service", service);
    return p;
  }, [tab, query, service]);

  const key = `${params}&page=${page}`;
  const loading = loadedKey !== key;

  // State is only set after the request resolves, so a slow response never flashes stale UI
  const load = useCallback(
    (silent = false) =>
      api<ListRes>(`/api/admin/enquiries?${key}`)
        .then(setData)
        .catch((ex) => {
          if (!silent) toast(ex instanceof ApiError ? ex.message : "Could not load enquiries", "err");
        })
        .finally(() => setLoadedKey(key)),
    [key, toast],
  );

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 30_000); // new enquiries appear without reloading
    return () => clearInterval(t);
  }, [load]);

  const openItem = (openId && data?.items.find((i) => i.id === openId)) || null;

  const close = useCallback(() => {
    setOpenId(null);
    if (window.location.search.includes("open=")) window.history.replaceState(null, "", "/admin/enquiries");
  }, []);

  const update = (e: Enquiry) => {
    setData((d) => d && { ...d, items: d.items.map((i) => (i.id === e.id ? e : i)) });
    load(true);
  };

  async function remove(id: string) {
    try {
      await api(`/api/admin/enquiries/${id}`, { method: "DELETE" });
      toast("Enquiry deleted");
      close();
      refresh();
      load(true);
    } catch (ex) {
      toast(ex instanceof ApiError ? ex.message : "Could not delete", "err");
    }
  }

  const counts = data?.counts;
  return (
    <>
      <PageHeader
        title="Enquiries"
        sub="Messages sent through the website contact form."
        actions={
          <a href={`/api/admin/enquiries/export?${params}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink/15 bg-card px-4 font-semibold hover:border-ink/40">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" /></svg>
            Export CSV
          </a>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <div role="tablist" aria-label="Filter by status" className="inline-flex gap-1 rounded-xl bg-ink/[0.05] p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => { setTab(t.key); setPage(1); }}
                className={`flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-colors ${tab === t.key ? "bg-card shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {t.label}
                {counts && <span className={`rounded-full px-1.5 text-xs ${t.key === "new" && counts.new ? "bg-brand text-white" : "bg-ink/[0.07]"}`}>{counts[t.key]}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, message…" aria-label="Search enquiries" className="field-input !py-2.5 sm:w-72" />
          <select value={service} onChange={(e) => { setService(e.target.value); setPage(1); }} aria-label="Filter by service" className="field-input !py-2.5 sm:w-52">
            <option value="">All services</option>
            {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1.6fr_1fr_1.1fr_0.9fr_0.8fr] gap-4 border-b border-ink/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
          <span>From</span><span>Mobile</span><span>Service</span><span>Received</span><span>Status</span>
        </div>
        {loading && !data ? (
          <div className="grid place-items-center py-20 text-muted"><Spinner className="size-6" /></div>
        ) : !data?.items.length ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">{query || service || tab !== "all" ? "No enquiries match these filters." : "No enquiries yet."}</p>
            <p className="mt-1 text-sm text-muted">{query || service || tab !== "all" ? "Try clearing the search or picking another tab." : "Messages from the website contact form will appear here."}</p>
          </div>
        ) : (
          <ul className={`divide-y divide-ink/10 transition-opacity ${loading ? "opacity-60" : ""}`}>
            {data.items.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(r.id)}
                  className="grid w-full gap-1 px-5 py-4 text-left transition-colors hover:bg-ink/[0.025] md:grid-cols-[1.6fr_1fr_1.1fr_0.9fr_0.8fr] md:items-center md:gap-4"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`size-2 shrink-0 rounded-full ${r.status === "new" ? "bg-brand" : "bg-transparent"}`} aria-hidden />
                    <span className="min-w-0">
                      <span className={`block truncate ${r.status === "new" ? "font-bold" : "font-medium"}`}>{r.name}</span>
                      <span className="block truncate text-sm text-muted">{r.email}</span>
                    </span>
                    <span className="ml-auto md:hidden"><StatusBadge status={r.status} /></span>
                  </span>
                  <span className="pl-5 text-sm md:pl-0">{r.phone}</span>
                  <span className="truncate pl-5 text-sm text-muted md:pl-0 md:text-ink">{r.service}</span>
                  <span className="pl-5 text-sm text-muted md:pl-0" title={fmtDate(r.createdAt)}>{timeAgo(r.createdAt)}</span>
                  <span className="hidden md:block"><StatusBadge status={r.status} /></span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">Page {data.page} of {data.pages} · {data.total} enquiries</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Modal side open={!!openId} onClose={close} title="Enquiry">
        {openItem ? (
          <Detail key={openItem.id + openItem.updatedAt} e={openItem} onChange={update} onDelete={() => remove(openItem.id)} />
        ) : (
          <p className="text-muted">{loading ? "Loading…" : "This enquiry is not in the current list. It may have been deleted or filtered out."}</p>
        )}
      </Modal>
    </>
  );
}
