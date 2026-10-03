"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Odometer-style rolling digits. Counts to `value` when scrolled into view.
 * Non-digit characters (e.g. "+") render as-is.
 */
export function Odometer({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setActive(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`odo ${className}`} aria-label={value}>
      {value.split("").map((c, i) =>
        /\d/.test(c) ? (
          <span key={i} className="odo-col" aria-hidden="true">
            <span
              className="odo-col-inner"
              style={{
                transform: active ? `translateY(-${Number(c)}em)` : "translateY(0)",
                transitionDelay: `${i * 90}ms`,
              }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden="true">
            {c}
          </span>
        )
      )}
    </span>
  );
}
