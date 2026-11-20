"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { highlights } from "@/lib/site";
import { Art } from "./Art";
import { ArrowRight } from "./icons";
import { Reveal, SectionHeading } from "./Reveal";

function Panel({ h, i }: { h: (typeof highlights)[number]; i: number }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-card">
      <div className="bg-blueprint relative flex-1 border-b border-ink/10 bg-paper-2/60 px-6 pb-0 pt-8 md:px-10">
        <span className="absolute left-6 top-6 font-display text-sm font-bold text-muted md:left-10">0{i + 1} / 0{highlights.length}</span>
        <Art name={h.art} className="mx-auto mt-6 h-auto w-full max-w-[460px]" />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{h.kicker}</span>
        <h3 className="text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.05]">{h.title}</h3>
        <p className="max-w-md text-base leading-relaxed text-muted md:text-lg">{h.body}</p>
        <a href="#contact" className="group mt-2 inline-flex items-center gap-2 self-start font-semibold">
          <span className="border-b-2 border-brand pb-0.5">Book a consultation</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </article>
  );
}

/** Desktop: the section pins and the panels slide sideways as you scroll down. */
function Pinned() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * distance);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={section}
      id="highlights"
      aria-label="What we deliver"
      className="relative hidden lg:block"
      style={{ height: distance ? `calc(100vh + ${distance}px)` : "300vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} className="flex items-stretch gap-8 pl-[max(32px,calc((100vw-1240px)/2+32px))] pr-16" style={{ x }}>
          <div className="flex w-[30vw] min-w-[380px] shrink-0 flex-col justify-between py-4">
            <SectionHeading
              eyebrow="What we deliver"
              title={["Most problems", "are cheaper", "on paper."]}
              sub="We solve them before a single brick is laid. Keep scrolling to see how."
            />
            <div className="mt-10">
              <div className="h-[3px] w-48 overflow-hidden rounded bg-ink/10">
                <motion.div className="h-full bg-brand" style={{ width: bar }} />
              </div>
            </div>
          </div>
          {highlights.map((h, i) => (
            <div key={h.title} className="h-[min(78vh,680px)] w-[min(46vw,620px)] shrink-0">
              <Panel h={h} i={i} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** Phones and tablets: a simple vertical stack that reveals card by card. */
function Stacked() {
  return (
    <section id="highlights-m" aria-label="What we deliver" className="wrap py-20 md:py-28 lg:hidden">
      <SectionHeading eyebrow="What we deliver" title={["Most problems are", "cheaper on paper."]} sub="We solve them before a single brick is laid." />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {highlights.map((h, i) => (
          <Reveal key={h.title} delay={i * 0.05} className={i === 2 ? "md:col-span-2 md:mx-auto md:w-1/2" : ""}>
            <Panel h={h} i={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Highlights() {
  return (
    <>
      <Pinned />
      <Stacked />
    </>
  );
}
