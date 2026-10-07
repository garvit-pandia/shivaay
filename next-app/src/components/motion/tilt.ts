"use client";

import { gsap } from "./gsap";

/**
 * 3D pointer tilt for cards (fine pointers only). Call inside a
 * `gsap.matchMedia` callback so it reverts with it; returns a cleanup that
 * removes the listeners. The parent should provide `perspective`.
 */
export function attachTilt(els: HTMLElement[], max = 7): () => void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const offs = els.map((el) => {
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * max * 2);
      rx(-py * max * 2);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  });
  return () => offs.forEach((off) => off());
}
