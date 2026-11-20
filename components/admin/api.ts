"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) {
    super(message);
  }
}

/** fetch wrapper for /api/admin: JSON in/out, and a signed-out session sends you to the login page. */
export async function api<T>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !url.includes("/login")) {
    // full reload on purpose: drops all in-memory admin data
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiError("Please sign in.", 401);
  }
  if (!res.ok) throw new ApiError(data.error ?? "Something went wrong.", res.status, data.fields ?? {});
  return data as T;
}

const tz = "Asia/Kolkata";
export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: tz }).format(new Date(iso));
export const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(iso));

export function timeAgo(iso: string): string {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [u, n] of units) if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
  return "just now";
}
