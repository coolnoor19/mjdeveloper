"use client";
import { AnimatePresence, motion } from "motion/react";
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { EnquiryStatus } from "@/lib/db";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- Buttons ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "brand"; size?: "sm" | "md" };
export function Button({ variant = "primary", size = "md", className = "", ...p }: BtnProps) {
  const v = {
    primary: "bg-ink text-paper hover:bg-ink-3",
    brand: "bg-brand text-white hover:bg-brand-deep",
    ghost: "border border-ink/15 bg-card hover:border-ink/40",
    danger: "border border-brand/30 bg-card text-brand-deep hover:bg-brand hover:text-white",
  }[variant];
  const s = size === "sm" ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-[15px]";
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${v} ${s} ${className}`}
    />
  );
}

export function Spinner({ className = "size-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current/25 border-t-current ${className}`} aria-hidden />;
}

/* ---------- Status badge ---------- */
export const STATUS: Record<EnquiryStatus, { label: string; cls: string; dot: string }> = {
  new: { label: "New", cls: "bg-brand/10 text-brand-deep", dot: "bg-brand" },
  contacted: { label: "Contacted", cls: "bg-sun/15 text-[#7a5800]", dot: "bg-sun" },
  closed: { label: "Closed", cls: "bg-leaf/12 text-[#136b34]", dot: "bg-leaf" },
};
export function StatusBadge({ status }: { status: EnquiryStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-ink/10 bg-card ${className}`}>{children}</div>;
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Modal / slide-over ---------- */
export function Modal({
  open, onClose, title, children, side = false, wide = false,
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; side?: boolean; wide?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => panel.current?.focus(), 30);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-50 flex bg-ink/50 backdrop-blur-[2px] ${side ? "justify-end" : "items-end justify-center sm:items-center sm:p-6"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`flex max-h-dvh flex-col bg-paper shadow-2xl outline-none ${
              side ? "h-dvh w-full max-w-xl" : `max-h-[92dvh] w-full rounded-t-3xl sm:rounded-3xl ${wide ? "max-w-2xl" : "max-w-md"}`
            }`}
            initial={side ? { x: "100%" } : { y: 40, opacity: 0 }}
            animate={side ? { x: 0 } : { y: 0, opacity: 1 }}
            exit={side ? { x: "100%" } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 md:px-6">
              <h2 className="truncate text-lg font-bold">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-ink/5">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:px-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Confirm dialog ---------- */
type ConfirmOpts = { title: string; body: string; confirm?: string };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => use(ConfirmCtx);

/* ---------- Toasts ---------- */
type Toast = { id: number; text: string; kind: "ok" | "err" };
const ToastCtx = createContext<(text: string, kind?: Toast["kind"]) => void>(() => {});
export const useToast = () => use(ToastCtx);

export function AdminProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((text: string, kind: Toast["kind"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const [pending, setPending] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setPending({ ...o, resolve })), []);
  const done = useCallback((v: boolean) => {
    setPending((p) => {
      p?.resolve(v);
      return null;
    });
  }, []);
  const cancel = useCallback(() => done(false), [done]);

  return (
    <ToastCtx value={toast}>
      <ConfirmCtx value={confirm}>
        {children}
        <Modal open={!!pending} onClose={cancel} title={pending?.title ?? ""}>
          <p className="text-muted">{pending?.body}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={cancel}>Cancel</Button>
            <Button variant="brand" onClick={() => done(true)}>{pending?.confirm ?? "Delete"}</Button>
          </div>
        </Modal>
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg ${t.kind === "ok" ? "bg-ink text-paper" : "bg-brand text-white"}`}
              >
                <span className={`size-2 rounded-full ${t.kind === "ok" ? "bg-leaf" : "bg-white"}`} />
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ConfirmCtx>
    </ToastCtx>
  );
}

/* ---------- Form field ---------- */
export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label>
      {children}
      {error ? <p className="text-sm font-medium text-brand">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
