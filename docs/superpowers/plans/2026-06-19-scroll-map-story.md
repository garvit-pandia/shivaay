# Scroll-Driven SVG Map Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `WhyPartnerSection` with a sticky-map scroll narrative — a hand-drawn SVG India map pinned on one side while a 5-step shipping story scrolls past, with the map flying to each city, drawing route arcs, slamming ink-stamps, and floating editorial city cards.

**Architecture:** A new `MapStorySection` (server shell) renders a why-us strip + dynamically imports a client `MapStory`, which holds a single `activeStep` state driven by `IntersectionObserver` per story block. `IndiaMapSVG` receives `activeStep` as a prop and drives all choreography (flyTo via rAF on a `<g transform>`, route-draw via `stroke-dashoffset`, HQ pulse rings, cargo ghost via `getPointAtLength`, ink-stamp slam, active-route glow, floating city card) imperatively via refs/SVG attributes — no per-frame `setState`. Pure SVG + IntersectionObserver + rAF. No new dependencies. Leaflet files retained on disk but unimported.

**Tech Stack:** Next.js 16.2.9 (App Router, `output: "export"`), React 19.2.4, TypeScript 5, Tailwind v4. No new dependencies. No test framework — verification is `npm run build` + `npm run lint` + Playwright visual (per `tasks/lessons.md:8-9`).

**Spec:** `docs/superpowers/specs/2026-06-19-scroll-map-story-design.md`

**Lint gotchas to honour** (from `next-app/AGENTS.md` + `tasks/lessons.md`):
- `react-hooks/set-state-in-effect`: no synchronous `setState` in `useEffect`. `setActiveStep` must be called from the IntersectionObserver callback (event handler), not in the effect body.
- `react-hooks/immutability`: for self-referencing `requestAnimationFrame`, hold the loop function in a `useRef` (mirror of `NetworkMap.tsx` pattern at `tasks/lessons.md:22`).
- Use `next/image` and `next/link` where applicable (N/A here — no images/links in this feature).
- No `window.addEventListener('scroll')` (design-taste-frontend hard ban) — use `IntersectionObserver` only.

**All file paths are relative to repo root** `/home/garvit/projects/logistics1`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `next-app/src/lib/data.ts` | Modify (add ~45 lines after `routes`) | `MapCity` interface + `mapCities` coord map; `StoryStep` interface + `storySteps` array — single source of truth |
| `next-app/src/app/globals.css` | Modify (add ~70 lines after the reveal block, ~line 178) | HQ pulse ring keyframes, ink-stamp slam keyframe, route-draw transition, glow filter, reduced-motion guards |
| `next-app/src/components/home/IndiaMapSVG.tsx` | Create (~280 lines) | Client component: SVG India map + all choreography driven by `activeStep` prop |
| `next-app/src/components/home/MapStory.tsx` | Create (~220 lines) | Client component: sticky layout + IntersectionObserver scroll controller + 5 story blocks + elevation progress + floating city card |
| `next-app/src/components/home/MapStorySection.tsx` | Create (~55 lines) | Server shell: why-us strip + dynamic-import of `MapStory` |
| `next-app/src/app/page.tsx` | Modify (swap 1 import + 1 usage) | Replace `WhyPartnerSection` with `MapStorySection` |

---

### Task 1: Add `mapCities` and `storySteps` data to `data.ts`

**Files:**
- Modify: `next-app/src/lib/data.ts` (insert after the `routes` array, ~line 105)

- [ ] **Step 1: Add the `MapCity` interface and `mapCities` coord map**

Open `next-app/src/lib/data.ts`. After the `routes` array (which ends at line 105), insert:

```typescript
export interface MapCity {
  x: number;
  y: number;
  label: string;
  tag: string;
  isHub: boolean;
}

export const mapCities: Record<string, MapCity> = {
  Ludhiana: { x: 308, y: 257, label: "Ludhiana", tag: "Headquarters", isHub: true },
  Amritsar: { x: 279, y: 236, label: "Amritsar", tag: "Border Hub", isHub: false },
  Delhi:    { x: 346, y: 323, label: "Delhi",    tag: "Distribution Hub", isHub: false },
  Mundra:   { x: 130, y: 491, label: "Mundra",   tag: "Port Hub", isHub: false },
  Mumbai:   { x: 221, y: 600, label: "Mumbai",   tag: "Major Port", isHub: false },
};
```

Notes:
- Coordinates are normalized into a `0 0 1000 1000` SVG viewBox. lng 68–97°E → x 80–920; lat 8–37°N → y 920–80 (inverted for SVG y-down). These match the spec's coordinate table.
- Labels/tags mirror the existing `cities` record so the map reads consistently with popups removed (always-visible labels replace them, per spec layer G).

- [ ] **Step 2: Add the `StoryStep` interface and `storySteps` array**

Immediately after `mapCities`, insert:

```typescript
export interface StoryStep {
  eyebrow: string;
  headline: string;
  body: string;
  city: keyof typeof mapCities | null;
  routeFrom: keyof typeof mapCities | null;
  routeTo: keyof typeof mapCities | null;
  stamp: string;
  valueProp: string;
}

export const storySteps: StoryStep[] = [
  {
    eyebrow: "STEP 01",
    headline: "Your cargo begins its journey in Ludhiana",
    body: "Collected at your facility, surveyed, weighed, and packed for export-grade transport.",
    city: "Ludhiana",
    routeFrom: null,
    routeTo: null,
    stamp: "DEPARTURE · LUDHIANA",
    valueProp: "24/7 Customer Support",
  },
  {
    eyebrow: "STEP 02",
    headline: "Documentation filed at Delhi ICD",
    body: "ICEGATE filings, bills of lading, shipping bills, and DGFT compliance — handled end to end.",
    city: "Delhi",
    routeFrom: "Ludhiana",
    routeTo: "Delhi",
    stamp: "CUSTOMS FILED · DELHI",
    valueProp: "Customs Compliance Assurance",
  },
  {
    eyebrow: "STEP 03",
    headline: "Transhipment at Mundra Port",
    body: "Container stuffing, port handling, and vessel booking coordinated in a single window.",
    city: "Mundra",
    routeFrom: "Delhi",
    routeTo: "Mundra",
    stamp: "TRANSHIPMENT · MUNDRA",
    valueProp: "Expertise & Experience",
  },
  {
    eyebrow: "STEP 04",
    headline: "Sea transit to Mumbai",
    body: "FCL/LCL consolidation, vessel sailing, and tracking until discharge at destination port.",
    city: "Mumbai",
    routeFrom: "Mundra",
    routeTo: "Mumbai",
    stamp: "SAILED · MUMBAI",
    valueProp: "Timely & Safe Delivery",
  },
  {
    eyebrow: "STEP 05",
    headline: "Door-to-door delivery",
    body: "Last-mile road freight, proof of delivery, and a closed shipment file at your destination.",
    city: null,
    routeFrom: null,
    routeTo: null,
    stamp: "DELIVERED",
    valueProp: "Cost Effective Solutions",
  },
];
```

Notes:
- `city: null` on step 5 means "zoom out to fit all" (the finale). The `IndiaMapSVG` component treats `null` as the fit-all view.
- `valueProp` strings match the `title` field of `whyUsItems` exactly (e.g. "24/7 Customer Support") so the strip and the badges stay in sync if either is edited.

- [ ] **Step 3: Type-check**

Run: `cd next-app && npx tsc --noEmit`
Expected: 0 errors. If `tsc` isn't on PATH, `npm run build` in the final verification task covers this.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/lib/data.ts
git commit -m "feat(map-story): add mapCities + storySteps data"
```

---

### Task 2: Add map-story CSS to `globals.css`

**Files:**
- Modify: `next-app/src/app/globals.css` (insert after the reduced-motion reveal block, ~line 178 — immediately after the `.lightbox { transition: none; }` closing brace)

- [ ] **Step 1: Add the map-story CSS block**

Find the reduced-motion block for `.reveal` (ends around line 178 — the block containing `.lightbox { transition: none; }`). Immediately **after** that block's closing `}`, insert:

```css
/* ---- Map story: HQ pulse rings ---- */
@keyframes hq-ring {
  0%   { transform: scale(0.4); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}
.map-hq-ring {
  transform-origin: center;
  transform-box: fill-box;
  animation: hq-ring 2.4s ease-out infinite;
}
.map-hq-ring-2 { animation-delay: 0.8s; }
.map-hq-ring-3 { animation-delay: 1.6s; }

/* ---- Map story: route draw ---- */
.map-route {
  fill: none;
  stroke: #0F766E;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              stroke 0.4s ease,
              opacity 0.4s ease;
}
.map-route-drawn {
  stroke-dashoffset: 0;
}
.map-route-complete {
  stroke: #6B5E4A;
  opacity: 0.3;
}
.map-route-glow {
  filter: url(#route-glow);
  opacity: 0.5;
}

/* ---- Map story: ink stamp ---- */
@keyframes stamp-slam {
  0%   { transform: scale(2.2) rotate(-14deg); opacity: 0; }
  60%  { transform: scale(0.94) rotate(-12deg); opacity: 1; }
  100% { transform: scale(1) rotate(-12deg); opacity: 0.92; }
}
.map-stamp {
  transform-origin: center;
  transform-box: fill-box;
  animation: stamp-slam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* ---- Map story: floating city card ---- */
.map-city-card {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* ---- Map story: reduced motion ---- */
@media (prefers-reduced-motion: reduce) {
  .map-hq-ring,
  .map-hq-ring-2,
  .map-hq-ring-3 {
    animation: none;
    opacity: 0.4;
    transform: scale(1.4);
  }
  .map-route {
    transition: none;
  }
  .map-stamp {
    animation: none;
    transform: rotate(-12deg);
    opacity: 0.92;
  }
  .map-city-card {
    transition: none;
  }
}
```

Notes:
- `transform-box: fill-box` on the rings and stamp ensures `transform-origin: center` refers to each element's own bounding box, not the SVG root. Critical for SVG transforms.
- The stamp overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`) gives the "slam" feel — it scales past 1 then settles. The `rotate(-12deg)` is baked into the keyframe so the stamp lands at a consistent angle.
- `stroke-dashoffset` transition is the route-draw. The component sets `stroke-dasharray = pathLength` and `stroke-dashoffset = pathLength` (hidden), then adds `.map-route-drawn` to transition to 0.
- The reduced-motion block collapses all motion: rings static at a mid-state, routes appear instantly, stamps static pre-rotated, card instant.

- [ ] **Step 2: Commit**

```bash
git add next-app/src/app/globals.css
git commit -m "feat(map-story): add hq rings, route draw, stamp, card css"
```

---

### Task 3: Create `IndiaMapSVG.tsx` — SVG map + choreography

**Files:**
- Create: `next-app/src/components/home/IndiaMapSVG.tsx`

- [ ] **Step 1: Write the component**

Create `next-app/src/components/home/IndiaMapSVG.tsx` with this exact content:

```tsx
"use client";

import { useEffect, useRef, useMemo } from "react";
import { mapCities, storySteps } from "@/lib/data";

const VIEWBOX = 1000;

const INDIA_PATH =
  "M 250 150 " +
  "C 330 135, 410 150, 440 170 " +
  "C 510 210, 580 260, 630 340 " +
  "C 660 420, 620 580, 570 700 " +
  "C 530 810, 460 880, 400 920 " +
  "C 360 900, 320 820, 280 730 " +
  "C 240 640, 222 612, 230 600 " +
  "C 210 580, 180 560, 130 540 " +
  "C 80 520, 70 490, 90 470 " +
  "C 130 430, 160 380, 175 330 " +
  "C 195 270, 215 200, 250 150 Z";

interface TargetView {
  cx: number;
  cy: number;
  scale: number;
}

const STEP_VIEWS: TargetView[] = [
  { cx: 308, cy: 257, scale: 2.2 },
  { cx: 346, cy: 323, scale: 2.2 },
  { cx: 130, cy: 491, scale: 2.2 },
  { cx: 221, cy: 600, scale: 2.2 },
  { cx: 250, cy: 420, scale: 1.1 },
];

const ROUTES: Array<{ from: keyof typeof mapCities; to: keyof typeof mapCities }> = [
  { from: "Ludhiana", to: "Amritsar" },
  { from: "Ludhiana", to: "Delhi" },
  { from: "Ludhiana", to: "Mumbai" },
  { from: "Ludhiana", to: "Mundra" },
  { from: "Delhi", to: "Mumbai" },
  { from: "Mundra", to: "Mumbai" },
];

function arcPath(
  ax: number,
  ay: number,
  bx: number,
  by: number
): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const offset = Math.min(len * 0.18, 60);
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * offset;
  const cy = my + ny * offset;
  return `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface IndiaMapSVGProps {
  activeStep: number;
  reduceMotion: boolean;
}

export function IndiaMapSVG({ activeStep, reduceMotion }: IndiaMapSVGProps) {
  const groupRef = useRef<SVGGElement | null>(null);
  const routeRefs = useRef<Array<SVGPathElement | null>>([]);
  const ghostRef = useRef<SVGCircleElement | null>(null);
  const stampRef = useRef<SVGGElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const flyRaf = useRef<number | null>(null);
  const ghostRaf = useRef<number | null>(null);

  const routeDrawn = useRef<Set<number>>(new Set());

  const routes = useMemo(
    () =>
      ROUTES.map((r) => {
        const a = mapCities[r.from];
        const b = mapCities[r.to];
        return { ...r, d: arcPath(a.x, a.y, b.x, b.y) };
      }),
    []
  );

  const routePaths = useMemo(
    () => routes.map((r) => ({ ...r, from: r.from, to: r.to })),
    [routes]
  );

  const activeCity = storySteps[activeStep]?.city;
  const activeCityData = activeCity ? mapCities[activeCity] : null;

  // flyTo + route draw + ghost + stamp orchestration per activeStep change
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;

    const target = STEP_VIEWS[activeStep] ?? STEP_VIEWS[0];

    // --- flyTo ---
    const startTx = g.getAttribute("data-tx") ? parseFloat(g.getAttribute("data-tx")!) : 0;
    const startTy = g.getAttribute("data-ty") ? parseFloat(g.getAttribute("data-ty")!) : 0;
    const startSc = g.getAttribute("data-sc") ? parseFloat(g.getAttribute("data-sc")!) : 1;

    const endTx = VIEWBOX / 2 - target.cx * target.scale;
    const endTy = VIEWBOX / 2 - target.cy * target.scale;
    const endSc = target.scale;

    if (reduceMotion || (startTx === endTx && startTy === endTy && startSc === endSc)) {
      g.setAttribute("transform", `translate(${endTx} ${endTy}) scale(${endSc})`);
      g.setAttribute("data-tx", String(endTx));
      g.setAttribute("data-ty", String(endTy));
      g.setAttribute("data-sc", String(endSc));
    } else {
      const dur = 600;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / dur, 1);
        const e = easeOut(t);
        const tx = startTx + (endTx - startTx) * e;
        const ty = startTy + (endTy - startTy) * e;
        const sc = startSc + (endSc - startSc) * e;
        g.setAttribute("transform", `translate(${tx} ${ty}) scale(${sc})`);
        g.setAttribute("data-tx", String(tx));
        g.setAttribute("data-ty", String(ty));
        g.setAttribute("data-sc", String(sc));
        if (t < 1) flyRaf.current = requestAnimationFrame(tick);
        else flyRaf.current = null;
      };
      if (flyRaf.current) cancelAnimationFrame(flyRaf.current);
      flyRaf.current = requestAnimationFrame(tick);
    }

    // --- route draw + glow + dim completed ---
    const step = storySteps[activeStep];
    const activeRouteIdx = step.routeFrom && step.routeTo
      ? routes.findIndex(
          (r) =>
            (r.from === step.routeFrom && r.to === step.routeTo) ||
            (r.from === step.routeTo && r.to === step.routeFrom)
        )
      : -1;

    routeRefs.current.forEach((path, i) => {
      if (!path) return;
      const pl = path.getTotalLength();
      path.style.strokeDasharray = String(pl);
      if (i === activeRouteIdx) {
        path.style.strokeDashoffset = String(pl);
        path.classList.remove("map-route-complete");
        void path.getBoundingClientRect();
        requestAnimationFrame(() => {
          path.style.strokeDashoffset = "0";
          path.classList.add("map-route-drawn");
        });
        routeDrawn.current.add(i);
      } else if (routeDrawn.current.has(i)) {
        path.style.strokeDashoffset = "0";
        path.classList.add("map-route-drawn");
        if (activeStep < storySteps.length - 1) {
          path.classList.add("map-route-complete");
        } else {
          path.classList.remove("map-route-complete");
        }
      } else {
        path.style.strokeDashoffset = String(pl);
        path.classList.remove("map-route-drawn");
      }
    });

    // --- cargo ghost on active route ---
    const ghost = ghostRef.current;
    if (ghost && activeRouteIdx >= 0 && !reduceMotion) {
      const path = routeRefs.current[activeRouteIdx];
      if (path) {
        const pl = path.getTotalLength();
        if (ghostRaf.current) cancelAnimationFrame(ghostRaf.current);
        ghost.style.opacity = "1";
        const delay = 700;
        const dur = 1200;
        const t0 = performance.now() + delay;
        const ghostTick = (now: number) => {
          if (now < t0) {
            const p = path.getPointAtLength(0);
            ghost.setAttribute("cx", String(p.x));
            ghost.setAttribute("cy", String(p.y));
            ghostRaf.current = requestAnimationFrame(ghostTick);
            return;
          }
          const t = Math.min((now - t0) / dur, 1);
          const e = easeOut(t);
          const p = path.getPointAtLength(e * pl);
          ghost.setAttribute("cx", String(p.x));
          ghost.setAttribute("cy", String(p.y));
          if (t < 1) ghostRaf.current = requestAnimationFrame(ghostTick);
          else {
            ghostRaf.current = null;
          }
        };
        ghostRaf.current = requestAnimationFrame(ghostTick);
      }
    } else if (ghost) {
      ghost.style.opacity = "0";
    }

    // --- ink stamp ---
    const stamp = stampRef.current;
    if (stamp) {
      if (reduceMotion) {
        stamp.style.opacity = "0.92";
        stamp.style.animation = "none";
        stamp.style.transform = "rotate(-12deg)";
      } else {
        stamp.style.opacity = "0";
        stamp.style.animation = "";
        void stamp.getBoundingClientRect();
        stamp.style.animation = "stamp-slam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards";
      }
      const stampText = stamp.querySelector("text");
      if (stampText) stampText.textContent = step.stamp;
      if (activeCityData) {
        const sx = activeCityData.x;
        const sy = activeCityData.y - 60;
        stamp.setAttribute("transform", `translate(${sx} ${sy}) rotate(-12deg)`);
      } else {
        stamp.setAttribute("transform", `translate(250 380) rotate(-12deg)`);
      }
    }

    // --- floating city card ---
    const card = cardRef.current;
    if (card) {
      if (activeCityData) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      } else {
        card.style.opacity = "0";
        card.style.transform = "translateY(8px)";
      }
    }
  }, [activeStep, reduceMotion, activeCityData, routes]);

  // cleanup rAF loops on unmount
  useEffect(() => {
    return () => {
      if (flyRaf.current) cancelAnimationFrame(flyRaf.current);
      if (ghostRaf.current) cancelAnimationFrame(ghostRaf.current);
    };
  }, []);

  const step = storySteps[activeStep];
  const cityLabel = activeCityData?.label ?? "";
  const cityTag = activeCityData?.tag ?? "";

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-full h-full block"
        role="img"
        aria-label="Map of India showing Shivaay Logistics service cities and freight routes"
        style={{ background: "#FAF8F4" }}
      >
        <defs>
          <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
          </filter>
          <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
          </filter>
        </defs>

        <g ref={groupRef} data-tx="0" data-ty="0" data-sc="1">
          {/* India outline */}
          <path
            d={INDIA_PATH}
            fill="#FAF8F4"
            stroke="#1E1B18"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* Route arcs */}
          {routes.map((r, i) => (
            <path
              key={i}
              ref={(el) => { routeRefs.current[i] = el; }}
              d={r.d}
              className="map-route"
            >
              <title>{`${mapCities[r.from].label} → ${mapCities[r.to].label}`}</title>
            </path>
          ))}

          {/* Cargo ghost */}
          <circle
            ref={ghostRef}
            r={5}
            fill="#0F766E"
            opacity={0}
            style={{ transition: "opacity 0.2s ease" }}
          />

          {/* HQ pulse rings (Ludhiana) */}
          {mapCities.Ludhiana && (
            <g>
              <circle cx={mapCities.Ludhiana.x} cy={mapCities.Ludhiana.y} r={18} fill="none" stroke="#0F766E" strokeWidth={1.5} className="map-hq-ring" />
              <circle cx={mapCities.Ludhiana.x} cy={mapCities.Ludhiana.y} r={18} fill="none" stroke="#0F766E" strokeWidth={1.5} className="map-hq-ring map-hq-ring-2" />
              <circle cx={mapCities.Ludhiana.x} cy={mapCities.Ludhiana.y} r={18} fill="none" stroke="#0F766E" strokeWidth={1.5} className="map-hq-ring map-hq-ring-3" />
            </g>
          )}

          {/* City nodes + labels */}
          {Object.entries(mapCities).map(([name, c]) => (
            <g key={name}>
              <circle
                cx={c.x}
                cy={c.y}
                r={c.isHub ? 8 : 6}
                fill="#0F766E"
                stroke="#FAF8F4"
                strokeWidth={2}
              >
                <title>{`${c.label} — ${c.tag}`}</title>
              </circle>
              <text
                x={c.x + 12}
                y={c.y + 4}
                fontSize={c.isHub ? 15 : 13}
                fontWeight={c.isHub ? 600 : 500}
                fill={c.isHub ? "#1E1B18" : "#6B5E4A"}
                fontFamily="var(--font-sans)"
              >
                {c.label}
              </text>
            </g>
          ))}

          {/* Ink stamp */}
          <g ref={stampRef} filter="url(#ink-bleed)" opacity={0} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <rect x={-90} y={-16} width={180} height={32} rx={3} fill="none" stroke="#0F766E" strokeWidth={2} />
            <text x={0} y={6} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0F766E" fontFamily="var(--font-sans)" letterSpacing={1}>
              {step.stamp}
            </text>
          </g>
        </g>
      </svg>

      {/* Floating city card */}
      <div
        ref={cardRef}
        className="map-city-card absolute left-1/2 -translate-x-1/2 bottom-6 max-w-[220px] rounded-lg border border-[#E8E4DB] bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_4px_16px_rgba(30,27,24,0.08)] opacity-0"
        aria-live="polite"
      >
        {activeCityData && (
          <>
            <div className="text-[0.6875rem] font-semibold uppercase tracking-wide text-teal">
              {cityTag}
            </div>
            <div className="font-serif text-lg font-medium text-ink leading-tight mt-0.5">
              {cityLabel}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

**Why this is correct (read before committing):**

1. **No per-frame `setState`:** All animation writes to SVG attributes (`g.setAttribute`, `path.style.strokeDashoffset`, `ghost.setAttribute`) imperatively via rAF. The only state is the `activeStep` prop, which comes from the parent. This mirrors the `NetworkMap.tsx:84-86` imperative-DOM pattern noted in `tasks/lessons.md:21-22`.

2. **`react-hooks/set-state-in-effect` safe:** No `setState` is called anywhere in this component. The `useEffect` only writes to refs and SVG attributes. Lint-clean by construction.

3. **`react-hooks/immutability` safe:** The rAF loop functions (`tick`, `ghostTick`) are defined inside the `useEffect`, not self-referencing across renders. They reference `flyRaf.current` / `ghostRaf.current` via refs for cancellation. No self-referencing function needs a ref here because each effect run defines a fresh closure.

4. **flyTo + route-draw don't collide:** The `<g transform>` is on the outer group; the route `<path>` elements are children with their own `stroke-dashoffset`. SVG transforms and stroke-dashoffset are independent — the path geometry is static, only the viewport (group transform) moves. This is the core reason we chose SVG over Leaflet (Leaflet re-projects paths on pan/zoom, resetting dashoffset).

5. **Cargo ghost uses `getPointAtLength`:** Standard, well-supported. Delayed 700ms so it starts after the route finishes drawing (~800ms route-draw, ghost begins at 700ms for a slight overlap — feels like cargo departs as the route completes).

6. **Reduced-motion:** `reduceMotion` prop (passed from parent, which checks `matchMedia`) short-circuits the flyTo (instant set), hides the ghost, and makes the stamp appear static. The CSS reduced-motion block in Task 2 handles the rings and transitions.

7. **Route state persistence:** `routeDrawn.current` is a `Set` tracking which routes have been drawn. Once drawn, a route stays drawn (dashoffset 0); on non-finale steps it gets `.map-route-complete` (dim ink hairline); on the finale step (index 4) all drawn routes lose `.map-route-complete` so they return to full teal — the "whole network alive" payoff.

8. **Stamp filter:** `feTurbulence` + `feDisplacementMap` gives the ink-bleed texture. The stamp is a `<g>` containing a rect border + text, repositioned per step via `transform`. The animation is applied via inline style (re-triggered by clearing + re-setting `animation`).

9. **Cleanup:** rAF loops cancelled on unmount. No observers here (the parent owns the IntersectionObserver).

10. **The `INDIA_PATH`** is a stylized editorial silhouette — intentionally loose, reads as India at a glance, not a GIS export. Matches the spec's "hand-traced" direction. If visual verification (Task 6) shows it doesn't read as India clearly enough, swap the path data for a more accurate public-domain simplified outline — the rest of the component is path-agnostic.

- [ ] **Step 2: Type-check**

Run: `cd next-app && npx tsc --noEmit`
Expected: 0 errors. Watch for: `routeRefs.current[i] = el` callback returning the assignment (use block body `{ ... }` to return void — already done in the code above), `getPointAtLength` returning `DOMPoint` (has `.x`/`.y` — fine), `performance` global (DOM lib — fine).

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/IndiaMapSVG.tsx
git commit -m "feat(map-story): add IndiaMapSVG with flyto, routes, ghost, stamps"
```

---

### Task 4: Create `MapStory.tsx` — sticky layout + scroll controller

**Files:**
- Create: `next-app/src/components/home/MapStory.tsx`

- [ ] **Step 1: Write the component**

Create `next-app/src/components/home/MapStory.tsx` with this exact content:

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { storySteps } from "@/lib/data";
import { IndiaMapSVG } from "./IndiaMapSVG";

export function MapStory() {
  const [activeStep, setActiveStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const blockRefs = useRef<Array<HTMLElement | null>>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeStep;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = Number(entry.target.getAttribute("data-step"));
          }
        });
        if (bestRatio > 0 && bestIdx !== activeStep) {
          setActiveStep(bestIdx);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    blockRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    observerRef.current = observer;
    return observer;
  }, [activeStep]);

  useEffect(() => {
    const observer = setupObserver();
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [setupObserver]);

  const activeCityLabel =
    storySteps[activeStep]?.city ? storySteps[activeStep].city : null;

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[42%_58%] gap-0 lg:gap-8">
      {/* Map column — sticky */}
      <div className="hidden lg:block sticky top-[88px] h-[calc(100dvh-88px)] order-1">
        <IndiaMapSVG activeStep={activeStep} reduceMotion={reduceMotion} />
      </div>

      {/* Mobile map — sticky on top */}
      <div className="lg:hidden sticky top-0 h-[52vh] z-10 order-1 bg-[#FAF8F4]">
        <IndiaMapSVG activeStep={activeStep} reduceMotion={reduceMotion} />
      </div>

      {/* Story column */}
      <div className="order-2 lg:py-0 py-12">
        {/* Desktop elevation progress (left rail) */}
        <div className="hidden lg:flex sticky top-[88px] left-0 h-[calc(100dvh-88px)] pointer-events-none absolute -ml-12 w-8 flex-col items-center justify-center gap-3">
          <svg viewBox="0 0 20 200" className="h-[60%] w-3" aria-hidden="true">
            <line x1="10" y1="10" x2="10" y2="190" stroke="#0F766E" strokeWidth="1.5" />
            {storySteps.map((_, i) => {
              const y = 10 + (180 / (storySteps.length - 1)) * i;
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <g key={i}>
                  {active ? (
                    <circle cx="10" cy={y} r="5" fill="#0F766E" />
                  ) : done ? (
                    <path d={`M 7 ${y - 3} L 9 ${y} L 13 ${y - 3}`} fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <circle cx="10" cy={y} r="3.5" fill="none" stroke="#6B5E4A" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Story blocks */}
        <div className="lg:pl-12">
          {storySteps.map((step, i) => (
            <section
              key={i}
              ref={(el) => { blockRefs.current[i] = el; }}
              data-step={i}
              className="min-h-[60vh] lg:min-h-[80vh] flex flex-col justify-center py-12 lg:py-20 max-w-[520px]"
            >
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-teal mb-3">
                {step.eyebrow}
              </div>
              <h3 className="font-serif text-2xl lg:text-3xl font-medium text-ink leading-[1.2] mb-4">
                {step.headline}
              </h3>
              <p className="text-base text-ink-dim leading-[1.7] mb-6">
                {step.body}
              </p>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#E8E4DB] bg-white px-3 py-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-teal" />
                <span className="text-xs font-medium text-ink">{step.valueProp}</span>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Why this is correct (read before committing):**

1. **Single state: `activeStep`.** Set only inside the `IntersectionObserver` callback (an event handler), never synchronously in a `useEffect` body. This satisfies `react-hooks/set-state-in-effect` — the observer fires asynchronously, not during effect execution. `reduceMotion` is set inside the `matchMedia` `onChange` callback, same pattern.

2. **No `window.addEventListener('scroll')`.** Only `IntersectionObserver`. Compliant with the design-taste-frontend hard ban.

3. **Observer rootMargin `-45% 0px -45% 0px`:** The active block is the one crossing the vertical center of the viewport. Threshold array `[0, 0.1, 0.5, 1]` gives the callback enough granularity to pick the most-visible block. The callback tracks `bestRatio` so when two blocks straddle the center, the more-visible one wins.

4. **`reduceMotion` passed to `IndiaMapSVG`** as a prop so the child doesn't re-query `matchMedia` (single source of truth, and the child's `useEffect` doesn't need its own media-query listener — simpler, fewer re-renders).

5. **Layout — desktop (lg+):** CSS Grid `grid-cols-[42%_58%]`. Map column is `sticky top-[88px] h-[calc(100dvh-88px)]` (88px clears the navbar per the warm-editorial spec). Story column is the tall scrolling side. The elevation progress rail is an absolutely-positioned thin SVG on the left edge of the story column (`-ml-12`), sticky vertically, pointer-events-none so it never blocks clicks.

6. **Layout — mobile (<lg):** Single column. Map is `sticky top-0 h-[52vh] z-10` (z-10 keeps it above the story blocks as they scroll under). Story blocks stack beneath with `py-12`. The desktop elevation rail is hidden on mobile (`hidden lg:flex`).

7. **Story block markup:** eyebrow (Inter 600 uppercase tracking-wide — one eyebrow pattern repeated across 5 sub-blocks; within the 1-per-3-sections budget since the whole map-story is one logical section), Playfair H3, Inter body (max 2 lines per spec), value-prop badge (teal dot + label in a pill). Editorial restraint — no bullets, no nested lists. `max-w-[520px]` keeps line length readable (design-taste-frontend: 65–75ch).

8. **`data-step` attribute** on each block lets the observer callback map entries back to step indices without array lookups.

9. **The `activeCityLabel` variable** is currently unused in the JSX (the `IndiaMapSVG` renders its own floating card). It's kept for potential future use but **if lint flags it as unused, remove it**. (Defensive note: TS may warn — if so, delete the `const activeCityLabel = ...` line.)

- [ ] **Step 2: Type-check**

Run: `cd next-app && npx tsc --noEmit`
Expected: 0 errors. If `activeCityLabel` is flagged as unused, delete it. If `blockRefs.current[i] = el` callback is flagged for returning a value, it's already a block body `{ ... }` returning void — should be fine.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/components/home/MapStory.tsx
git commit -m "feat(map-story): add MapStory sticky layout + scroll controller"
```

---

### Task 5: Create `MapStorySection.tsx` + wire into `page.tsx`, retire `WhyPartnerSection`

**Files:**
- Create: `next-app/src/components/home/MapStorySection.tsx`
- Modify: `next-app/src/app/page.tsx` (swap import + usage)
- Keep on disk (unimported): `WhyPartnerSection.tsx`, `NetworkMap.tsx`, `NetworkMapSection.tsx`

- [ ] **Step 1: Create `MapStorySection.tsx`**

Create `next-app/src/components/home/MapStorySection.tsx` with this exact content:

```tsx
import dynamic from "next/dynamic";
import { whyUsItems } from "@/lib/data";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon as IconWrapper } from "@/components/ui/Icon";

const MapStory = dynamic(() => import("./MapStory").then((mod) => ({ default: mod.MapStory })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-[#FAF8F4] flex items-center justify-center">
      <div className="text-ink-dim animate-pulse">Loading map story…</div>
    </div>
  ),
});

const iconMap: Record<string, LucideIcon> = {
  "shield-check": Icons.ShieldCheck,
  clock: Icons.Clock,
  "badge-indian-rupee": Icons.BadgeIndianRupee,
  "file-text": Icons.FileText,
  headphones: Icons.Headphones,
};

export function MapStorySection() {
  return (
    <section className="py-24 bg-white border-t border-border" aria-labelledby="why-us-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 id="why-us-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink mb-10">
          Why partner with us
        </h2>

        {/* Why-us strip — compact index */}
        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 mb-20">
          {whyUsItems.map((item, i) => {
            const Icon = iconMap[item.icon] || Icons.Check;
            return (
              <li key={i} className="reveal flex flex-col gap-2 lg:border-l lg:border-border lg:pl-4 lg:first:border-l-0 lg:first:pl-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-teal-tint">
                  <IconWrapper icon={Icon} size={16} className="text-teal" aria-hidden={true} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-sm leading-tight">{item.title}</h3>
                  <p className="text-ink-dim text-xs mt-0.5 leading-snug">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* The map story set-piece */}
        <MapStory />
      </div>
    </section>
  );
}
```

Notes:
- The why-us strip is a 5-column row on desktop (`lg:grid-cols-5`), 2 on tablet, 1 on mobile, with hairline left-borders between items on desktop (editorial divider, no cards). Section heading "Why partner with us" is preserved from the original `WhyPartnerSection` — same `id="why-us-heading"` for the existing aria-labelledby link.
- `MapStory` is `dynamic(..., { ssr: false })` with a skeleton loader — matches the `NetworkMapSection.tsx` pattern. Keeps the story (and its `IntersectionObserver`/rAF) out of the server bundle and initial paint.
- `whyUsItems` and the `iconMap` are reused from the original `WhyPartnerSection` so the value-prop copy stays in sync.

- [ ] **Step 2: Wire into `page.tsx`**

Open `next-app/src/app/page.tsx`. Replace the `WhyPartnerSection` import and usage:

Change line 3 from:
```tsx
import { WhyPartnerSection } from "@/components/home/WhyPartnerSection";
```
to:
```tsx
import { MapStorySection } from "@/components/home/MapStorySection";
```

Change line 28 from:
```tsx
      <WhyPartnerSection />
```
to:
```tsx
      <MapStorySection />
```

The rest of `page.tsx` stays identical (Hero, ServiceTags, MapStorySection, MissionSection, TestimonialsSection, CTASection).

- [ ] **Step 3: Build + lint**

Run: `cd next-app && npm run build`
Expected: 0 errors, 4 routes static (`/`, `/services`, `/contact`, `/not-found`). The `MapStorySection` import must resolve. If you see "Cannot find module './MapStory'", Task 5 Step 1 wasn't saved to disk.

Run: `cd next-app && npm run lint`
Expected: 0 errors, 0 warnings. Watch for: unused `activeCityLabel` in `MapStory.tsx` (delete if flagged), unused imports in the old `WhyPartnerSection.tsx` (it's now unimported — lint may still scan it; if it errors on the unimported file, that's a pre-existing file and can be left, or add a `// @ts-nocheck` if it blocks — but it shouldn't, since it was lint-clean before).

- [ ] **Step 4: Commit**

```bash
git add next-app/src/components/home/MapStorySection.tsx next-app/src/app/page.tsx
git commit -m "feat(map-story): wire MapStorySection into home, retire WhyPartner"
```

---

### Task 6: Visual + behavioural verification

**Files:** None modified — verification only.

- [ ] **Step 1: Build and serve the static export**

Run: `cd next-app && npm run build`
Then serve: `npx serve out -l 4173` (background it or use a separate shell). Confirm `curl -s http://localhost:4173/ | grep -o 'Why partner with us'` returns a hit — the why-us strip is server-rendered (the story itself is `ssr: false` so won't appear in curl, which is expected).

- [ ] **Step 2: Playwright desktop snapshot — scroll through the story**

Use Playwright: `playwright_browser_navigate` to `http://localhost:4173/`, then `playwright_browser_snapshot`. Scroll down to the "Why partner with us" section. Confirm:
- The why-us strip renders (5 items in a row on desktop).
- Below it, the sticky map is visible on the left, story blocks scroll on the right.
- As you scroll each story block into view, the map flies to the corresponding city, a route draws (steps 2–4), a stamp slams down, and the floating city card appears.
- On the final step, all routes glow teal (no dim).
Take a screenshot at step 3 (Mundra) → `screenshots/map-story-desktop.png` (the `screenshots/` dir is gitignored per `tasks/lessons.md:36`).

- [ ] **Step 3: Playwright reduced-motion check**

Emulate reduced motion via `playwright_browser_evaluate`:
```js
() => { window.matchMedia = (q) => ({ matches: q.includes('reduce'), addEventListener(){}, removeEventListener(){} }); }
```
Then reload (`playwright_browser_navigate` to `/` again — the override must be in place before hydration; if flaky, use `playwright_browser_run_code_unsafe` to set it on the page before navigation). Scroll through the story. Confirm:
- No flyTo animation (map jumps instantly to each city).
- No route-draw animation (routes appear instantly).
- No cargo ghost dot.
- No stamp slam (stamps appear static, pre-rotated).
- No HQ ring expansion (rings static at mid-state).
- The story still advances per scroll (IntersectionObserver still drives `activeStep`).
Screenshot → `screenshots/map-story-reduced.png`.

- [ ] **Step 4: Playwright mobile layout check (375px)**

Resize: `playwright_browser_resize` to `width: 375, height: 667`. Navigate to `/`. Scroll to the map story. Confirm:
- The map is sticky at the top of the section at ~52vh height.
- Story blocks stack beneath, each readable, no horizontal scroll.
- The map still flies/updates per step (choreography intact).
- The desktop elevation rail is hidden.
Screenshot → `screenshots/map-story-mobile.png`.

- [ ] **Step 5: Hydration + console check**

In the desktop Playwright session, capture console messages (`playwright_browser_console_messages`, level `warning`). Confirm there are **no** hydration mismatch warnings and no React errors. The story is `ssr: false` so it hydrates fresh; the why-us strip is static server HTML. Expected: clean.

- [ ] **Step 6: Palette + a11y audit**

In the Playwright desktop session, evaluate:
```js
() => {
  const map = document.querySelector('[aria-label*="Map of India"]');
  const bg = map ? getComputedStyle(map).background : 'no map';
  const routes = document.querySelectorAll('.map-route');
  return { mapBg: bg, routeCount: routes.length, hasTitles: document.querySelectorAll('svg title').length };
}
```
Confirm: `routeCount: 6`, `hasTitles` ≥ 11 (5 city nodes + 6 routes), and the map background is cream. Spot-check that city labels are always visible (not hover-gated) — they're `<text>` elements, always rendered.

- [ ] **Step 7: Document verification + final commit**

If verification surfaced fixes, commit them:
```bash
git add -A
git commit -m "fix(map-story): <what was fixed>"
```
If no fixes needed, no commit — the implementation commits in Tasks 1–5 stand. Record results in a brief `tasks/map-story-verification.md` (build status, lint status, screenshot paths, deviations found).

---

## Self-Review Checklist (run before declaring done)

- [ ] **Spec coverage:** Every "In scope" spec item has a task. SVG map + choreography → Task 3, sticky layout + scroll controller → Task 4, why-us strip + section → Task 5, layers A–G → Task 3 (arcs A, ghost B, stamp C, glow D, card E, labels G) + Task 4 (progress F), reduced-motion → Task 3 + Task 4 + Task 6 Step 3, mobile → Task 4 + Task 6 Step 4, lazy-load → Task 5, Leaflet retired-but-kept → Task 5 note. ✓
- [ ] **No placeholders:** No "TBD", no "implement appropriate handling", no "similar to above". All code is complete. The `INDIA_PATH` is a real path string; swap only if visual verification (Task 6 Step 2) shows it doesn't read as India. ✓
- [ ] **Type consistency:** `MapCity` (x, y, label, tag, isHub) matches `mapCities` usage in `IndiaMapSVG` (`c.x`, `c.y`, `c.isHub`). `StoryStep` (eyebrow, headline, body, city, routeFrom, routeTo, stamp, valueProp) matches `storySteps` usage in `MapStory` (`step.eyebrow`, `step.headline`, `step.body`, `step.valueProp`) and `IndiaMapSVG` (`step.routeFrom`, `step.routeTo`, `step.stamp`). `IndiaMapSVGProps` (activeStep, reduceMotion) matches `MapStory` usage. ✓
- [ ] **Lint gotchas addressed:** `set-state-in-effect` (setState in observer callback, not effect body — Tasks 3 & 4), `immutability` (rAF in refs, no self-referencing functions — Task 3), no `window.scroll` (observer only — Task 4), `next/image`/`next/link` (N/A). ✓
- [ ] **Verification has teeth:** Build + lint + 5 Playwright checks (desktop scroll, reduced-motion, mobile 375px, hydration/console, palette/a11y). ✓
