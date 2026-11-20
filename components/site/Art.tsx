// Line illustrations for the highlight panels, in the logo's palette.
export function Art({ name, className }: { name: string; className?: string }) {
  const ink = "var(--color-ink)";
  const common = { fill: "none", stroke: ink, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 400 260" className={className} aria-hidden>
      <path d="M0 226H400" stroke={ink} strokeWidth="2" />
      {name === "houses" && (
        <>
          <path d="M34 226V140L86 98L138 140V226Z" {...common} fill="var(--color-card)" />
          <path d="M156 226V124L212 78L268 124V226Z" {...common} fill="var(--color-brand)" />
          <path d="M286 226V146L334 108L382 146V226Z" {...common} fill="var(--color-card)" />
          <rect x="72" y="180" width="28" height="46" fill="var(--color-leaf)" />
          <g fill="var(--color-leaf)">
            <rect x="192" y="140" width="16" height="16" /><rect x="212" y="140" width="16" height="16" />
            <rect x="192" y="160" width="16" height="16" /><rect x="212" y="160" width="16" height="16" />
          </g>
          <rect x="320" y="180" width="28" height="46" fill="var(--color-sun)" />
          <path d="M20 244H380" stroke={ink} strokeWidth="1.5" strokeDasharray="8 8" />
        </>
      )}
      {name === "plan" && (
        <>
          <path d="M50 40L330 26L360 206L72 222Z" {...common} fill="var(--color-card)" />
          <path d="M196 33L218 214L140 218L122 37Z" fill="var(--color-sun)" fillOpacity=".55" />
          <path d="M196 33L218 214M58 128L346 114M122 37L140 218" stroke={ink} strokeWidth="2" />
          <g transform="translate(262 128) rotate(-8)">
            <rect x="0" y="0" width="70" height="56" rx="6" fill="var(--color-brand)" />
            <path d="M16 28l12 12 26-26" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <path d="M50 244H360" stroke="var(--color-brand)" strokeWidth="2" />
        </>
      )}
      {name === "towers" && (
        <>
          <path d="M50 226V80H120V226Z" {...common} fill="var(--color-card)" />
          <path d="M140 226V120H200V226Z" {...common} fill="var(--color-card)" />
          <path d="M220 226V50H300V226Z" {...common} fill="var(--color-brand)" />
          <path d="M320 226V140H370V226Z" {...common} fill="var(--color-card)" />
          <path d="M66 110H104M66 140H104M66 170H104M156 150H184M156 180H184M336 170H354" stroke="var(--color-leaf)" strokeWidth="4" strokeLinecap="round" />
          <path d="M238 80H282M238 110H282M238 140H282M238 170H282" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="352" cy="62" r="20" fill="var(--color-sun)" />
        </>
      )}
    </svg>
  );
}
