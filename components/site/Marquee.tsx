"use client";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { useRef } from "react";
import { useReducedMotionPref } from "./hooks";

/** Endless text band. It drifts on its own and speeds up (or reverses) with scroll velocity. */
function Band({ items, baseVelocity, className }: { items: readonly string[]; baseVelocity: number; className: string }) {
  const reduced = useReducedMotionPref();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    base.set(base.get() + move);
  });

  const row = (
    <>
      {items.map((t) => (
        <span key={t} className="flex shrink-0 items-center gap-8 pr-8">
          {t}
          <span aria-hidden className="grid grid-cols-2 gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="size-[7px] bg-leaf" />
            ))}
          </span>
        </span>
      ))}
    </>
  );
  return (
    <div className="flex overflow-hidden whitespace-nowrap" aria-hidden>
      <motion.div className={`flex shrink-0 ${className}`} style={{ x }}>
        {row}
        {row}
      </motion.div>
    </div>
  );
}

export function Marquee() {
  return (
    // The clipping wrapper keeps the tilted band from widening the page on phones
    <div className="overflow-hidden py-4">
    <section aria-label="What we cover" className="relative -rotate-[1.5deg] scale-[1.04] border-y border-ink bg-ink py-5 text-paper md:py-7">
      <Band
        baseVelocity={-2}
        className="font-display text-[clamp(1.6rem,4vw,3rem)] font-bold tracking-tight"
        items={["Site feasibility", "Master planning", "Permit applications", "Development budgeting", "Land acquisition", "Project advisory"]}
      />
      <span className="sr-only">
        Site feasibility, master planning, permit applications, development budgeting, land acquisition and project advisory.
      </span>
    </section>
    </div>
  );
}
