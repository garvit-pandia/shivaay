"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "./gsap";
import { attachTilt } from "./tilt";

/** Adds pointer tilt to every `[data-tilt]` descendant (fine pointers only). */
export function TiltGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const els = gsap.utils.toArray<HTMLElement>("[data-tilt]", ref.current);
        gsap.set(els, { transformPerspective: 900 });
        return attachTilt(els, 5);
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
