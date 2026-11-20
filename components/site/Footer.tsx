"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { useRef, useSyncExternalStore } from "react";
import { nav, site } from "@/lib/site";
import { LogoMark } from "./LogoMark";
import { ArrowUp } from "./icons";

const noop = () => () => {};
function useYear() {
  // Read on the client so the year never goes stale in a cached page
  return useSyncExternalStore(noop, () => new Date().getFullYear(), () => null);
}

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["60%", "0%"]);
  const lenis = useLenis();
  const year = useYear();

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink pt-20 text-paper">
      <div className="wrap grid gap-12 pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-paper p-2">
              <LogoMark className="h-10 w-auto text-ink" />
            </span>
            <span className="font-display text-xl font-extrabold">MJ Developer</span>
          </div>
          <p className="mt-5 max-w-sm text-paper/60">{site.fullName}. {site.tagline}</p>
          <p className="mt-2 font-serif text-lg italic text-paper/80">{site.motto}.</p>
        </div>
        <nav aria-label="Footer">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/40">Explore</span>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-1">
            {[...nav, { href: "#contact", label: "Contact" }].map((n) => (
              <li key={n.href}><a href={n.href} className="text-paper/75 transition-colors hover:text-paper">{n.label}</a></li>
            ))}
          </ul>
        </nav>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/40">Get in touch</span>
          <ul className="mt-4 flex flex-col gap-2.5 text-paper/75">
            <li><a className="break-all hover:text-paper" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
            <li><a className="hover:text-paper" href={`tel:${site.contact.phoneHref}`}>{site.contact.phone}</a></li>
            <li className="text-paper/55">{site.contact.address}</li>
          </ul>
        </div>
      </div>

      <div className="wrap flex flex-col items-start justify-between gap-4 border-t border-paper/10 py-6 text-sm text-paper/50 sm:flex-row sm:items-center">
        <span>© {year ?? ""} {site.fullName}</span>
        <button
          type="button"
          onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
          className="group inline-flex items-center gap-2 text-paper/75 hover:text-paper"
        >
          Back to top
          <span className="grid size-9 place-items-center rounded-full border border-paper/20 transition-transform group-hover:-translate-y-1">
            <ArrowUp className="size-4" />
          </span>
        </button>
      </div>

      {/* Oversized wordmark that rises into view at the very end of the page */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <motion.p
          style={{ y }}
          className="whitespace-nowrap text-center font-display text-[15.5vw] font-extrabold leading-[0.78] tracking-[-0.06em] text-paper/[0.07]"
        >
          MJ Developer
        </motion.p>
      </div>
    </footer>
  );
}
