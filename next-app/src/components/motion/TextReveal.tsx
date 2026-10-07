"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, MOTION_OK } from "./gsap";
import { entranceDelay } from "./transition-state";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

/**
 * Masked line reveal: lines rise out of clip masks with a stagger when the
 * element scrolls into view. SplitText handles a11y (aria-label on the host,
 * split spans aria-hidden) and re-splits on resize. Server markup is the
 * finished state, so no-JS / reduced motion show plain text.
 */
export function TextReveal({
  as: Tag = "h2",
  children,
  className,
  id,
  delay = 0,
}: {
  as?: Tag;
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.09,
              delay: delay + entranceDelay(),
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref as React.Ref<never>} id={id} className={className}>
      {children}
    </Tag>
  );
}
