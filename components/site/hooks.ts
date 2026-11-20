"use client";
import { useSyncExternalStore } from "react";

/** True when the media query matches. Always false during server render. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotionPref = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
