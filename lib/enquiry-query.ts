import "server-only";
import type { Filter } from "mongodb";
import type { EnquiryDoc } from "./db";

const STATUSES = new Set(["new", "contacted", "closed"]);

/** Builds the Mongo filter for the admin enquiry list from ?status=&q=&service= */
export function enquiryFilter(params: URLSearchParams): Filter<EnquiryDoc> {
  const filter: Filter<EnquiryDoc> = {};
  const status = params.get("status");
  if (status && STATUSES.has(status)) filter.status = status as EnquiryDoc["status"];
  const service = params.get("service");
  if (service) filter.service = service.slice(0, 100);
  const q = params.get("q")?.trim().slice(0, 100);
  if (q) {
    const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { message: rx }, { note: rx }];
  }
  return filter;
}
