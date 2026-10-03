"use client";

import { useEffect, useRef } from "react";

/**
 * Split-text headline reveal. Words slide up out of overflow masks with a
 * stagger when scrolled into view. Screen readers get the plain string
 * (visual words are aria-hidden). Static under reduced motion / no-JS.
 */
export function SplitReveal({
  text,
  accent,
  className = "",
}: {
  text: string;
  accent?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("split-in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("split-in");
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <span ref={ref} className={`split-scope ${className}`}>
      <span aria-hidden="true">
        {words.map((w, i) => {
          const bare = w.replace(/[.,!?]/g, "");
          const isAccent = accent === bare;
          return (
            <span key={i} className="split-mask">
              <span
                className={`split-word${isAccent ? " split-accent" : ""}`}
                style={{ transitionDelay: `${i * 55}ms` }}
              >
                {w}
              </span>
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
