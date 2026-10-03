"use client";

import { useEffect, useRef } from "react";

/**
 * Magnetic wrapper — gently pulls its child toward the cursor (max 7px),
 * springs back on leave. Fine-pointer devices only, no-JS = static.
 */
export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const STRENGTH = 7;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const render = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const range = Math.max(r.width, r.height) * 1.2;
      if (dist < range) {
        tx = (dx / range) * STRENGTH * 2;
        ty = (dy / range) * STRENGTH * 2;
      } else {
        tx = 0;
        ty = 0;
      }
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="magnetic inline-block will-change-transform">
      {children}
    </div>
  );
}
