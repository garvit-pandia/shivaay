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
  const stampInnerRef = useRef<SVGGElement | null>(null);
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
    const stampInner = stampInnerRef.current;
    if (stamp) {
      if (activeCityData) {
        const sx = activeCityData.x;
        const sy = activeCityData.y - 60;
        stamp.setAttribute("transform", `translate(${sx} ${sy}) rotate(-12)`);
      } else {
        stamp.setAttribute("transform", `translate(250 380) rotate(-12)`);
      }
      const stampText = stamp.querySelector("text");
      if (stampText) stampText.textContent = step.stamp;
    }
    if (stampInner) {
      if (reduceMotion) {
        stampInner.style.opacity = "0.92";
        stampInner.style.transform = "scale(1)";
      } else {
        const dur = 450;
        const t0 = performance.now();
        const overshoot = (t: number) => {
          if (t < 0.6) return 2.2 - (2.2 - 0.94) * (t / 0.6);
          const t2 = (t - 0.6) / 0.4;
          return 0.94 + (1 - 0.94) * (1 - Math.pow(1 - t2, 3));
        };
        const stampTick = (now: number) => {
          const t = Math.min((now - t0) / dur, 1);
          const s = overshoot(t);
          stampInner.style.transform = `scale(${s})`;
          stampInner.style.opacity = String(Math.min(t * 2.5, 0.92));
          if (t < 1) requestAnimationFrame(stampTick);
          else {
            stampInner.style.transform = "scale(1)";
            stampInner.style.opacity = "0.92";
          }
        };
        stampInner.style.opacity = "0";
        stampInner.style.transform = "scale(2.2)";
        requestAnimationFrame(stampTick);
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
          <g ref={stampRef}>
            <g ref={stampInnerRef} filter="url(#ink-bleed)" opacity={0} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              <rect x={-90} y={-16} width={180} height={32} rx={3} fill="none" stroke="#0F766E" strokeWidth={2} />
              <text x={0} y={6} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0F766E" fontFamily="var(--font-sans)" letterSpacing={1}>
                {step.stamp}
              </text>
            </g>
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
