import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { enquiryFilter } from "@/lib/enquiry-query";
import { handle, requireAdmin } from "@/lib/http";

/** Quotes a CSV cell and neutralises spreadsheet formulas (=, +, -, @) that a visitor could inject. */
function cell(v: string): string {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Downloads enquiries matching the current filters as CSV (opens in Excel / Google Sheets). */
export const GET = handle(async (req: NextRequest) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const { enquiries } = await collections();
  const rows = await enquiries.find(enquiryFilter(req.nextUrl.searchParams)).sort({ createdAt: -1 }).limit(5000).toArray();

  const header = ["Received (UTC)", "Name", "Email", "Phone", "Service", "Status", "Message", "Admin note"];
  const lines = [header.map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [r.createdAt.toISOString().replace("T", " ").slice(0, 16), r.name, r.email, r.phone, r.service, r.status, r.message, r.note ?? ""]
        .map(cell)
        .join(","),
    );
  }
  const date = new Date().toISOString().slice(0, 10);
  // BOM so Excel reads UTF-8 names correctly
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
