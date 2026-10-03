"use client";

import { useEffect, useRef, useState } from "react";
import { Truck } from "lucide-react";

interface Pt {
  x: number;
  y: number;
}

/**
 * Route-line scroll spine. Draws a smooth dashed route through every
 * homepage section marked with [data-station]; a truck marker travels
 * the path with scroll progress. Desktop only, decorative.
 */
export function RouteSpine({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const progRef = useRef<SVGPathElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);
  const [stations, setStations] = useState<Pt[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const prog = progRef.current;
    const vehicle = vehicleRef.current;
    if (!container || !svg || !path || !prog || !vehicle) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let L = 0;
    let pts: Pt[] = [];

    const smooth = (points: Pt[]) => {
      if (points.length < 2) return "";
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
      }
      const last = points[points.length - 1];
      d += ` L ${last.x} ${last.y}`;
      return d;
    };

    const build = () => {
      const cRect = container.getBoundingClientRect();
      const H = container.scrollHeight;
      const W = 160;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.style.height = `${H}px`;

      const els = Array.from(container.querySelectorAll<HTMLElement>("[data-station]"));
      pts = els.map((el, i) => {
        const r = el.getBoundingClientRect();
        return {
          x: 80 + (i % 2 === 0 ? -26 : 26),
          y: r.top - cRect.top + Math.min(r.height / 2, 120),
        };
      });
      if (pts.length < 2) return;
      pts[0] = { x: 80, y: Math.max(pts[0].y, 40) };
      // Draw the route ~80px past the final station (station dot stays put)
      const drawPts = pts.map((p, i) =>
        i === pts.length - 1 ? { x: p.x, y: p.y + 80 } : p
      );

      const d = smooth(drawPts);
      path.setAttribute("d", d);
      prog.setAttribute("d", d);
      L = path.getTotalLength();
      prog.style.strokeDasharray = `${L}`;
      prog.style.strokeDashoffset = reduced ? "0" : `${L}`;
      setStations(pts);
    };

    const onScroll = () => {
      if (reduced || L === 0) return;
      const cRect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(
        1,
        Math.max(0, (vh * 0.65 - cRect.top) / cRect.height)
      );
      prog.style.strokeDashoffset = `${L * (1 - p)}`;
      const pt = path.getPointAtLength(p * L);
      vehicle.style.transform = `translate(${pt.x - 11}px, ${pt.y - 11}px)`;
      vehicle.style.opacity = p > 0.01 && p < 0.995 ? "1" : "0";
    };

    let raf = 0;
    const onScrollRaf = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    };

    build();
    onScroll();
    const ro = new ResizeObserver(() => {
      build();
      onScroll();
    });
    ro.observe(container);
    window.addEventListener("scroll", onScrollRaf, { passive: true });
    window.addEventListener("load", build);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScrollRaf);
      window.removeEventListener("load", build);
    };
  }, [containerRef]);

  return (
    <>
      <svg
        ref={svgRef}
        className="spine-svg left-0 hidden lg:block"
        width="160"
        aria-hidden="true"
      >
        <path ref={pathRef} className="spine-path" />
        <path ref={progRef} className="spine-progress" />
      </svg>
      {stations.map((pt, i) => (
        <div
          key={i}
          className="spine-station hidden lg:flex"
          style={{ left: pt.x - 5, top: pt.y - 5 }}
          aria-hidden="true"
        >
          <span className="spine-station-dot" />
        </div>
      ))}
      <div
        ref={vehicleRef}
        className="spine-vehicle hidden lg:block"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <Truck size={22} strokeWidth={2} />
      </div>
    </>
  );
}
