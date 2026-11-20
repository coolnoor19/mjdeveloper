"use client";
import { motion, type MotionValue, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { services } from "@/lib/site";
import { ArrowUpRight, ServiceIcon } from "./icons";
import { Reveal, SectionHeading } from "./Reveal";

const tones = [
  "bg-card text-ink",
  "bg-ink text-paper",
  "bg-brand text-white",
  "bg-card text-ink",
  "bg-ink-2 text-paper",
  "bg-leaf text-white",
];

function Card({ s, i, total, progress }: { s: (typeof services)[number]; i: number; total: number; progress: MotionValue<number> }) {
  // Each card shrinks a little as later cards stack on top of it
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - i) * 0.035]);
  const dim = useTransform(progress, [start, Math.min(1, start + 0.35)], [0, (total - 1 - i) ? 0.25 : 0]);
  const tone = tones[i % tones.length];
  const light = tone.includes("bg-card");

  return (
    <div className="sticky" style={{ top: `calc(96px + ${i * 14}px)` }}>
      <motion.article
        style={{ scale, transformOrigin: "top center" }}
        className={`relative overflow-hidden rounded-[26px] border ${light ? "border-ink/10" : "border-transparent"} ${tone} p-6 shadow-[0_-20px_40px_-30px_rgb(20_19_18/0.35)] md:p-10`}
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: dim }} />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4 md:flex-col md:items-start">
            <span className={`grid size-14 place-items-center rounded-2xl ${light ? "bg-ink text-paper" : "bg-white/15"}`}>
              <ServiceIcon name={s.key} className="size-7" />
            </span>
            <span className={`font-display text-sm font-bold ${light ? "text-muted" : "opacity-70"}`}>0{i + 1}</span>
          </div>
          <div className="flex-1 md:max-w-[32rem]">
            <h3 className="text-[clamp(1.6rem,3vw,2.5rem)] font-bold leading-[1.05]">{s.title}</h3>
            <p className={`mt-4 text-base leading-relaxed md:text-lg ${light ? "text-muted" : "opacity-80"}`}>{s.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {s.points.map((p) => (
                <li key={p} className={`rounded-full border px-3.5 py-1.5 text-sm ${light ? "border-ink/15" : "border-current/25"}`}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="services" className="wrap py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="What we do"
            title={["Six services.", "One clear plan."]}
            sub="Practical planning and advisory support for residential, commercial and mixed-use projects."
          />
          <Reveal delay={0.2}>
            <a href="#contact" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink py-3 pl-6 pr-3 font-semibold text-paper transition-colors hover:bg-brand">
              Discuss your site
              <span className="grid size-8 place-items-center rounded-full bg-paper/15 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </Reveal>
        </div>
        <div ref={ref} className="flex flex-col gap-6 pb-10">
          {services.map((s, i) => (
            <Card key={s.key} s={s} i={i} total={services.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
