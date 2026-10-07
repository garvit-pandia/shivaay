"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "./gsap";

/**
 * Drops every `.crate-drop` child from above with a bounce (like crates
 * landing), then slams `.crate-stamp` down. Used by the 404 page.
 */
export function CrateDrop({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ delay: 0.25 })
          .from(".crate-drop", {
            yPercent: -260,
            rotation: (i) => [-24, 14, -9][i % 3],
            opacity: 0,
            duration: 1.25,
            ease: "bounce.out",
            stagger: 0.16,
          })
          .from(".crate-stamp", { scale: 3.2, opacity: 0, rotation: -40, duration: 0.45, ease: "power4.in" }, "-=0.2")
          .to(ref.current, { keyframes: { x: [-7, 6, -4, 2, 0] }, duration: 0.35, ease: "none" });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
