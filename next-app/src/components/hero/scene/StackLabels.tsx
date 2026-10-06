"use client";

import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { smoothstep } from "@/lib/hero-ease";
import { createYard } from "@/lib/yard";

export interface StackLabelsProps {
  tier: "full" | "lite";
  progress: React.RefObject<number>;
}

/**
 * Floating waybills above the container stacks (drei `<Html>`): up to 6 mono
 * labels on the yard's east half, clear of the copy block. Opacity is
 * driven by the shared progress ref — they fade in over the settled third of
 * the dive (smoothstep 0.62 → 0.95) and never intercept pointer events. Lite
 * tier renders none at all.
 */
export function StackLabels({ tier, progress }: StackLabelsProps) {
  const { labels } = useMemo(
    () => createYard(116, tier === "lite" ? "lite" : "full"),
    [tier]
  );

  // Calm-left: keep labels on the yard's east half (world x > 8) so chips
  // never float over the copy block. Cap at 6 to cut text noise.
  const visible = useMemo(
    () => labels.filter((l) => l.x > 8).slice(0, 6),
    [labels]
  );
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  // Stagger each label's appearance across the settle so chips don't
  // blink on at once — reads as a waybill system updating rather than a pop.
  const stagger = useMemo(
    () => visible.map((_, i) => 0.62 + (i / Math.max(visible.length, 1)) * 0.24),
    [visible]
  );
  // Mount the Html roots one commit after the initial pass: React's dev
  // StrictMode remount would otherwise unmount drei's per-label roots inside
  // the commit and log a race-condition warning.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (tier === "lite") return;
    let raf = 0;
    const tick = () => {
      const p = progress.current ?? 1;
      for (let i = 0; i < visible.length; i++) {
        const el = refs.current[i];
        if (el) el.style.opacity = String(smoothstep(stagger[i], stagger[i] + 0.12, p));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, stagger, tier, visible.length]);

  if (tier === "lite" || !ready) return null;

  return (
    <>
      {visible.map((l, i) => (
        <Html
          key={l.id}
          position={[l.x, l.y, l.z]}
          center
          distanceFactor={90}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="hero-stack-label"
            style={{ opacity: 0 }}
          >
            {l.text}
          </div>
        </Html>
      ))}
    </>
  );
}
