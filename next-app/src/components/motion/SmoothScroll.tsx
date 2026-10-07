"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let instance: Lenis | null = null;
const listeners = new Set<(lenis: Lenis | null) => void>();

/** Current Lenis instance (null under reduced motion or before mount). */
export function getLenis(): Lenis | null {
  return instance;
}

/** Called with the instance now (if any) and whenever it is created/destroyed. */
export function onLenis(cb: (lenis: Lenis | null) => void): () => void {
  listeners.add(cb);
  if (instance) cb(instance);
  return () => {
    listeners.delete(cb);
  };
}

function publish(next: Lenis | null) {
  instance = next;
  listeners.forEach((cb) => cb(next));
}

/**
 * Site-wide inertial wheel scrolling. Lenis drives `window.scrollTo`, so
 * native scroll listeners keep working; touch scrolling stays native.
 * Skipped entirely under reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -80 },
      lerp: 0.11,
      wheelMultiplier: 0.9,
    });
    publish(lenis);
    return () => {
      lenis.destroy();
      publish(null);
    };
  }, []);

  return null;
}
