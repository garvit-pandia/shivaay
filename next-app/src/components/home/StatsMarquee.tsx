"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/components/motion/gsap";

/**
 * Stats marquee band — infinite ticker of proof points. With motion allowed,
 * GSAP takes over from the CSS loop: scroll velocity speeds it up, scrolling
 * up reverses it, and fast scrolls skew the type.
 */
const items = [
  "15+ years",
  "800+ happy clients",
  "5 major ports",
  "Zero detention, most of the time",
  "Quote in 24 hours",
  "Pan-India coverage",
];

const BASE_SPEED = 60; // px per second

export function StatsMarquee() {
  const stripRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      strip.classList.add("is-driven");
      let x = 0;
      let dir = -1;
      let boost = 0;
      const setX = gsap.quickSetter(strip, "x", "px");
      const skew = gsap.quickTo(strip, "skewX", { duration: 0.5, ease: "power3" });

      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          dir = self.direction === 1 ? -1 : 1;
          boost = Math.min(Math.abs(v) / 4, 900);
          skew(gsap.utils.clamp(-8, 8, v / -250));
        },
      });
      const tick = (_t: number, dtMs: number) => {
        const half = strip.scrollWidth / 2;
        if (half === 0) return;
        boost *= 0.92;
        x += dir * (BASE_SPEED + boost) * (dtMs / 1000);
        x = gsap.utils.wrap(-half, 0, x);
        setX(x);
        if (boost < 1) skew(0);
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        st.kill();
        strip.classList.remove("is-driven");
      };
    });
    return () => mm.revert();
  });

  const row = (hidden: boolean) => (
    <div className="flex items-center shrink-0" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <span key={t} className="flex items-center shrink-0">
          <span className="font-serif italic text-xl lg:text-2xl text-cream px-8">{t}</span>
          <span className="text-orange text-xs" aria-hidden="true">
            ●
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="py-5 overflow-hidden"
      style={{ backgroundColor: "#134E4A" }}
      role="region"
      aria-label="Shivaay Logistics at a glance"
    >
      <div ref={stripRef} className="marquee-strip">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
