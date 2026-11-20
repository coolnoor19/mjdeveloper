"use client";
import { motion, type MotionValue, useTransform } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Site-plan drawing for the hero: the plot boundary and parcel lines draw themselves,
 * then lots fill in. As the page scrolls, the highlighted lot "builds" a small house.
 */
export function PlanDrawing({ progress }: { progress: MotionValue<number> }) {
  const draw = (delay: number, duration = 1.4) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration, delay, ease }, opacity: { duration: 0.2, delay } },
  });
  const fade = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, delay },
  });

  // scroll-driven: house rises on Lot B, lots shift slightly for depth
  const houseY = useTransform(progress, [0, 0.6], [60, 0]);
  const houseO = useTransform(progress, [0, 0.25], [0, 1]);
  const lotShift = useTransform(progress, [0, 1], [0, -18]);

  return (
    <svg viewBox="0 0 520 440" className="h-auto w-full" role="img" aria-label="Site plan drawing of a 4.2 hectare plot divided into four lots">
      {/* plot fills */}
      <motion.g style={{ y: lotShift }}>
        <motion.path d="M262 72 L398 63 L412 205 L271 214 Z" fill="var(--color-brand)" fillOpacity="0.9" {...fade(1.5)} />
        <motion.path d="M80 92 L262 72 L271 214 L92 226 Z" fill="var(--color-leaf)" fillOpacity="0.12" {...fade(1.7)} />
        <motion.path d="M92 226 L271 214 L282 372 L104 384 Z" fill="var(--color-sun)" fillOpacity="0.18" {...fade(1.85)} />
      </motion.g>

      <g stroke="var(--color-ink)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M80 92 L440 60 L462 360 L104 384 Z" strokeWidth="3" {...draw(0.3, 1.8)} />
        <motion.path d="M262 72 L282 372" strokeWidth="2" {...draw(0.9)} />
        <motion.path d="M92 226 L452 205" strokeWidth="2" {...draw(1)} />
        <motion.path d="M398 63 L412 205" strokeWidth="1.5" strokeDasharray="6 6" {...draw(1.2)} />

        {/* dimension lines */}
        <motion.path d="M104 412 H462 M104 404v16 M462 404v16" strokeWidth="1.2" stroke="var(--color-muted)" {...draw(1.5, 1)} />
        <motion.path d="M48 92 V384 M40 92h16 M40 384h16" strokeWidth="1.2" stroke="var(--color-muted)" {...draw(1.6, 1)} />

      </g>

      {/* house on Lot B, built by scrolling */}
      <motion.g style={{ y: houseY, opacity: houseO }}>
        <path d="M305 175 V128 L335 104 L365 128 V175 Z" fill="var(--color-card)" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="324" y="146" width="22" height="29" fill="var(--color-leaf)" />
        <path d="M296 135 L335 100 L374 135" fill="none" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* labels */}
      <g fontFamily="var(--font-sans)" fontSize="13" fontWeight="600" fill="var(--color-ink)">
        <motion.text x="150" y="160" {...fade(2)}>Lot A</motion.text>
        <motion.text x="274" y="94" fill="#fff" {...fade(2.05)}>Lot B</motion.text>
        <motion.text x="160" y="310" {...fade(2.1)}>Lot C</motion.text>
        <motion.text x="340" y="300" {...fade(2.15)}>Lot D</motion.text>
        <motion.text x="232" y="434" fontWeight="500" fill="var(--color-muted)" fontSize="12" {...fade(2.2)}>Plot boundary 4.2 ha</motion.text>
        <motion.g {...fade(2.3)}>
          <circle cx="478" cy="28" r="16" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
          <path d="M478 16 L484 32 L478 28 L472 32 Z" fill="var(--color-brand)" />
          <text x="474" y="58" fontSize="11">N</text>
        </motion.g>
      </g>
    </svg>
  );
}
