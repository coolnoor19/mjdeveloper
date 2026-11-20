"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Enquiry } from "@/lib/dto";
import { api, fmtDay, timeAgo } from "./api";
import { Card, PageHeader, Spinner, StatusBadge } from "./ui";

type Stats = {
  enquiries: { total: number; new: number; contacted: number; closed: number; lastWeek: number };
  projects: { total: number; published: number };
  days: { date: string; count: number }[];
  byService: { service: string; count: number }[];
  recent: Enquiry[];
};

function Tile({ label, value, note, accent, href }: { label: string; value: number; note?: string; accent?: boolean; href?: string }) {
  const body = (
    <Card className={`h-full p-5 transition-colors md:p-6 ${href ? "hover:border-ink/30" : ""} ${accent ? "!border-brand/30 !bg-brand/[0.04]" : ""}`}>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-[2.75rem]">{value}</p>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
    </Card>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

/** Single-series column chart: enquiries per day. One ink hue, hover shows the exact count. */
function DailyChart({ days }: { days: Stats["days"] }) {
  // even ceiling so the midline tick is a whole number
  const peak = Math.max(...days.map((d) => d.count));
  const max = Math.max(2, Math.ceil(peak / 2) * 2);
  const [hover, setHover] = useState<number | null>(null);
  const total = days.reduce((n, d) => n + d.count, 0);
  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-semibold">Enquiries per day</h2>
        <span className="text-sm text-muted">Last 14 days · {total} total</span>
      </div>
      <div className="relative mt-6 h-44" onMouseLeave={() => setHover(null)}>
        {/* recessive gridlines */}
        {[0, 0.5, 1].map((f) => (
          <div key={f} className="absolute inset-x-0 border-t border-ink/[0.07]" style={{ bottom: `${f * 100}%` }}>
            <span className="absolute -top-2.5 right-0 bg-card pl-1 text-[11px] text-muted">{Math.round(max * f)}</span>
          </div>
        ))}
        <div className="absolute inset-0 right-6 flex items-end gap-[2px]">
          {days.map((d, i) => (
            <div
              key={d.date}
              className="relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              aria-label={`${fmtDay(d.date)}: ${d.count} enquiries`}
            >
              <motion.div
                className={`w-full rounded-t-[4px] ${hover === i ? "bg-brand" : "bg-ink"}`}
                initial={{ height: 0 }}
                animate={{ height: d.count ? `${(d.count / max) * 100}%` : "2px" }}
                transition={{ duration: 0.7, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                style={{ opacity: d.count ? 1 : 0.15 }}
              />
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-paper shadow-lg">
                  <b>{d.count}</b> · {fmtDay(d.date)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between pr-6 text-[11px] text-muted">
        <span>{fmtDay(days[0].date)}</span>
        <span>{fmtDay(days[days.length - 1].date)}</span>
      </div>
      <table className="sr-only">
        <caption>Enquiries per day, last 14 days</caption>
        <tbody>{days.map((d) => <tr key={d.date}><th>{d.date}</th><td>{d.count}</td></tr>)}</tbody>
      </table>
    </Card>
  );
}

/** Single-series horizontal bars: which services people ask about. Values are direct-labelled. */
function ServiceChart({ rows }: { rows: Stats["byService"] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold">Enquiries by service</h2>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No enquiries yet.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3.5">
          {rows.map((r, i) => (
            <li key={r.service} title={`${r.service}: ${r.count}`}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="truncate">{r.service}</span>
                <span className="font-semibold tabular-nums">{r.count}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-ink/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-ink"
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.count / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    api<Stats>("/api/admin/stats").then((s) => { setStats(s); setError(""); }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  if (!stats)
    return (
      <div className="grid min-h-[50vh] place-items-center text-muted">
        {error ? <p className="text-brand">{error}</p> : <Spinner className="size-6" />}
      </div>
    );

  const e = stats.enquiries;
  return (
    <>
      <PageHeader title="Dashboard" sub="Contact form activity and website content at a glance." />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Tile label="New enquiries" value={e.new} note="Waiting for a reply" accent={e.new > 0} href="/admin/enquiries?status=new" />
        <Tile label="Last 7 days" value={e.lastWeek} note="Enquiries received" />
        <Tile label="All enquiries" value={e.total} note={`${e.contacted} contacted · ${e.closed} closed`} href="/admin/enquiries" />
        <Tile label="Live projects" value={stats.projects.published} note={`${stats.projects.total} in total`} href="/admin/projects" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <DailyChart days={stats.days} />
        <ServiceChart rows={stats.byService} />
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 md:px-6">
          <h2 className="font-semibold">Latest enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-muted">No enquiries yet. They will appear here as soon as someone uses the contact form.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {stats.recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/enquiries?open=${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-ink/[0.02] md:px-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink/[0.06] font-semibold">{r.name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate ${r.status === "new" ? "font-bold" : "font-medium"}`}>{r.name}</p>
                    <p className="truncate text-sm text-muted">{r.service}{r.message ? ` · ${r.message}` : ""}</p>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-muted">{timeAgo(r.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
