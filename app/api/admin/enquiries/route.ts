import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { toEnquiry } from "@/lib/dto";
import { enquiryFilter } from "@/lib/enquiry-query";
import { handle, json, requireAdmin } from "@/lib/http";

const PAGE_SIZE = 20;

/** Paginated, filterable list of contact-form enquiries. */
export const GET = handle(async (req: NextRequest) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Math.min(10_000, Number(params.get("page")) || 1));
  const filter = enquiryFilter(params);

  const { enquiries } = await collections();
  const [items, total, counts] = await Promise.all([
    enquiries.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    enquiries.countDocuments(filter),
    enquiries.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
  ]);

  const byStatus = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  return json({
    items: items.map(toEnquiry),
    page,
    pageSize: PAGE_SIZE,
    total,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    counts: { all: counts.reduce((n, c) => n + c.count, 0), new: byStatus.new ?? 0, contacted: byStatus.contacted ?? 0, closed: byStatus.closed ?? 0 },
  });
});
