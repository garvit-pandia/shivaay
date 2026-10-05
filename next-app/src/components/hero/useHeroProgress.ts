"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp01, easeInOutCubic } from "@/lib/hero-poses";

export type HeroPhase = "dive" | "scrub" | "settled";

interface Options {
  trackRef: React.RefObject<HTMLDivElement | null>;
  desktop: boolean;
  reduced: boolean;
}

export interface SlHeroHook {
  getState: () => { phase: HeroPhase; progress: number; desktop: boolean; reduced: boolean };
  setProgress: (p: number, instant?: boolean) => void;
  skip: () => void;
  getAgentScreenPosition: (id: string) => { x: number; y: number } | null;
}

/**
 * One progress value, three drivers: auto-dive (time), scroll scrub (desktop,
 * forward-only), skip. Revisits start at 0.72 and settle in ~1 s. Reduced
 * motion jumps straight to the settled pose.
 */
export function useHeroProgress({ trackRef, desktop, reduced }: Options) {
  const progress = useRef(reduced ? 1 : 0);
  const target = useRef(reduced ? 1 : 0);
  const phaseRef = useRef<HeroPhase>(reduced ? "settled" : "dive");
  const [phase, setPhase] = useState<HeroPhase>(reduced ? "settled" : "dive");
  const modeRef = useRef<"auto" | "user" | "done">("auto");
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const startedRef = useRef(false);
  const startedAtRef = useRef(0);
  const diveMsRef = useRef(3000);
  const baseRef = useRef(0);

  const setPhaseSafe = useCallback((p: HeroPhase) => {
    if (phaseRef.current !== p) {
      phaseRef.current = p;
      setPhase(p);
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (reduced) {
      // No setState in an effect (react-hooks/set-state-in-effect): the phase
      // already reads settled via the initial state / derived return below.
      progress.current = 1;
      target.current = 1;
      phaseRef.current = "settled";
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem("sl-seen") === "1";
    } catch {
      seen = false;
    }
    const quick = seen || document.documentElement.classList.contains("preloaded");
    baseRef.current = quick ? 0.72 : 0;
    diveMsRef.current = quick ? 1000 : 3000;
    progress.current = baseRef.current;
    target.current = baseRef.current;

    let started = false;
    let preloaderTimer = 0;

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;

      if (modeRef.current === "auto" && startedRef.current) {
        const t = clamp01((now - startedAtRef.current) / diveMsRef.current);
        target.current = baseRef.current + (1 - baseRef.current) * easeInOutCubic(t);
      }
      progress.current += (target.current - progress.current) * (1 - Math.exp(-6 * dt));

      const settledNow = Math.abs(target.current - progress.current) < 0.002;
      if (settledNow) {
        progress.current = target.current;
        if (progress.current >= 1) {
          progress.current = 1;
          modeRef.current = "done";
          setPhaseSafe("settled");
        }
        // Converged (settled or mid-scrub): idle until the next scroll/skip.
        cancelAnimationFrame(rafRef.current);
      }
      const prev = Number.parseFloat(track.dataset.progress ?? "");
      if (settledNow || !Number.isFinite(prev) || Math.abs(prev - progress.current) > 0.004) {
        track.dataset.progress = progress.current.toFixed(3);
      }
    };

    const ensureLoop = () => {
      cancelAnimationFrame(rafRef.current);
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(loop);
    };

    const start = () => {
      if (started || modeRef.current === "user") return; // never override a scrub/skip
      started = true;
      startedRef.current = true;
      startedAtRef.current = performance.now();
      modeRef.current = "auto";
      setPhaseSafe("dive");
      ensureLoop();
    };

    const onPreloaderDone = () => start();
    if (quick) {
      start();
    } else {
      window.addEventListener("sl:preloader-done", onPreloaderDone, { once: true });
      preloaderTimer = window.setTimeout(start, 3200); // backstop if event never fires
    }

    const onScroll = () => {
      if (!desktop) return;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      if (span <= 0) return;
      const p = clamp01(-rect.top / span);
      if (p <= 0.01) return;
      modeRef.current = "user";
      startedRef.current = false;
      target.current = Math.max(target.current, p);
      setPhaseSafe(target.current >= 1 ? "settled" : "scrub");
      ensureLoop();
    };
    if (desktop) window.addEventListener("scroll", onScroll, { passive: true });

    const skip = () => {
      modeRef.current = "user";
      startedRef.current = false;
      target.current = 1;
      setPhaseSafe("scrub");
      ensureLoop();
    };

    const hook: SlHeroHook = {
      getState: () => ({
        phase: phaseRef.current,
        progress: progress.current,
        desktop,
        reduced,
      }),
      setProgress: (p, instant = false) => {
        const v = clamp01(p);
        modeRef.current = "user";
        startedRef.current = false;
        target.current = v;
        if (instant) progress.current = v;
        setPhaseSafe(v >= 1 && instant ? "settled" : "scrub");
        if (v >= 1 && instant) cancelAnimationFrame(rafRef.current);
        else ensureLoop();
      },
      skip,
      getAgentScreenPosition: () => null,
    };
    (window as unknown as { __slHero?: SlHeroHook }).__slHero = hook;

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(preloaderTimer);
      window.removeEventListener("sl:preloader-done", onPreloaderDone);
      if (desktop) window.removeEventListener("scroll", onScroll);
      delete (window as unknown as { __slHero?: SlHeroHook }).__slHero;
    };
  }, [desktop, reduced, setPhaseSafe, trackRef]);

  return {
    // Derived settled for reduced motion: during hydration the client snapshot
    // is still false, so the React state cannot adopt it without setState in
    // an effect (see the reduced branch above).
    phase: reduced ? ("settled" as const) : phase,
    progress,
    skip: () => {
      // Stable public skip: flip to settled target via the hook registered in the effect.
      const hook = (window as unknown as { __slHero?: SlHeroHook }).__slHero;
      hook?.skip();
    },
  };
}
