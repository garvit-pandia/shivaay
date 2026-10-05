"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { YardFallback } from "./fallback/YardFallback";
import { useHeroProgress } from "./useHeroProgress";

const HeroStage = dynamic(
  () => import("./scene/HeroStage").then((m) => m.HeroStage),
  { ssr: false }
);

let webglCache: boolean | null = null;

function probeWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

// Browser-only capabilities, read without hydration mismatch: the server
// snapshot keeps the SVG fallback on first render, then React swaps in the
// real values. (setState-in-effect is disallowed by react-hooks.)
const subscribeNil = () => () => {};
const getServerWebgl = () => null;
const subscribeTier = (cb: () => void) => {
  const mq = window.matchMedia("(max-width: 1023px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getTier = (): "full" | "lite" =>
  window.matchMedia("(max-width: 1023px)").matches ? "lite" : "full";
const getServerTier = (): "full" | "lite" => "full";

const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getDesktop = (): boolean => window.matchMedia("(min-width: 1024px)").matches;
const getServerDesktop = (): boolean => true;

const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduced = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReduced = (): boolean => false;

/**
 * Client boundary for the hero. Renders the sticky track, the lazy 3D stage,
 * the SVG fallback contract, and hosts the server-rendered copy as children.
 */
export function HeroStageMount({ children }: { children: React.ReactNode }) {
  const webgl = useSyncExternalStore(subscribeNil, probeWebGL, getServerWebgl);
  const tier = useSyncExternalStore(subscribeTier, getTier, getServerTier);
  const desktop = useSyncExternalStore(subscribeDesktop, getDesktop, getServerDesktop);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getServerReduced);
  const [contextLost, setContextLost] = useState(false);
  const [active, setActive] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const { phase, progress, skip } = useHeroProgress({ trackRef, desktop, reduced });

  // Pause the render loop when the hero is offscreen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="hero-track" ref={trackRef} data-phase={phase}>
      <div className="hero-sticky">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="hero-canvas-wrap" aria-hidden="true">
          {webgl === true && !contextLost && (
            <HeroStage
              tier={tier}
              progress={progress}
              active={active}
              onContextLost={() => setContextLost(true)}
            />
          )}
          {webgl !== true || contextLost ? <YardFallback /> : null}
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-r from-cream via-cream/75 to-transparent lg:via-cream/30"
          aria-hidden="true"
        />
        <div className="hero-copy relative z-10">{children}</div>
        {phase !== "settled" && !reduced && (
          <button type="button" className="hero-skip mono-label" onClick={skip}>
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
