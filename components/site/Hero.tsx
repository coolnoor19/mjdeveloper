"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { site } from "@/lib/site";
import { ArrowRight, ArrowUpRight } from "./icons";
import { MaskLines } from "./Reveal";
import { PlanDrawing } from "./PlanDrawing";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const artY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const artRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} id="top" className="relative overflow-hidden pb-16 pt-[calc(104px+env(safe-area-inset-top))] md:pb-24 lg:min-h-[100svh] lg:pt-36">
      <div className="bg-blueprint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]" />

      <div className="wrap relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        <motion.div style={{ y: textY, opacity: textO }}>
          <motion.span
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-ink/10 bg-card/70 py-1.5 pl-1.5 pr-4 text-sm text-muted backdrop-blur"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
          >
            <span className="rounded-full bg-leaf px-2.5 py-0.5 text-xs font-semibold text-white">Puri, Odisha</span>
            <span className="sm:hidden">Planning consultancy</span>
            <span className="hidden sm:inline">Planning &amp; development consultancy</span>
          </motion.span>

          <h1 className="mt-7 text-[clamp(2.9rem,8.4vw,6.4rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            <MaskLines
              inView={false}
              delay={0.2}
              lines={[
                "Plan it right",
                "before you",
                <>
                  <span className="relative inline-block font-serif font-normal italic tracking-tight text-brand">
                    build
                    <motion.svg
                      viewBox="0 0 200 20"
                      className="absolute -bottom-1 left-0 h-[0.18em] w-full overflow-visible"
                      aria-hidden
                    >
                      <motion.path
                        d="M2 14 C 50 4, 120 4, 198 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 1.1, ease }}
                      />
                    </motion.svg>
                  </span>{" "}
                  it.
                </>,
              ]}
            />
          </h1>

          <motion.p
            className="mt-7 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease }}
          >
            {site.description}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease }}
          >
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-brand py-3.5 pl-6 pr-3.5 text-base font-semibold text-white shadow-[0_10px_30px_-10px_var(--color-brand)] transition-colors hover:bg-brand-deep"
            >
              Book a consultation
              <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
            <a
              href="#services"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-base font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              See our services
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[560px]"
          style={{ y: artY, rotate: artRotate, scale: artScale }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease }}
        >
          <div className="relative rounded-[28px] border border-ink/10 bg-card/80 p-4 shadow-[0_40px_80px_-40px_rgb(20_19_18/0.35)] backdrop-blur sm:p-6">
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted">
              <span className="flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-leaf" />
                Feasibility sketch
              </span>
              <span>Scale 1:2500</span>
            </div>
            <PlanDrawing progress={scrollYProgress} />
          </div>
          <motion.div
            className="absolute -bottom-6 -left-2 rounded-2xl bg-ink px-5 py-4 text-paper shadow-xl sm:-left-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2, ease }}
          >
            <span className="block text-xs uppercase tracking-[0.14em] text-paper/60">Verdict</span>
            <span className="mt-1 flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid size-5 place-items-center rounded-full bg-leaf text-[11px]">✓</span>
              Go: buildable
            </span>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#highlights"
        aria-label="Scroll to next section"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted lg:flex"
        style={{ opacity: textO }}
      >
        Scroll
        <span className="relative h-10 w-[1.5px] overflow-hidden bg-ink/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-brand"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
