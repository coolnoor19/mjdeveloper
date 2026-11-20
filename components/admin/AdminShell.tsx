"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/site/LogoMark";
import { api } from "./api";
import { AdminProviders } from "./ui";

type Me = { username: string; newEnquiries: number };
const MeCtx = createContext<{ me: Me | null; refresh: () => void }>({ me: null, refresh: () => {} });
/** Lets pages refresh the sidebar's unread count after changing an enquiry. */
export const useMe = () => use(MeCtx);

const links = [
  { href: "/admin", label: "Dashboard", icon: "M4 13h6V4H4zm10 7h6v-9h-6zM4 20h6v-4H4zm10-11h6V4h-6z" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "M4 5h16v11H8l-4 4zM8 9h8M8 12h5", badge: true },
  { href: "/admin/projects", label: "Projects", icon: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6" },
  { href: "/admin/settings", label: "Settings", icon: "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M17 6a2 2 0 1 1-4 0a2 2 0 1 1 4 0M11 12a2 2 0 1 1-4 0a2 2 0 1 1 4 0M19 18a2 2 0 1 1-4 0a2 2 0 1 1 4 0" },
];

function Nav({ me, onNavigate }: { me: Me | null; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {links.map((l) => {
        const on = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            aria-current={on ? "page" : undefined}
            className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-colors ${on ? "text-paper" : "text-paper/60 hover:bg-paper/5 hover:text-paper"}`}
          >
            {on && <motion.span layoutId="admin-nav" className="absolute inset-0 -z-10 rounded-xl bg-paper/10" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
              <path d={l.icon} />
            </svg>
            {l.label}
            {l.badge && !!me?.newEnquiries && (
              <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white" aria-label={`${me.newEnquiries} new`}>
                {me.newEnquiries}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer({ me }: { me: Me | null }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-2 border-t border-paper/10 pt-4 text-sm">
      <a href="/" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-paper/60 hover:text-paper">
        View website ↗
      </a>
      <div className="flex items-center justify-between gap-2 px-3.5">
        <span className="truncate text-paper/50">{me ? `Signed in as ${me.username}` : " "}</span>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
            // full reload on purpose so no signed-in state survives
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/admin/login";
          }}
          className="shrink-0 rounded-lg px-2 py-1 font-semibold text-paper/80 hover:bg-paper/10 hover:text-paper"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const refresh = useCallback(() => {
    api<Me>("/api/admin/me").then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    // keep the unread badge current while the panel is open
    const t = setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const brand = (
    <Link href="/admin" className="flex items-center gap-3 px-2">
      <span className="rounded-lg bg-paper p-1.5"><LogoMark className="h-7 w-auto text-ink" /></span>
      <span className="leading-tight">
        <span className="block font-display font-extrabold text-paper">MJ Developer</span>
        <span className="block text-xs text-paper/50">Admin panel</span>
      </span>
    </Link>
  );

  return (
    <MeCtx value={{ me, refresh }}>
      <AdminProviders>
        <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[260px_1fr]">
          <aside className="sticky top-0 hidden h-dvh flex-col gap-8 bg-ink p-5 lg:flex">
            {brand}
            <Nav me={me} />
            <div className="mt-auto"><Footer me={me} /></div>
          </aside>

          <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden">
            {brand}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="relative grid size-10 place-items-center rounded-xl bg-paper/10 text-paper"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              {!!me?.newEnquiries && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-ink bg-brand" />}
            </button>
          </header>

          <AnimatePresence>
            {open && (
              <motion.div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
                <motion.aside
                  className="flex h-dvh w-[82%] max-w-xs flex-col gap-8 bg-ink p-5 pt-[calc(1.25rem+env(safe-area-inset-top))]"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {brand}
                  <Nav me={me} onNavigate={() => setOpen(false)} />
                  <div className="mt-auto pb-[env(safe-area-inset-bottom)]"><Footer me={me} /></div>
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </AdminProviders>
    </MeCtx>
  );
}
