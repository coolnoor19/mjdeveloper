"use client";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { steps } from "@/lib/site";
import { Reveal, SectionHeading } from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

/** Four-stage timeline. The red line fills as you scroll and each stage lights up when reached. */
export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const height = useTransform(fill, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="relative overflow-hidden bg-ink py-24 text-paper md:py-32">
      <div className="bg-blueprint-dark pointer-events-none absolute inset-0" />
      <div className="wrap relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            dark
            eyebrow="How a project runs"
            title={["Four stages.", "No surprises."]}
            sub="Each stage ends with a clear deliverable you can review before we move on."
          />
        </div>

        <ol ref={ref} className="relative">
          <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-[2px] bg-paper/10 md:left-[35px]" />
          <motion.span aria-hidden className="absolute left-[27px] top-6 w-[2px] origin-top bg-brand md:left-[35px]" style={{ height }} />
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              className="relative grid grid-cols-[56px_1fr] gap-5 pb-14 last:pb-0 md:grid-cols-[72px_1fr] md:gap-8"
              initial="idle"
              whileInView="lit"
              viewport={{ margin: "-45% 0px -45% 0px" }}
            >
              <motion.span
                className="relative z-10 grid size-14 place-items-center rounded-full border-2 font-display text-lg font-bold md:size-[72px] md:text-2xl"
                variants={{
                  idle: { backgroundColor: "#141312", borderColor: "rgba(245,241,234,0.2)", color: "rgba(245,241,234,0.6)" },
                  lit: { backgroundColor: "#d42a2a", borderColor: "#d42a2a", color: "#ffffff" },
                }}
                transition={{ duration: 0.4 }}
              >
                0{i + 1}
              </motion.span>
              <Reveal delay={0.05} className="pt-2 md:pt-4">
                <h3 className="text-[clamp(1.8rem,3.4vw,2.75rem)] font-bold leading-none">{step.title}</h3>
                <p className="mt-3 max-w-md text-lg text-paper/70">{step.body}</p>
                <motion.span
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/80"
                  variants={{ idle: { opacity: 0.6 }, lit: { opacity: 1 } }}
                  transition={{ duration: 0.4, ease }}
                >
                  <span className="size-1.5 rounded-full bg-leaf" />
                  Deliverable: {step.deliverable}
                </motion.span>
              </Reveal>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
