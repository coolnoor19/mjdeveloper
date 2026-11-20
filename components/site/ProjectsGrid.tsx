"use client";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/dto";
import { Art } from "./Art";
import { ArrowUpRight, Close, Pin } from "./icons";
import { Reveal, SectionHeading } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

function meta(p: Project) {
  return [p.location, p.category, p.year].filter(Boolean).join(" · ");
}

function Card({ p, i, wide, onOpen }: { p: Project; i: number; wide: boolean; onOpen: () => void }) {
  return (
    <motion.li
      layout
      className={wide ? "sm:col-span-2" : ""}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease }}
    >
      <button type="button" onClick={onOpen} className="group block w-full text-left" aria-label={`View ${p.title}`}>
        <div className={`relative overflow-hidden rounded-3xl bg-ink/5 ${wide ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3]"}`}>
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 1.1, delay: (i % 3) * 0.08, ease }}
          >
            <motion.img
              layoutId={`img-${p.id}`}
              src={p.image}
              alt={p.title}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
            />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute right-4 top-4 grid size-11 scale-75 place-items-center rounded-full bg-paper text-ink opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
            <ArrowUpRight className="size-5" />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5 text-paper md:p-6">
            {p.category && (
              <span className="mb-2 inline-block rounded-full bg-paper/20 px-3 py-1 text-xs font-medium backdrop-blur">{p.category}</span>
            )}
            <h3 className="text-xl font-bold leading-tight md:text-2xl">{p.title}</h3>
            {(p.location || p.year) && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-paper/75">
                <Pin className="size-4" />
                {[p.location, p.year].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </button>
    </motion.li>
  );
}

function Lightbox({ p, onClose }: { p: Project; onClose: () => void }) {
  const lenis = useLenis();
  useEffect(() => {
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={p.title}
      data-lenis-prevent
    >
      <motion.div
        className="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-card sm:rounded-3xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img layoutId={`img-${p.id}`} src={p.image} alt={p.title} className="aspect-[16/10] w-full object-cover" />
        <div className="p-6 md:p-8">
          <p className="text-sm font-medium text-brand">{meta(p)}</p>
          <h3 className="mt-2 text-2xl font-bold md:text-3xl">{p.title}</h3>
          {p.description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{p.description}</p>}
          <a href="#contact" onClick={onClose} className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-paper hover:bg-brand">
            Plan a project like this <ArrowUpRight className="size-4" />
          </a>
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close"
          className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-paper/90 text-ink shadow-lg backdrop-blur hover:bg-paper"
        >
          <Close className="size-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
    [projects],
  );
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const shown = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="wrap py-24 md:py-32">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Our work"
          title={["Projects we", "have delivered"]}
          sub="A selection of completed developments, from feasibility to approval."
        />
        {categories.length > 1 && (
          <Reveal delay={0.2}>
            <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
              {["All", ...categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  aria-pressed={filter === c}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    filter === c ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      {projects.length === 0 ? (
        <Reveal className="mt-12">
          <div className="bg-blueprint grid items-center gap-8 overflow-hidden rounded-3xl border border-dashed border-ink/20 bg-card/60 p-8 md:grid-cols-2 md:p-12">
            <div>
              <h3 className="text-2xl font-bold md:text-3xl">New projects are being added.</h3>
              <p className="mt-3 max-w-md text-muted">Our portfolio is being photographed and written up. In the meantime, we are happy to talk you through past work on a call.</p>
              <a href="#contact" className="mt-6 inline-flex items-center gap-2 font-semibold">
                <span className="border-b-2 border-brand">Ask about our work</span>
                <ArrowUpRight className="size-4" />
              </a>
            </div>
            <Art name="towers" className="mx-auto w-full max-w-sm" />
          </div>
        </Reveal>
      ) : (
        <motion.ul layout className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <Card key={p.id} p={p} i={i} wide={i % 5 === 0 && shown.length > 2} onOpen={() => setOpen(p)} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <AnimatePresence>{open && <Lightbox p={open} onClose={close} />}</AnimatePresence>
    </section>
  );
}
