"use client";

import { useEffect, useRef } from "react";
import type { Stat } from "@/lib/data";

interface AnimatedCounterProps {
  stat: Stat;
  index: number;
}

const DURATION = 1600;
const STAGGER = 200;

function formatValue(value: number, stat: Stat): string {
  if (stat.compact) {
    const k = value / 1000;
    const rounded = Math.round(k * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}k`;
  }
  return Math.round(value).toLocaleString("en-IN");
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCounter({ stat, index }: AnimatedCounterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const finalText = `${formatValue(stat.value, stat)}${stat.suffix}`;

  useEffect(() => {
    const el = containerRef.current;
    const display = displayRef.current;
    if (!el || !display) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      display.textContent = finalText;
      startedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            observer.unobserve(entry.target);

            const startDelay = index * STAGGER;
            const startTime = performance.now() + startDelay;

            const tick = (now: number) => {
              if (now < startTime) {
                display.textContent = `0${stat.suffix}`;
                rafRef.current = requestAnimationFrame(tick);
                return;
              }
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / DURATION, 1);
              const eased = easeOutCubic(progress);
              const current = eased * stat.value;
              display.textContent = `${formatValue(current, stat)}${stat.suffix}`;
              if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
              } else {
                display.textContent = finalText;
                rafRef.current = null;
              }
            };
            rafRef.current = requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [stat, index, finalText]);

  return (
    <div ref={containerRef}>
      <span
        ref={displayRef}
        className="stat-counter text-2xl sm:text-3xl font-bold text-teal"
      >
        {finalText}
      </span>
      <div className="text-xs text-ink-dim mt-0.5">{stat.label}</div>
    </div>
  );
}
