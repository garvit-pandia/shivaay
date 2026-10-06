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
 * Floating waybills above the container stacks (drei `<Html>`): up to 8 mono
 * labels from the same seeded yard plan the instanced stacks use. Opacity is
 * driven by the shared progress ref — they fade in over the settled third of
 * the dive (smoothstep 0.62 → 0.95) and never intercept pointer events. Lite
 * tier renders none at all.
 */
export function StackLabels({ tier, progress }: StackLabelsProps) {
  const refs = useRef<(HTMLDivElement | null)[]>(
    Array.from({ length: 8 }, () => null)
  );
  const { labels } = useMemo(
    () => createYard(116, tier === "lite" ? "lite" : "full"),
    [tier]
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
      const o = smoothstep(0.62, 0.95, progress.current ?? 1);
      for (const el of refs.current) {
        if (el) el.style.opacity = String(o);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, tier]);

  if (tier === "lite" || !ready) return null;

  return (
    <>
      {labels.slice(0, 8).map((l, i) => (
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
