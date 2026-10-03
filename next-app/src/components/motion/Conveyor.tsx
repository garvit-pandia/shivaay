"use client";

import { Children, useEffect, useRef } from "react";

/**
 * Infinite draggable conveyor. Auto-scrolls slowly, pauses on hover,
 * supports pointer drag with momentum. Falls back to native horizontal
 * scroll under reduced motion.
 */
export function Conveyor({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      wrap.style.overflowX = "auto";
      return;
    }

    let x = 0;
    let half = 0;
    let raf = 0;
    let dragging = false;
    let hovering = false;
    let startX = 0;
    let startPos = 0;
    let vel = 0;
    let lastX = 0;
    let visible = true;

    const measure = () => {
      half = track.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const step = () => {
      if (visible) {
        if (!dragging && !hovering) x -= 0.55;
        if (!dragging && Math.abs(vel) > 0.1) {
          x += vel;
          vel *= 0.94;
        }
        if (half > 0) {
          if (x <= -half) x += half;
          if (x > 0) x -= half;
        }
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startPos = x;
      lastX = e.clientX;
      vel = 0;
      wrap.classList.add("dragging");
      wrap.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      x = startPos + (e.clientX - startX);
      vel = e.clientX - lastX;
      lastX = e.clientX;
    };
    const endDrag = () => {
      dragging = false;
      wrap.classList.remove("dragging");
    };
    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };

    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", endDrag);
      wrap.removeEventListener("pointercancel", endDrag);
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Rotate the duplicate copy by half the items so the same card never
  // shows twice within one viewport at the wrap seam.
  const items = Children.toArray(children);
  const offset = Math.floor(items.length / 2);
  const rotated = [...items.slice(offset), ...items.slice(0, offset)];

  return (
    <div ref={wrapRef} className="conveyor" role="region" aria-label="Testimonials">
      <div ref={trackRef} className="conveyor-track">
        <div className="flex gap-5 pr-5">{items}</div>
        <div className="flex gap-5 pr-5" aria-hidden="true">
          {rotated}
        </div>
      </div>
    </div>
  );
}
