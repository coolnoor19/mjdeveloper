"use client";
import { motion, type MotionValue, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "./Reveal";

const statement =
  "Most development problems are cheaper to solve on paper than on site. That one idea shapes everything we do.";

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const accent = word.startsWith("paper") || word.startsWith("site");
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }} className={accent ? "font-serif font-normal italic text-brand" : ""}>
        {word}
      </motion.span>
    </span>
  );
}

export function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = statement.split(" ");

  return (
    <section id="about" className="wrap py-24 md:py-36">
      <Reveal>
        <span className="eyebrow">About MJ Developer</span>
      </Reveal>
      {/* Words brighten one by one as the paragraph scrolls through the viewport */}
      <p ref={ref} className="mt-8 max-w-5xl font-display text-[clamp(1.9rem,4.6vw,4rem)] font-bold leading-[1.08] tracking-[-0.025em]">
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </p>

      <div className="mt-16 grid gap-10 border-t border-ink/15 pt-12 md:mt-24 md:grid-cols-2 md:gap-16">
        <Reveal>
          <h2 className="text-2xl font-bold md:text-3xl">Independent advice, accountable results.</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            MJ Developer is a planning and consultancy practice for first-time developers, landowners and established
            firms. We stay with your project from the first conversation to an approved, buildable scheme, with the same
            consultant at every step.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {["First-time developers", "Landowners", "Established firms", "Residential", "Commercial", "Mixed-use"].map((t) => (
              <li key={t} className="rounded-full border border-ink/15 bg-card px-4 py-2 text-sm">{t}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <figure className="relative h-full rounded-3xl bg-paper-2 p-8 md:p-10">
            <span aria-hidden className="absolute -top-6 left-8 font-serif text-[7rem] leading-none text-brand">&ldquo;</span>
            <blockquote className="relative mt-6 font-serif text-[clamp(1.4rem,2.4vw,2rem)] italic leading-snug">
              We give you the facts about a site, including the unwelcome ones, while you can still act on them.
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-sm font-medium text-muted">
              <span className="h-[2px] w-8 bg-brand" />
              The MJ Developer approach
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
