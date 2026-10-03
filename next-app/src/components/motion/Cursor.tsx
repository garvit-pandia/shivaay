"use client";

import { useEffect, useRef } from "react";

/**
 * Customs-stamp cursor. The native cursor stays visible (accessibility);
 * this adds a trailing ring that expands over interactive elements and a
 * "CLEARED" rubber stamp that thunks on click. Fine-pointer devices only.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ring = ringRef.current;
    const stamp = stampRef.current;
    if (!ring || !stamp) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let shown = false;
    let raf = 0;
    let hideTimer = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        ring.style.opacity = "1";
      }
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest(
        "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor]"
      );
      ring.classList.toggle("cursor-active", Boolean(interactive));
    };

    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest("a, button, [role='button'], [data-stamp]")) return;
      stamp.style.left = `${e.clientX}px`;
      stamp.style.top = `${e.clientY}px`;
      stamp.classList.remove("stamp-thunk");
      void stamp.offsetWidth;
      stamp.style.opacity = "1";
      stamp.classList.add("stamp-thunk");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        stamp.style.opacity = "0";
      }, 750);
      const main = document.getElementById("main-content");
      if (main) {
        main.classList.remove("cursor-shake");
        void main.offsetWidth;
        main.classList.add("cursor-shake");
      }
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-follow" aria-hidden="true" />
      <div ref={stampRef} className="cursor-stamp-el" aria-hidden="true">
        Cleared
      </div>
    </>
  );
}
