"use client";
import { motion } from "motion/react";

/**
 * The MJ Developer mark drawn as SVG: ink construction lines, red roof outline, green windows.
 * With `animate`, the lines draw in and the roof and windows settle into place.
 */
export function LogoMark({ className, animate = false }: { className?: string; animate?: boolean }) {
  const draw = (delay: number) =>
    animate
      ? {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {};
  const pop = (delay: number) =>
    animate
      ? {
          initial: { opacity: 0, scale: 0.4 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {};

  return (
    <svg viewBox="0 0 189 240" className={className} aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeLinecap="square">
        <motion.path d="M30 6V236" strokeWidth="7" {...draw(0)} />
        <motion.path d="M45 100V226" strokeWidth="4" {...draw(0.1)} />
        <motion.path d="M10 70L132 16" strokeWidth="5" {...draw(0.2)} />
        <motion.path d="M6 190H120" strokeWidth="4" {...draw(0.3)} />
        <motion.path d="M6 208H168" strokeWidth="6" {...draw(0.35)} />
      </g>
      <motion.path
        d="M30 30L183 90V206H108V180H160V106L30 58Z"
        fill="var(--color-brand)"
        style={{ transformOrigin: "100px 120px" }}
        {...(animate
          ? {
              initial: { opacity: 0, x: -24 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] as const },
            }
          : {})}
      />
      <g fill="var(--color-leaf)">
        {[
          [58, 92],
          [83, 92],
          [58, 118],
          [83, 118],
        ].map(([x, y], i) => (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width="20"
            height="20"
            style={{ transformOrigin: `${x + 10}px ${y + 10}px` }}
            {...pop(0.6 + i * 0.08)}
          />
        ))}
      </g>
    </svg>
  );
}
