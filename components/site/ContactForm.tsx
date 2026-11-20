"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { SERVICE_OPTIONS } from "@/lib/site";
import { ArrowRight } from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;
type Values = { name: string; phone: string; email: string; service: string; message: string; website: string };
const empty: Values = { name: "", phone: "", email: "", service: SERVICE_OPTIONS[0], message: "", website: "" };
const MAX_MSG = 2000;

/** Same rules as the server, so most mistakes are caught before sending. */
function check(v: Values): Record<string, string> {
  const e: Record<string, string> = {};
  if (!v.name.trim()) e.name = "Please enter your name.";
  const digits = v.phone.replace(/\D/g, "").length;
  if (!v.phone.trim()) e.phone = "Please enter your mobile number.";
  else if (!/^\+?[0-9\s().-]+$/.test(v.phone.trim()) || digits < 7 || digits > 15)
    e.phone = "Please enter a valid mobile number (7 to 15 digits).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Please enter a valid email address.";
  return e;
}

function Field({
  id, label, error, required, optional, children,
}: { id: string; label: string; error?: string; required?: boolean; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label} {required && <span className="text-brand" aria-hidden>*</span>}
        {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-err`}
            className="text-sm font-medium text-brand"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactForm() {
  const [v, setV] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [banner, setBanner] = useState<string>("");
  const [thanks, setThanks] = useState<string>("");

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setV((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((e) => { const next = { ...e }; delete next[k]; return next; });
  };
  const a11y = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": `f-${k}-err` } : {});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const found = check(v);
    setErrors(found);
    if (Object.keys(found).length) {
      setBanner("Please check the highlighted fields.");
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setBanner("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setThanks(data.message ?? "Thank you. We will reply within two working days.");
        setStatus("done");
        setV(empty);
        return;
      }
      if (data.fields) setErrors(data.fields);
      setBanner(data.error ?? "Something went wrong. Please try again or call us.");
    } catch {
      setBanner("We could not reach the server. Check your connection and try again, or call us.");
    }
    setStatus("idle");
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-card p-6 shadow-[0_40px_80px_-50px_rgb(20_19_18/0.4)] md:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div
            key="done"
            role="status"
            className="flex min-h-[460px] flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <svg viewBox="0 0 80 80" className="size-20" aria-hidden>
              <motion.circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-leaf)" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease }} />
              <motion.path d="M24 41l11 11 21-23" fill="none" stroke="var(--color-leaf)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5, ease }} />
            </svg>
            <h3 className="mt-6 text-2xl font-bold md:text-3xl">Enquiry received</h3>
            <p className="mt-3 max-w-sm text-muted">{thanks}</p>
            <button type="button" onClick={() => setStatus("idle")} className="mt-8 rounded-full border border-ink/15 px-5 py-2.5 font-semibold hover:border-ink">
              Send another enquiry
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="text-2xl font-bold md:text-[1.75rem]">Send us an enquiry</h3>
            <p className="mt-1 text-sm text-muted">Fields marked <span className="text-brand">*</span> are required.</p>

            <AnimatePresence>
              {banner && (
                <motion.p role="alert" className="mt-5 rounded-xl border border-brand/30 bg-brand/[0.07] px-4 py-3 text-sm font-medium text-brand-deep"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  {banner}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Spam trap: hidden from people, bots fill it in */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>Leave empty<input tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} /></label>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field id="f-name" label="Your name" required error={errors.name}>
                <input id="f-name" className="field-input" autoComplete="name" maxLength={100} placeholder="Full name" value={v.name} onChange={set("name")} {...a11y("name")} />
              </Field>
              <Field id="f-phone" label="Mobile number" required error={errors.phone}>
                <input id="f-phone" className="field-input" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="+91 98765 43210" value={v.phone} onChange={set("phone")} {...a11y("phone")} />
              </Field>
              <Field id="f-email" label="Email" required error={errors.email}>
                <input id="f-email" className="field-input" type="email" inputMode="email" autoComplete="email" maxLength={150} placeholder="you@example.com" value={v.email} onChange={set("email")} {...a11y("email")} />
              </Field>
              <Field id="f-service" label="Service needed">
                <select id="f-service" className="field-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23625c54%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10" value={v.service} onChange={set("service")}>
                  {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="f-msg" label="About your project" optional error={errors.message}>
                  <textarea id="f-msg" className="field-input min-h-36 resize-y" maxLength={MAX_MSG} placeholder="Site location, size, what you plan to build, timeline…" value={v.message} onChange={set("message")} {...a11y("message")} />
                </Field>
                <p className={`mt-1.5 text-right text-xs ${v.message.length > MAX_MSG * 0.9 ? "text-brand" : "text-muted"}`}>
                  {v.message.length} / {MAX_MSG}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="group mt-4 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink py-4 text-base font-semibold text-paper transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-8"
            >
              {status === "sending" ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                  Sending…
                </>
              ) : (
                <>
                  Send enquiry
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <p className="mt-4 text-xs text-muted">We only use your details to reply to your enquiry.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
