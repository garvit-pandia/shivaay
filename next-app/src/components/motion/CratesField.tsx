"use client";

import { useEffect, useRef, useState } from "react";

interface CrateState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  settled: boolean;
  delay: number;
}

const COLORS = [
  { bg: "#0F766E", fg: "#FAF8F4" },
  { bg: "#134E4A", fg: "#FAF8F4" },
  { bg: "#EA580C", fg: "#FAF8F4" },
  { bg: "#0D9488", fg: "#FAF8F4" },
];

const COUNT = 10;

/** Deterministic seeded PRNG — identical on server and client (no hydration drift). */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Physics crates — mini containers drop from above and pile up behind
 * the CTA heading. Hand-rolled gravity/bounce, no dependency. Crates are
 * decorative (aria-hidden) and hidden under reduced motion (CSS).
 */
export function CratesField() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const crateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [crates] = useState<CrateState[]>(() => {
    const rand = mulberry32(0x5eed);
    const perCluster = COUNT / 2;
    return Array.from({ length: COUNT }, (_, i) => {
      // Two edge clusters (6–30% and 70–94%) keep the center clear for the CTA
      const cluster = Math.floor(i / perCluster);
      const j = i % perCluster;
      const x =
        (cluster === 0 ? 0.06 : 0.7) +
        (j / (perCluster - 1)) * 0.22 +
        rand() * 0.02;
      return {
        x,
        y: 0,
        vx: 0,
        vy: 0,
        rot: rand() * 30 - 15,
        vr: 0,
        size: 34 + rand() * 26,
        settled: false,
        delay: i * 130 + rand() * 200,
      };
    });
  });

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let W = 0;
    let H = 0;
    let raf = 0;
    let started = false;
    let startTime = 0;
    const states = crates.map((c) => ({ ...c }));

    const measure = () => {
      W = field.clientWidth;
      H = field.clientHeight;
      states.forEach((c, i) => {
        c.x = crates[i].x * W;
        c.y = -80 - Math.random() * 300;
      });
    };
    measure();

    const step = (t: number) => {
      if (!startTime) startTime = t;
      const elapsed = t - startTime;
      let allSettled = true;
      states.forEach((c, i) => {
        if (elapsed < c.delay) {
          allSettled = false;
          return;
        }
        const el = crateRefs.current[i];
        if (!c.settled) {
          allSettled = false;
          c.vy += 0.45;
          c.y += c.vy;
          c.x += c.vx;
          c.rot += c.vr;
          const floor = H - c.size / 2 - 6 - (i % 3) * (c.size * 0.55);
          if (c.y >= floor) {
            c.y = floor;
            if (Math.abs(c.vy) > 1.6) {
              c.vy *= -0.38;
              c.vr = (Math.random() - 0.5) * 4;
              c.vx = (Math.random() - 0.5) * 1.5;
            } else {
              c.settled = true;
              c.vy = 0;
              c.vr = 0;
              c.vx = 0;
              // settle to a near-flat angle
              c.rot = Math.round(c.rot / 90) * 90 + (Math.random() * 8 - 4);
            }
          }
        }
        if (el) {
          el.style.transform = `translate(${c.x - c.size / 2}px, ${c.y - c.size / 2}px) rotate(${c.rot}deg)`;
        }
      });
      if (!allSettled) {
        raf = requestAnimationFrame(step);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          measure();
          raf = requestAnimationFrame(step);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(field);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [crates]);

  return (
    <div ref={fieldRef} className="crates-field" aria-hidden="true">
      {crates.map((c, i) => {
        const color = COLORS[i % COLORS.length];
        return (
          <div
            key={i}
            ref={(el) => {
              crateRefs.current[i] = el;
            }}
            className="crate corrugated"
            style={{
              width: c.size,
              height: c.size,
              backgroundColor: color.bg,
              color: color.fg,
              transform: `translate(-100px, -200px)`,
            }}
          >
            <span
              className="absolute left-1 top-0.5"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "8px",
                lineHeight: 1.2,
                letterSpacing: "0.08em",
                opacity: 0.7,
              }}
            >
              SHV
            </span>
          </div>
        );
      })}
    </div>
  );
}
