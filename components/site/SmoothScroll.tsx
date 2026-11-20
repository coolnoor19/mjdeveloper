"use client";
import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotionPref } from "./hooks";

/**
 * Inertia smooth scrolling for the public site. Turned off for visitors who ask
 * their system for reduced motion; native scrolling is used instead.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionPref();
  return (
    <MotionConfig reducedMotion="user">
      {reduced ? (
        children
      ) : (
        <ReactLenis root options={{ lerp: 0.1, anchors: { offset: -80 }, autoRaf: true }}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
