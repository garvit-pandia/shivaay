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
const HONKS = ["beep!", "beep beep!", "honk!"];
const PUFFS = 10;
// Truck nose (the point that parks on the pointer), in px inside .truck-body.
const NOSE_X = 49;
const WHEEL_R = 4;
// Over clickables the truck pulls over below the pointer so labels stay readable.
const PULL_OVER = 16;
const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor], [data-scan]";
// Where the native cursor comes back: text entry and embedded maps.
const NATIVE =
  "input:not([type='checkbox'], [type='radio'], [type='submit'], [type='button'], [type='range']), textarea, [contenteditable='true'], iframe";

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

/** Side-on toy truck facing right: teal container, orange cab, spinning wheels. */
function TruckArt() {
  return (
    <svg viewBox="0 0 40 24" width="50" height="30" aria-hidden="true">
      {/* container */}
      <rect x="1" y="3" width="24" height="14" rx="1.6" fill="#0F766E" />
      <path d="M5 4.5v11M9 4.5v11M13 4.5v11M17 4.5v11M21 4.5v11" stroke="#134E4A" strokeWidth="1" />
      <rect x="1" y="12.4" width="24" height="1.6" fill="#EA580C" />
      {/* cab */}
      <path d="M26 17V8.6C26 7.7 26.7 7 27.6 7h5.2c.6 0 1.1.3 1.4.8l3.2 5V17Z" fill="#EA580C" />
      <path d="M28 8.6h4.5l2.4 3.9H28Z" fill="#DFF3F1" />
      <circle className="truck-eye" cx="31.6" cy="10.6" r="0.95" fill="#1E1B18" />
      <circle cx="33.6" cy="14.4" r="1.1" fill="#F9A8A0" opacity="0.8" />
      <rect className="truck-hazard" x="36.4" y="12.6" width="1.8" height="1.8" rx="0.5" />
      <rect className="truck-hazard" x="0" y="13.2" width="1.6" height="2.4" rx="0.5" />
      {/* chassis + wheels */}
      <rect x="1" y="16.6" width="37.6" height="2" rx="1" fill="#1E1B18" />
      {[7, 14, 32].map((cx) => (
        <g key={cx} className="truck-wheel">
          <circle cx={cx} cy="19.6" r="3.2" fill="#1E1B18" />
          <circle cx={cx} cy="19.6" r="1.3" fill="#E7E1D6" />
          <path d={`M${cx} 16.9v1.4`} stroke="#E7E1D6" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Toy-truck cursor. The native arrow is hidden and a little truck chases a
 * precise hotspot dot: it turns to face where it's heading, tilts on climbs,
 * spins its wheels and puffs exhaust on fast moves, flashes its hazards over
 * anything clickable and honks on click. The scanner box, waybill tag and
 * customs stamps still work as before. Fine pointers only; the native cursor
 * comes back over text fields and iframes, and everything is off under
 * reduced motion.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<HTMLDivElement>(null);
  const beepRef = useRef<HTMLDivElement>(null);
  const puffsRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const tagIdRef = useRef<HTMLSpanElement>(null);
  const tagLabelRef = useRef<HTMLSpanElement>(null);
  const tagRouteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = dotRef.current;
    const truck = truckRef.current;
    const body = bodyRef.current;
    const hop = hopRef.current;
    const beep = beepRef.current;
    const puffs = puffsRef.current ? Array.from(puffsRef.current.children) as HTMLElement[] : [];
    const stamp = stampRef.current;
    const scan = scanRef.current;
    const tag = tagRef.current;
    const tagId = tagIdRef.current;
    const tagLabel = tagLabelRef.current;
    const tagRoute = tagRouteRef.current;
    if (!dot || !truck || !body || !hop || !beep || !stamp || !scan || !tag || !tagId || !tagLabel || !tagRoute) return;
    const wheels = Array.from(truck.querySelectorAll<SVGGElement>(".truck-wheel"));
    const root = document.documentElement;
    root.classList.add("truck-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let dir = 1; // 1 = facing right, -1 = facing left
    let face = 1; // eased toward dir; passing through 0 reads as a turn
    let tilt = 0;
    let roll = 0;
    let pull = 0;
    let hazard = false;
    let shown = false;
    let overInteractive = false;
    let lastPuff = 0;
    let puffIdx = 0;
    let honkIdx = 0;
    let raf = 0;
    let hideTimer = 0;
    let beepTimer = 0;

    const setVisible = (on: boolean) => {
      dot.classList.toggle("is-on", on);
      truck.classList.toggle("is-on", on);
    };
    const setHazard = () => {
      hazard = overInteractive || Boolean(getCursorState().threeD);
      truck.classList.toggle("is-hazard", hazard);
      dot.classList.toggle("is-hazard", hazard);
    };

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
      setHazard();
    };

    const unsub = subscribeCursor(renderWaybill);

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
      }
      const t = e.target as HTMLElement | null;
      setVisible(!t?.closest(NATIVE));
      const scanTarget = t?.closest("[data-scan]") ?? null;
      const wbTarget = scanTarget ?? t?.closest("[data-waybill]") ?? null;
      const rect = scanTarget?.getBoundingClientRect();
      overInteractive = Boolean(t?.closest(INTERACTIVE));
      setDomWaybill(
        parseWaybill(wbTarget),
        rect ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height } : null
      );
    };

    const honk = () => {
      beep.textContent = HONKS[honkIdx++ % HONKS.length];
      beep.style.left = `${rx - dir * 22}px`;
      beep.style.top = `${ry - 28}px`;
      beep.classList.remove("is-pop");
      hop.classList.remove("is-honk");
      void beep.offsetWidth;
      beep.classList.add("is-pop");
      hop.classList.add("is-honk");
      window.clearTimeout(beepTimer);
      beepTimer = window.setTimeout(() => {
        beep.classList.remove("is-pop");
        hop.classList.remove("is-honk");
      }, 700);
    };

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const t = e.target as HTMLElement | null;
      if (!t?.closest(NATIVE)) honk();
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
      setVisible(false);
      overInteractive = false;
      setDomWaybill(null);
    };

    const exhaust = (now: number) => {
      const p = puffs[puffIdx++ % puffs.length];
      if (!p) return;
      lastPuff = now;
      p.style.left = `${rx - dir * (NOSE_X + 1)}px`;
      p.style.top = `${ry + 1}px`;
      p.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.35)", opacity: 0.75 },
          { transform: `translate(calc(-50% + ${-dir * 16}px), calc(-50% - 10px)) scale(1.5)`, opacity: 0 },
        ],
        { duration: 650, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
      );
    };

    const loop = (now: number) => {
      const px = rx;
      const py = ry;
      pull += ((hazard ? PULL_OVER : 0) - pull) * 0.2;
      rx += (x - rx) * 0.2;
      ry += (y + pull - ry) * 0.2;
      const vx = rx - px;
      const vy = ry - py;
      const speed = Math.hypot(vx, vy);
      // Hysteresis so tiny wobbles don't flip the truck back and forth.
      if (vx > 1.2) dir = 1;
      else if (vx < -1.2) dir = -1;
      face += (dir - face) * 0.22;
      tilt += (Math.max(-26, Math.min(26, vy * 2.4)) - tilt) * 0.2;
      roll += speed / WHEEL_R;
      const f = Math.abs(face) < 0.08 ? Math.sign(face || 1) * 0.08 : face;

      dot.style.transform = `translate(${x}px, ${y}px)`;
      truck.style.transform = `translate(${rx}px, ${ry}px)`;
      body.style.transform = `scaleX(${f}) rotate(${tilt}deg)`;
      const deg = `rotate(${(roll * 180) / Math.PI}deg)`;
      wheels.forEach((w) => (w.style.transform = deg));
      tag.style.transform = `translate(${x + 18}px, ${y + 22}px)`;
      if (shown && speed > 9 && now - lastPuff > 70) exhaust(now);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      unsub();
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.clearTimeout(beepTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      root.removeEventListener("mouseleave", onLeave);
      root.classList.remove("truck-cursor");
    };
  }, []);

  return (
    <>
      <div ref={scanRef} className="cursor-scanbox" aria-hidden="true" />
      <div ref={puffsRef} aria-hidden="true">
        {Array.from({ length: PUFFS }, (_, i) => (
          <span key={i} className="cursor-puff" />
        ))}
      </div>
      <div ref={truckRef} className="cursor-truck" aria-hidden="true">
        <div ref={bodyRef} className="truck-body">
          <div ref={hopRef} className="truck-hop">
            <TruckArt />
          </div>
        </div>
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={beepRef} className="cursor-beep" aria-hidden="true" />
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
