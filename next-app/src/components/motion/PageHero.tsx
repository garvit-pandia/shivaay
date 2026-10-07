"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "./gsap";
import { TextReveal } from "./TextReveal";
import { entranceDelay } from "./transition-state";

/**
 * Shared inner-page header: kicker, masked-line h1, intro, an optional aside,
 * a giant outlined ghost word that drifts with scroll, and a route line that
 * draws along the bottom edge with a marker riding it on arrival.
 */
export function PageHero({
  kicker,
  title,
  description,
  ghost,
  aside,
  id,
}: {
  kicker: string;
  title: string;
  description?: React.ReactNode;
  ghost: string;
  aside?: React.ReactNode;
  id?: string;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: "expo.out" }, delay: entranceDelay() })
          .from(".ph-kicker", { y: 16, opacity: 0, duration: 0.8 }, 0.1)
          .from(".ph-desc, .ph-aside", { y: 24, opacity: 0, duration: 1, stagger: 0.12 }, 0.45)
          .fromTo(".ph-route-fill", { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: "power2.inOut" }, 0.3)
          .fromTo(".ph-route-marker", { left: "0%", opacity: 1 }, { left: "100%", duration: 2.2, ease: "power2.inOut" }, 0.3)
          .to(".ph-route-marker", { opacity: 0, duration: 0.3 }, 2.4);
        gsap.fromTo(
          ".ph-ghost",
          { xPercent: 0 },
          {
            xPercent: -18,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.5 },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="page-hero relative bg-cream overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
      <span className="ph-ghost" aria-hidden="true">
        {ghost}
      </span>
      <div className="relative mx-auto max-w-[1280px] px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="ph-kicker mono-label text-[11px] text-teal mb-5 flex items-center gap-2.5">
            <span className="ticker-dot" aria-hidden="true" />
            {kicker}
          </p>
          <TextReveal
            as="h1"
            id={id}
            className="font-serif text-5xl sm:text-6xl lg:text-[5.25rem] font-normal text-ink leading-[1.02] tracking-tight"
          >
            {title}
          </TextReveal>
          {description && (
            <p className="ph-desc text-base lg:text-lg text-ink-dim leading-relaxed max-w-2xl mt-6">
              {description}
            </p>
          )}
        </div>
        {aside && <div className="ph-aside">{aside}</div>}
      </div>
      <div className="ph-route" aria-hidden="true">
        <span className="ph-route-fill" />
        <span className="ph-route-marker" />
      </div>
    </section>
  );
}
