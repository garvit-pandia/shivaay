/**
 * Static no-WebGL / context-lost fallback: a blueprint drawing of the yard.
 * Pure SVG — no animation, no deps. Always readable, always cheap.
 */
export function YardFallback({ className = "" }: { className?: string }) {
  const stacks = [
    { x: 420, h: 3 }, { x: 470, h: 4 }, { x: 520, h: 2 },
    { x: 660, h: 3 }, { x: 710, h: 2 }, { x: 760, h: 4 },
    { x: 540, h: 3 }, { x: 590, h: 1 },
  ];
  return (
    <div className={`yard-fallback ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <pattern id="yf-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#0F766E" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="#FAF8F4" />
        <rect width="1200" height="800" fill="url(#yf-grid)" />

        {/* gantry crane */}
        <g stroke="#0F766E" strokeWidth="7" fill="none" opacity="0.5" strokeLinecap="round">
          <path d="M330 560V240M330 240h540M870 240v320" />
          <path d="M330 560l-74 96M330 560l74 96M870 560l-74 96M870 560l74 96" />
        </g>
        <rect x="556" y="238" width="72" height="34" fill="#0F766E" opacity="0.65" />
        <rect x="586" y="272" width="12" height="86" fill="#0F766E" opacity="0.65" />

        {/* container stacks */}
        <g>
          {stacks.map((s, i) => {
            const w = 46;
            const h = 16;
            return Array.from({ length: s.h }, (_, t) => (
              <rect
                key={`${i}-${t}`}
                x={s.x}
                y={700 - t * (h + 4)}
                width={w}
                height={h}
                rx="2"
                fill={i === 5 ? "#EA580C" : ["#0F766E", "#134E4A", "#0D9488"][i % 3]}
                opacity={0.55 + t * 0.1}
              />
            ));
          })}
        </g>

        {/* truck silhouette on the lane */}
        <g fill="#1E1B18" opacity="0.55">
          <rect x="180" y="668" width="86" height="26" rx="4" />
          <rect x="258" y="676" width="34" height="18" rx="3" />
          <circle cx="206" cy="698" r="9" />
          <circle cx="272" cy="698" r="9" />
        </g>

        {/* dashed outbound route */}
        <path
          d="M100 660 Q 300 620 470 500 T 1080 420"
          fill="none"
          stroke="#EA580C"
          strokeWidth="3"
          strokeDasharray="10 12"
          opacity="0.5"
        />

        <text x="84" y="112" fontFamily="var(--font-mono), monospace" fontSize="22" letterSpacing="6" fill="#6B5E4A">
          LUDHIANA ICD · LIVE MODEL
        </text>
        <text x="84" y="146" fontFamily="var(--font-mono), monospace" fontSize="14" letterSpacing="4" fill="#0F766E">
          LDH / IN · CUSTOMS BROKER · EST. 2009
        </text>
      </svg>
    </div>
  );
}
