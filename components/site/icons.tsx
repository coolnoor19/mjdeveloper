// Small line icons (24px grid, currentColor).
import type { SVGProps } from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

type P = SVGProps<SVGSVGElement>;

export const ArrowRight = (p: P) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowUpRight = (p: P) => (
  <svg {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const ArrowUp = (p: P) => (
  <svg {...base} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
);
export const Mail = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const Phone = (p: P) => (
  <svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
);
export const Pin = (p: P) => (
  <svg {...base} {...p}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const Plus = (p: P) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const Check = (p: P) => (
  <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const Copy = (p: P) => (
  <svg {...base} {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
);
export const Close = (p: P) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);

/** One icon per service, drawn as simple plan-style line work. */
export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const s = { ...base, strokeWidth: 1.4, className };
  switch (name) {
    case "feasibility":
      return <svg {...s}><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5M8 10.5l2 2 3.5-4" /></svg>;
    case "masterplan":
      return <svg {...s}><path d="M3 4h18v16H3zM3 12h18M11 4v16M15 12v8" /></svg>;
    case "permits":
      return <svg {...s}><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 13l2 2 4-4" /></svg>;
    case "budget":
      return <svg {...s}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
    case "pm":
      return <svg {...s}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4M7 14h4M7 17h7" /></svg>;
    case "land":
      return <svg {...s}><path d="M3 20 9 6l4 8 3-5 5 11z" /><path d="M9 6V3h4" /></svg>;
    default:
      return <svg {...s}><circle cx="12" cy="12" r="8" /></svg>;
  }
}
