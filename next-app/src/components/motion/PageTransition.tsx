"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "./gsap";
import { markCovered, markUncovered } from "./transition-state";

/** Route → [waybill code, display name] for the routing label. */
const ROUTES: Record<string, [string, string]> = {
  "/": ["HOM", "Home"],
  "/services": ["SVC", "Services"],
  "/contact": ["CTC", "Contact"],
  "/resources": ["RES", "Resources"],
  "/resources/links": ["LNK", "Quick Links"],
  "/resources/documents": ["DOC", "Documents"],
  "/resources/files": ["DWN", "Downloads"],
  "/resources/ports": ["PRT", "Ports / ICDs"],
};
const routeInfo = (path: string): [string, string] => {
  const clean = path.split(/[?#]/)[0].replace(/\.html$/, "").replace(/\/$/, "") || "/";
  return ROUTES[clean] ?? ["SHV", "Shivaay"];
};

const COLS = ["#0F766E", "#134E4A", "#0D9488", "#0F766E", "#EA580C", "#134E4A"];
const COVER_S = 0.55;
const UNCOVER_S = 0.65;

/** Crane the container wall away, then hide the curtain. */
function uncover(root: HTMLDivElement | null) {
  if (!root) return;
  const cols = root.querySelectorAll(".pt-col");
  const anims = root.querySelectorAll(".pt-anim");
  const label = root.querySelector(".pt-label");
  requestAnimationFrame(() => {
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
          markUncovered();
        },
      })
      .to(anims, { y: -14, opacity: 0, duration: 0.25, stagger: 0.03, ease: "power2.in" })
      // The label card (dashed frame + tint) leaves with its text, not with the last column.
      .to(label, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0.08)
      .to(cols, { yPercent: -101, duration: UNCOVER_S, ease: "power3.inOut", stagger: { each: 0.05, from: "end" } }, 0.1);
  });
}

/**
 * "Routing" page transition. Internal link clicks stack a wall of shipping
 * containers over the screen while a waybill label prints the route
 * (HOM → SVC) and the destination; once the new route has rendered, the
 * containers are craned away to reveal it. Waits for the real navigation
 * (with a safety timeout) rather than a fixed delay. Off for reduced motion.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);
  const [route, setRoute] = useState<{ from: [string, string]; to: [string, string] }>({
    from: routeInfo("/"),
    to: routeInfo("/"),
  });

  // Intercept internal navigations.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(https?:|mailto:|tel:|whatsapp:)/i.test(href)) return;
      const target = href.split("#")[0];
      if (target === pathname || target === "" || pendingRef.current) return;

      const root = rootRef.current;
      if (!root) return;
      e.preventDefault();
      pendingRef.current = true;
      setRoute({ from: routeInfo(pathname), to: routeInfo(target) });

      const cols = root.querySelectorAll(".pt-col");
      const anims = root.querySelectorAll(".pt-anim");
      const label = root.querySelector(".pt-label");
      gsap.killTweensOf([cols, anims, label]);
      gsap
        .timeline({
          onComplete: () => {
            // Entrances on the incoming page wait for the lift.
            markCovered(UNCOVER_S * 1000 * 0.6);
            router.push(href);
          },
        })
        .set(root, { autoAlpha: 1, pointerEvents: "auto" })
        .fromTo(cols, { yPercent: 101 }, { yPercent: 0, duration: COVER_S, ease: "power3.inOut", stagger: 0.05 })
        // Opacity only: .pt-label is centred with a CSS transform GSAP must not touch.
        .fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0.28)
        .fromTo(anims, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: "power2.out" }, 0.3)
        .fromTo(root.querySelector(".pt-dot"), { left: "0%" }, { left: "100%", duration: 0.55, ease: "power2.inOut" }, 0.4)
        .fromTo(root.querySelector(".pt-scan"), { xPercent: -100 }, { xPercent: 900, duration: 0.6, ease: "power1.inOut" }, 0.4);

      // Safety: never leave the curtain down if navigation stalls.
      window.setTimeout(() => {
        if (!pendingRef.current) return;
        pendingRef.current = false;
        uncover(rootRef.current);
      }, 5000);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  // New route rendered → lift the containers away.
  useEffect(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    uncover(rootRef.current);
  }, [pathname]);

  return (
    <div ref={rootRef} className="pt-root" aria-hidden="true">
      {COLS.map((c, i) => (
        <div key={i} className="pt-col corrugated-strong" style={{ backgroundColor: c }} />
      ))}
      <div className="pt-label">
        <p className="pt-anim mono-label text-[10px] text-white/75 m-0">Now routing</p>
        <div className="pt-anim pt-codes">
          <span>{route.from[0]}</span>
          <span className="pt-line">
            <span className="pt-dot" />
          </span>
          <span>{route.to[0]}</span>
        </div>
        <p className="pt-anim pt-dest">{route.to[1]}</p>
        <span className="pt-anim pt-barcode-wrap">
          <span className="barcode pt-barcode" />
          <span className="pt-scan" />
        </span>
      </div>
    </div>
  );
}
