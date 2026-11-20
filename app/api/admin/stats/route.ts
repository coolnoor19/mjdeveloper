import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { toEnquiry } from "@/lib/dto";
import { handle, json, requireAdmin } from "@/lib/http";

const DAYS = 14;

/** Dashboard numbers: totals, enquiries per day for the last two weeks, and a breakdown by service. */
export const GET = handle(async (req: NextRequest) => {
  const g = await requireAdmin(req);
  if (!g.ok) return g.response;
  const { enquiries, projects } = await collections();

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (DAYS - 1));
  const weekAgo = new Date(Date.now() - 7 * 864e5);

  const [total, fresh, contacted, closed, lastWeek, projectsTotal, projectsLive, perDay, byService, recent] =
    await Promise.all([
      enquiries.countDocuments(),
      enquiries.countDocuments({ status: "new" }),
      enquiries.countDocuments({ status: "contacted" }),
      enquiries.countDocuments({ status: "closed" }),
      enquiries.countDocuments({ createdAt: { $gte: weekAgo } }),
      projects.countDocuments(),
      projects.countDocuments({ isPublished: true }),
      enquiries
        .aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: start } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        ])
        .toArray(),
      enquiries
        .aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$service", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      enquiries.find().sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

  const counts = new Map(perDay.map((d) => [d._id, d.count]));
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: counts.get(key) ?? 0 };
  });

  return json({
    enquiries: { total, new: fresh, contacted, closed, lastWeek },
    projects: { total: projectsTotal, published: projectsLive },
    days,
    byService: byService.map((s) => ({ service: s._id || "Other", count: s.count })),
    recent: recent.map(toEnquiry),
  });
});
