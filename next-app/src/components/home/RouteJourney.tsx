"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/components/motion/gsap";
import { TextReveal } from "@/components/motion/TextReveal";
import { LiveTicker } from "@/components/motion/LiveTicker";
import { cities, routes } from "@/lib/data";
import { INDIA_BOUNDS, INDIA_PATH } from "@/lib/india-outline";
import {
  chapterViewBox,
  fitViewBox,
  formatCoord,
  journeyChapters,
  journeyRoutes,
  project,
  viewBoxString,
  type ViewBox,
} from "@/lib/journey";

const INDIA_VIEW: ViewBox = { x: -14, y: -10, w: INDIA_BOUNDS.width + 28, h: INDIA_BOUNDS.height + 20 };
/** Server / reduced-motion framing: the whole corridor with every route drawn. */
const ALL_VIEW = fitViewBox(
  Object.values(cities).map((c) => project(c.lng, c.lat)),
  26,
  0.95
);
/**
 * SVG user units per CSS pixel for viewBox `v` drawn into a `w`×`h` box with
 * `meet` fitting. Published as `--u` so markers/strokes keep a constant
 * on-screen size at any zoom (`calc(var(--u) * 2px)` = 2 screen px).
 */
const unitFor = (v: ViewBox, w = 560, h = 590) => Math.max(v.w / w, v.h / h);

// Graticule every 2° across the outline bounds.
const GRID_LNG = Array.from({ length: 16 }, (_, i) => 68 + i * 2);
const GRID_LAT = Array.from({ length: 16 }, (_, i) => 8 + i * 2);

const connections = (city: string) =>
  routes
    .filter((r) => r.from === city || r.to === city)
    .map((r) => (r.from === city ? r.to : r.from));

/**
 * Homepage network section. A sticky India map (official boundaries) zooms
 * and draws routes as five chapters scroll past: HQ → border → distribution
 * → ports. Freight dots ride every drawn route via SMIL (no JS loop).
 */
export function RouteJourney() {
  const root = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      const scope = root.current;
      if (!svg || !scope) return;
      // Camera state; static ALL_VIEW unless the journey below animates it.
      const vb: ViewBox = { ...ALL_VIEW };
      // Size cached from the observer — measuring per tween frame would
      // force a layout right after each viewBox write.
      const size = { w: 0, h: 0 };
      let refit: (() => void) | null = null;
      const apply = () => {
        svg.setAttribute("viewBox", viewBoxString(vb));
        if (size.w > 0 && size.h > 0) svg.style.setProperty("--u", unitFor(vb, size.w, size.h).toFixed(4));
      };
      const ro = new ResizeObserver(([entry]) => {
        size.w = entry.contentRect.width;
        size.h = entry.contentRect.height;
        if (refit) refit();
        else apply();
      });
      ro.observe(svg);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const aspect = () => (size.w > 0 && size.h > 0 ? size.w / size.h : 0.95);
        const routeEls = new Map(
          journeyRoutes.map((r) => [r.id, scope.querySelector<SVGGElement>(`[data-route="${r.id}"]`)!])
        );
        const cityEls = scope.querySelectorAll<SVGGElement>("[data-city]");
        const chapterEls = scope.querySelectorAll<HTMLElement>("[data-chapter]");

        let current = -2;
        /** Chapter i (-1 = pre-journey: whole country, nothing drawn). */
        const go = (i: number, instant = false) => {
          if (i === current) return;
          current = i;
          scope.dataset.journey = String(i);
          const chapter = journeyChapters[i];
          const target = chapter ? chapterViewBox(chapter, aspect()) : INDIA_VIEW;
          const dur = (s: number) => (instant ? 0 : s);
          gsap.to(vb, { ...target, duration: dur(1.4), ease: "power3.inOut", overwrite: true, onUpdate: apply });
          const drawn = new Set(chapter?.routes ?? []);
          routeEls.forEach((el, id) => {
            const on = drawn.has(id);
            el.classList.toggle("is-drawn", on);
            gsap.to(el.querySelector(".jr-draw"), {
              strokeDashoffset: on ? 0 : 1,
              duration: dur(on ? 1.3 : 0.5),
              delay: on && !instant ? 0.35 : 0,
              ease: "power2.inOut",
              overwrite: true,
            });
          });
          const visited = new Set(journeyChapters.slice(0, i + 1).map((c) => c.city));
          cityEls.forEach((el) => {
            const name = el.dataset.city!;
            el.classList.toggle("is-visited", visited.has(name));
            el.classList.toggle("is-active", chapter?.city === name);
          });
          chapterEls.forEach((el, k) => el.classList.toggle("is-active", k === i));
        };
        go(-1, true);
        // Keep the active chapter framed when the map's aspect changes.
        refit = () => {
          const chapter = journeyChapters[current];
          if (chapter) Object.assign(vb, chapterViewBox(chapter, aspect()));
          apply();
        };

        chapterEls.forEach((el, i) =>
          ScrollTrigger.create({
            trigger: el,
            start: "top 62%",
            end: "bottom 62%",
            onToggle: (self) => {
              if (self.isActive) go(i);
            },
            onLeaveBack: () => {
              if (i === 0) go(-1);
            },
          })
        );

        return () => {
          refit = null;
          Object.assign(vb, ALL_VIEW);
          apply();
          delete scope.dataset.journey;
          routeEls.forEach((el) => el.classList.add("is-drawn"));
          cityEls.forEach((el) => {
            el.classList.add("is-visited");
            el.classList.remove("is-active");
          });
          chapterEls.forEach((el) => el.classList.remove("is-active"));
        };
      });
      return () => {
        mm.revert();
        ro.disconnect();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="journey relative bg-cream border-t border-border"
      aria-labelledby="network-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6 pt-24 lg:pt-32">
        <p className="mono-label text-[10px] text-orange mb-3">Manifest · 02 — Network</p>
        <TextReveal
          id="network-heading"
          className="font-serif text-4xl lg:text-6xl font-medium text-ink max-w-3xl leading-[1.05]"
        >
          Our coverage network
        </TextReveal>
        <p className="text-ink-dim max-w-xl mt-5">
          Headquartered in Ludhiana, clearing cargo through the border, the capital and the
          western ports. Scroll the corridor.
        </p>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-16 pb-24 lg:pb-32">
        {/* Map — sticky beside (desktop) / above (mobile) the chapters */}
        <div className="journey-map-col">
          <div className="journey-map">
            <svg
              ref={svgRef}
              className="journey-svg"
              viewBox={viewBoxString(ALL_VIEW)}
              style={{ "--u": unitFor(ALL_VIEW).toFixed(4) } as React.CSSProperties}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Map of India showing Shivaay Logistics routes from Ludhiana to Amritsar, Delhi, Mumbai and Mundra"
            >
              <g className="jr-grid" aria-hidden="true">
                {GRID_LNG.map((lng) => {
                  const x = project(lng, 0).x;
                  return <line key={`x${lng}`} x1={x} x2={x} y1={-20} y2={INDIA_BOUNDS.height + 20} />;
                })}
                {GRID_LAT.map((lat) => {
                  const y = project(68, lat).y;
                  return <line key={`y${lat}`} x1={-20} x2={INDIA_BOUNDS.width + 20} y1={y} y2={y} />;
                })}
              </g>
              <path className="jr-land" d={INDIA_PATH} />

              {journeyRoutes.map((r) => (
                <g key={r.id} data-route={r.id} className="jr-route is-drawn">
                  <path id={`jr-${r.id}`} className="jr-base" d={r.d} />
                  <path className="jr-draw" d={r.d} pathLength={1} />
                  <path className="jr-flow" d={r.d} />
                  <circle className="jr-freight" r="1.2">
                    <animateMotion
                      dur={`${5 + (r.d.length % 4)}s`}
                      repeatCount="indefinite"
                      keyPoints="0;1;0"
                      keyTimes="0;0.5;1"
                      calcMode="linear"
                    >
                      <mpath href={`#jr-${r.id}`} />
                    </animateMotion>
                  </circle>
                </g>
              ))}

              {journeyChapters.map(({ city }) => {
                const c = cities[city];
                const p = project(c.lng, c.lat);
                const left = city === "Amritsar" || city === "Mundra" || city === "Mumbai";
                return (
                  <g
                    key={city}
                    data-city={city}
                    className={`jr-city is-visited${c.isHub ? " is-hub" : ""}`}
                    transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                  >
                    <g className="jr-city-scale">
                      <circle className="jr-pulse" r="11" />
                      <circle className="jr-dot" r={c.isHub ? 6.5 : 5} />
                      <text
                        className="jr-label"
                        x={left ? -11 : 11}
                        y={4}
                        textAnchor={left ? "end" : "start"}
                      >
                        {c.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            <div className="journey-hud" aria-hidden="true">
              <span className="mono-label text-[9px] text-ink-dim">LDH · Corridor map</span>
              <span className="mono-label text-[9px] text-ink-dim hidden sm:inline">Lat/Lng 2° grid</span>
            </div>
            <div className="journey-ticker">
              <LiveTicker />
            </div>
          </div>
        </div>

        {/* Chapters */}
        <ol className="journey-chapters list-none m-0 p-0">
          {journeyChapters.map(({ city }, i) => {
            const c = cities[city];
            return (
              <li key={city} data-chapter={i} className="journey-chapter">
                <div className="journey-card waybill">
                  <div className="flex items-center justify-between mb-5">
                    <span className="mono-label text-[10px] text-teal">
                      {String(i + 1).padStart(2, "0")} / {String(journeyChapters.length).padStart(2, "0")}
                    </span>
                    <span className="mono-label text-[10px] text-ink-dim">{formatCoord(c.lat, c.lng)}</span>
                  </div>
                  <p className="mono-label text-[10px] text-orange mb-2">{c.tag}</p>
                  <h3 className="font-serif text-3xl lg:text-5xl font-medium text-ink mb-5">{c.name}</h3>
                  <ul className="list-none m-0 p-0 flex flex-wrap gap-2 mb-6">
                    {c.services.map((s) => (
                      <li
                        key={s}
                        className="text-xs font-medium text-teal bg-teal-tint border border-teal/20 rounded-full px-3 py-1"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="mono-label text-[9px] text-ink-dim border-t border-dashed border-ink/15 pt-4 m-0">
                    Linked to · {connections(city).join(" · ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
