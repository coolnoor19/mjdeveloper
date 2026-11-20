"use client";
import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
} & Omit<HTMLMotionProps<"div">, "children">) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/**
 * Splits a heading into lines that slide up from behind a mask, one after another.
 * The in-view trigger sits on the unclipped wrapper: a line hidden inside its own
 * overflow mask is invisible to IntersectionObserver and would never fire.
 */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  inView = true,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  inView?: boolean;
}) {
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } }
    : { animate: "show" };
  return (
    <motion.span className={`block ${className ?? ""}`} initial="hidden" {...trigger}>
      {lines.map((line, i) => (
        // pb/-mb keeps descenders (g, y, p) from being clipped by the mask
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
            transition={{ duration: inView ? 1 : 1.1, delay: delay + i * (inView ? 0.09 : 0.1), ease }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  dark = false,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode[];
  sub?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <span className={`eyebrow ${dark ? "!text-white/60" : ""}`}>{eyebrow}</span>
      </Reveal>
      <h2 className="mt-5 text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[1.02]">
        <MaskLines lines={title} />
      </h2>
      {sub && (
        <Reveal delay={0.15}>
          <p className={`mt-5 max-w-xl text-lg leading-relaxed ${dark ? "text-white/65" : "text-muted"}`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
