"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { LogoMark } from "./LogoMark";
import { ArrowUpRight, Mail, Phone } from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const lenis = useLenis();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    // hide while reading downwards, show again as soon as the visitor scrolls up
    setHidden(y > 480 && y > prev + 2);
  });

  // Highlight the nav link for the section in view
  useEffect(() => {
    const ids = [...nav.map((n) => n.href.slice(1)), "contact"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Lock page scroll behind the mobile menu
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const close = () => m.matches && setOpen(false);
    m.addEventListener("change", close);
    return () => m.removeEventListener("change", close);
  }, []);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease }}
      >
        <div
          className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
            scrolled && !open
              ? "border-b border-ink/10 bg-paper/80 backdrop-blur-xl backdrop-saturate-150"
              : "border-b border-transparent"
          }`}
        >
          <div className="wrap flex h-[72px] items-center justify-between gap-4">
            <a href="#top" className="group relative z-10 flex items-center gap-3" aria-label={`${site.fullName}, back to top`}>
              <LogoMark animate className={`h-10 w-auto transition-colors ${open ? "text-paper" : "text-ink"}`} />
              <span className={`flex flex-col leading-none transition-colors ${open ? "text-paper" : ""}`}>
                <span className="font-display text-[1.15rem] font-extrabold tracking-tight">MJ Developer</span>
                <span className={`mt-1 text-[10px] font-medium uppercase tracking-[0.14em] ${open ? "text-paper/60" : "text-muted"}`}>
                  Planning &amp; Consultancy
                </span>
              </span>
            </a>

            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {nav.map((n) => {
                const on = active === n.href.slice(1);
                return (
                  <a
                    key={n.href}
                    href={n.href}
                    className={`relative rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`}
                  >
                    {on && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-ink/[0.06]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {n.label}
                  </a>
                );
              })}
            </nav>

            <div className="relative z-10 flex items-center gap-2">
              <a
                href="#contact"
                className="group hidden items-center gap-2 rounded-full bg-ink py-2.5 pl-5 pr-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-brand sm:inline-flex"
              >
                Book a consultation
                <span className="grid size-7 place-items-center rounded-full bg-paper/15 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </a>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className={`grid size-11 place-items-center rounded-full transition-colors lg:hidden ${open ? "bg-paper text-ink" : "bg-ink text-paper"}`}
              >
                <span className="relative block h-3 w-5">
                  <span className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
                  <span className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
                </span>
              </button>
            </div>
          </div>
        </div>
        <motion.div aria-hidden className="h-[2px] origin-left bg-brand" style={{ scaleX: progress }} />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink text-paper lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 42px) 36px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 42px) 36px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 42px) 36px)" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="bg-blueprint-dark pointer-events-none absolute inset-0" />
            <nav aria-label="Mobile" className="wrap relative mt-28 flex flex-1 flex-col">
              {[...nav, { href: "#contact", label: "Contact" }].map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease }}
                  className="group flex items-baseline justify-between border-b border-paper/10 py-4 font-display text-[clamp(2rem,9vw,3.25rem)] font-bold tracking-tight"
                >
                  <span>{n.label}</span>
                  <span className="text-sm font-medium text-paper/40">0{i + 1}</span>
                </motion.a>
              ))}
              <motion.div
                className="mt-auto flex flex-col gap-3 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8 text-paper/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <a href={`tel:${site.contact.phoneHref}`} className="flex items-center gap-3"><Phone className="size-5" />{site.contact.phone}</a>
                <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 break-all"><Mail className="size-5 shrink-0" />{site.contact.email}</a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
