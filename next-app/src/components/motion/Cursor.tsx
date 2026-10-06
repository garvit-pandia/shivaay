"use client";

import { useEffect, useRef } from "react";
import {
  activeWaybill,
  getCursorState,
  setDomWaybill,
  subscribeCursor,
  type Waybill,
} from "@/lib/cursor-store";

const STAMP_TEXT: Record<string, string> = {
  cleared: "Cleared",
  scanned: "Scanned",
  signed: "Signed",
  stacked: "Stacked",
};

function parseWaybill(el: Element | null): Waybill | null {
  const raw = el?.getAttribute("data-waybill");
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<Waybill>;
    return typeof o.label === "string" ? { id: o.id ?? "", label: o.label, route: o.route, eta: o.eta } : null;
  } catch {
    return null;
  }
}

/**
 * Customs-stamp cursor: trailing ring, scanner sweep + waybill tag over
 * [data-scan] targets, contextual stamps on click. Fine pointers only,
 * native cursor stays visible, everything off under reduced motion.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const tagIdRef = useRef<HTMLSpanElement>(null);
  const tagLabelRef = useRef<HTMLSpanElement>(null);
  const tagRouteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ring = ringRef.current;
    const stamp = stampRef.current;
    const scan = scanRef.current;
    const tag = tagRef.current;
    const tagId = tagIdRef.current;
    const tagLabel = tagLabelRef.current;
    const tagRoute = tagRouteRef.current;
    if (!ring || !stamp || !scan || !tag || !tagId || !tagLabel || !tagRoute) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let shown = false;
    let raf = 0;
    let hideTimer = 0;

    const renderWaybill = () => {
      // Tag and scanner box are independent: [data-scan] without [data-waybill]
      // (nav links, gallery items) still gets the sweep highlight.
      const w = activeWaybill();
      if (!w) {
        tag.classList.remove("is-on");
      } else {
        tagId.textContent = w.id;
        tagLabel.textContent = w.label;
        tagRoute.textContent = [w.route, w.eta].filter(Boolean).join(" · ");
        tagRoute.style.display = w.route || w.eta ? "block" : "none";
        tag.classList.add("is-on");
      }
      const r = getCursorState().scanRect;
      if (r) {
        scan.style.left = `${r.x - 3}px`;
        scan.style.top = `${r.y - 3}px`;
        scan.style.width = `${r.w + 6}px`;
        scan.style.height = `${r.h + 6}px`;
        scan.classList.add("is-on");
      } else {
        scan.classList.remove("is-on");
      }
    };

    const unsub = subscribeCursor(renderWaybill);

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        ring.style.opacity = "1";
      }
      const t = e.target as HTMLElement | null;
      const scanTarget = t?.closest("[data-scan]") ?? null;
      const wbTarget = scanTarget ?? t?.closest("[data-waybill]") ?? null;
      const rect = scanTarget?.getBoundingClientRect();
      setDomWaybill(
        parseWaybill(wbTarget),
        rect ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height } : null
      );
      const interactive = t?.closest(
        "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor], [data-scan]"
      );
      ring.classList.toggle("cursor-active", Boolean(interactive));
    };

    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const stampTarget = t?.closest("[data-stamp]") as HTMLElement | null;
      if (!stampTarget) return;
      const variant = stampTarget.getAttribute("data-stamp") || "cleared";
      stamp.textContent = STAMP_TEXT[variant] ?? STAMP_TEXT.cleared;
      stamp.dataset.variant = variant in STAMP_TEXT ? variant : "cleared";
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

    const onLeave = () => {
      setDomWaybill(null);
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      tag.style.transform = `translate(${rx + 20}px, ${ry + 24}px)`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      unsub();
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-follow" aria-hidden="true" />
      <div ref={scanRef} className="cursor-scanbox" aria-hidden="true" />
      <div ref={tagRef} className="cursor-waybill" aria-hidden="true">
        <span ref={tagIdRef} className="wb-id" />
        <span ref={tagLabelRef} className="wb-label" />
        <span ref={tagRouteRef} className="wb-route" />
      </div>
      <div ref={stampRef} className="cursor-stamp-el" aria-hidden="true">
        Cleared
      </div>
    </>
  );
}
