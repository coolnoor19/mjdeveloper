"use client";
import { motion } from "motion/react";
import { facts } from "@/lib/site";

const ease = [0.16, 1, 0.3, 1] as const;

/** Four plain facts about how MJ Developer works, each number rolling up into place. */
export function Facts() {
  return (
    <section aria-label="At a glance" className="wrap pt-24 md:pt-32">
      <div className="grid grid-cols-2 gap-px border-y border-ink/15 bg-ink/15 lg:grid-cols-4">
        {facts.map((f, i) => (
          <motion.div
            key={f.label}
            className="flex flex-col gap-3 bg-paper px-5 py-8 md:px-8 md:py-10"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
          >
            <span className="block overflow-hidden">
              <motion.span
                className="block font-display text-[clamp(3.5rem,9vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em]"
                variants={{ hidden: { y: "100%" }, show: { y: "0%" } }}
                transition={{ duration: 1, delay: i * 0.1, ease }}
              >
                {f.value}
                <span className="text-brand">.</span>
              </motion.span>
            </span>
            <motion.span
              className="max-w-56 text-[15px] leading-snug text-muted md:text-base"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
            >
              {f.label}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
