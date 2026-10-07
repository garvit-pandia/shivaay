"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { onLenis } from "./SmoothScroll";

/**
 * Single GSAP entry point. Import from here (never from "gsap" directly) so
 * plugins are registered once and ScrollTrigger follows Lenis' smoothed
 * scroll position. Only client components on routes that animate import it,
 * keeping GSAP out of every other route's bundle.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
  let off: (() => void) | null = null;
  onLenis((lenis) => {
    off?.();
    off = lenis ? lenis.on("scroll", ScrollTrigger.update) : null;
  });
  // ScrollTrigger only re-measures on load/resize. A late layout shift above
  // a pinned section would leave its start/end stale (the pin then stops
  // short), so re-measure whenever the document height actually changes.
  let lastH = 0;
  const remeasure = gsap.delayedCall(0.2, () => ScrollTrigger.refresh()).pause();
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastH) > 1) {
      lastH = h;
      remeasure.restart(true);
    }
  }).observe(document.body);
}

/** Media query under which every scroll effect runs. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
