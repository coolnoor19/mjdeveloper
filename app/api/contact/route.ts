import type { NextRequest } from "next/server";
import { collections } from "@/lib/db";
import { clientIp, error, handle, json } from "@/lib/http";
import { hits, record } from "@/lib/rate-limit";
import { enquirySchema, fieldErrors } from "@/lib/validation";

const LIMIT = 5; // enquiries per IP per hour
const WINDOW = 60 * 60;

/** Public contact form: validates, rate-limits and stores the enquiry for the admin panel. */
export const POST = handle(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return error("Invalid request.", 400);

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return error("Please check the highlighted fields and try again.", 422, { fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data;
  const firstName = input.name.split(/\s+/)[0];
  const thanks = `Thank you, ${firstName}. We will reply within two working days.`;

  // Honeypot: bots fill in the hidden field. Pretend it worked and store nothing.
  if (input.website) return json({ ok: true, message: thanks });

  const key = `contact:${clientIp(req)}`;
  if ((await hits(key)) >= LIMIT) {
    return error("Too many enquiries from this connection. Please try again later or call us directly.", 429);
  }

  const { enquiries } = await collections();
  const now = new Date();
  await enquiries.insertOne({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    service: input.service,
    message: input.message,
    status: "new",
    note: "",
    createdAt: now,
    updatedAt: now,
  });
  await record(key, WINDOW);

  return json({ ok: true, message: thanks }, 201);
});
