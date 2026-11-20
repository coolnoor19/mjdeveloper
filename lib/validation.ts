import { z } from "zod";
import { SERVICE_OPTIONS } from "./site";

const phone = z
  .string()
  .trim()
  .min(1, "Please enter your mobile number.")
  .max(20, "Please enter a valid mobile number.")
  .regex(/^\+?[0-9\s().-]+$/, "Please enter a valid mobile number.")
  .refine((v) => {
    const digits = v.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  }, "Please enter a valid mobile number (7 to 15 digits).");

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Name is too long."),
  phone,
  email: z.string().trim().max(150, "Email is too long.").pipe(z.email("Please enter a valid email address.")),
  service: z.enum(SERVICE_OPTIONS).catch("Other"),
  message: z.string().trim().max(2000, "Please keep the message under 2000 characters.").default(""),
  website: z.string().optional(), // honeypot
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

export const enquiryUpdateSchema = z
  .object({
    status: z.enum(["new", "contacted", "closed"]).optional(),
    note: z.string().trim().max(2000).optional(),
  })
  .refine((v) => v.status !== undefined || v.note !== undefined, "Nothing to update.");

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(30),
  password: z.string().min(1).max(200),
});

export const setupSchema = z
  .object({
    token: z.string().min(1, "Enter the setup token."),
    username: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_.-]{3,30}$/, "Username: 3 to 30 letters, numbers, dot, dash or underscore."),
    password: z.string().min(10, "Password must be at least 10 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    password: z.string().min(10, "New password must be at least 10 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Enter a project name.").max(120, "Keep the name under 120 characters."),
  location: z.string().trim().max(100).default(""),
  category: z.string().trim().max(100).default(""),
  year: z
    .string()
    .trim()
    .regex(/^(\d{4})?$/, "Year must be four digits.")
    .default(""),
  description: z.string().trim().max(400, "Keep the description under 400 characters.").default(""),
  sortOrder: z.coerce.number().int().min(-9999).max(9999).default(0),
  isPublished: z
    .union([z.boolean(), z.enum(["true", "false", "on"])])
    .transform((v) => v === true || v === "true" || v === "on")
    .default(true),
});

/** Field errors as { field: firstMessage } for forms. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
