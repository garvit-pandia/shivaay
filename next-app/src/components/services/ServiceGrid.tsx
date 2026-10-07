"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  Plane,
  Ship,
  Truck,
  TrainFront,
  House,
  Forklift,
  Warehouse,
  Shield,
  Package,
  FileText,
  Boxes,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { services } from "@/lib/data";
import { containerColor } from "@/lib/palette";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/components/motion/gsap";
import { attachTilt } from "@/components/motion/tilt";
import { PageHero } from "@/components/motion/PageHero";

/**
 * Name → icon resolution, keyed EXACTLY by the `icon` strings in
 * src/lib/data.ts. All twelve resolve to real exports of the installed
 * lucide-react@1.17.0 (verified against dist). Two deliberate remaps —
 * lib/data.ts stays untouched:
 *
 *   "home"   → House     canonical name in lucide 1.x (Home is a legacy alias)
 *   "hammer" → Forklift  Project Cargo = heavy-lift. The old map keyed this
 *                        as "crane", which never matched the data string, so
 *                        the card silently fell back to a cube (Box).
 */
const serviceIcons: Record<string, LucideIcon> = {
  plane: Plane,
  ship: Ship,
  truck: Truck,
  "train-front": TrainFront,
  home: House,
  hammer: Forklift,
  warehouse: Warehouse,
  shield: Shield,
  package: Package,
  "file-text": FileText,
  boxes: Boxes,
  briefcase: Briefcase,
};

export function ServiceGrid() {
  const wallRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  // Crane drop: containers are lowered in row by row as they scroll into
  // view, swing a little on the "cable", then settle; cards tilt to the
  // pointer. `.is-dealt` on the wall lifts the CSS pre-hide (hydration gap).
  useGSAP(
    () => {
      const wall = wallRef.current;
      if (!wall) return;
      const cards = gsap.utils.toArray<HTMLElement>(".container-card", wall);
      wall.classList.add("is-dealt");
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(cards, { transformPerspective: 1100 });
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap
              .timeline()
              .from(batch, {
                y: -160,
                opacity: 0,
                rotationZ: (i) => (i % 2 ? 7 : -7),
                duration: 0.9,
                ease: "power3.in",
                stagger: 0.09,
              })
              .to(batch, {
                keyframes: { rotationZ: [2.5, -1.2, 0.4, 0], y: [-6, 0] },
                duration: 0.9,
                ease: "sine.out",
                stagger: 0.09,
              }, ">-0.05"),
        });
        return attachTilt(cards, 6);
      });
      return () => mm.revert();
    },
    { scope: wallRef }
  );

  const toggleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const onCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip(index);
    }
  };

  return (
    <>
    <PageHero
      id="services-grid-heading"
      kicker="Manifest — Services · 12"
      title="All forwarding services"
      description="12 specialized services to move your business forward"
      ghost="Services"
      aside={
        <div className="ph-stat">
          <span className="font-serif text-7xl lg:text-8xl leading-none text-teal">12</span>
          <span className="mono-label text-[10px] text-ink-dim">Containers on the manifest</span>
          <span className="barcode block h-6 w-40 text-ink/70" aria-hidden="true" />
        </div>
      }
    />
    <section className="pt-16 pb-24 bg-cream" aria-label="Service containers">
      {/* No-JS: the pre-hide only applies under .js — force cards readable. */}
      <noscript>
        <style>{`.container-card{opacity:1}`}</style>
      </noscript>

      <div className="mx-auto max-w-[1280px] px-6">
        <p className="mono-label text-[9px] text-ink-dim mb-8 hidden sm:block">
          Hover / tap a container to flip
        </p>

        <div
          ref={wallRef}
          className="container-wall grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {services.map((s, i) => {
            const code = `SHV-${String(i + 1).padStart(3, "0")}`;
            return (
              <div
                key={s.title}
                className="container-card"
                role="button"
                tabIndex={0}
                aria-pressed={!!flipped[i]}
                onClick={() => toggleFlip(i)}
                onKeyDown={(e) => onCardKeyDown(e, i)}
                data-scan
                data-waybill={JSON.stringify({
                  id: code,
                  label: s.title,
                  route: "CUSTOMS → CLEARED",
                })}
                data-stamp="stacked"
              >
                <div className="container-card-inner h-64">
                  {/* front — corrugated container door */}
                  <div
                    className="container-face corrugated flex flex-col p-5"
                    style={{ backgroundColor: containerColor(i) }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="mono-label text-[9px] text-white/90">
                        {code}
                      </span>
                      <span
                        className="barcode block h-4 w-16 text-white/70"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 flex items-center">
                      <Icon
                        icon={serviceIcons[s.icon]}
                        size={38}
                        className="text-white"
                        aria-hidden={true}
                      />
                    </div>
                    <h2 className="font-serif text-xl font-medium text-white leading-snug">
                      {s.title}
                    </h2>
                  </div>

                  {/* back — waybill detail */}
                  <div className="container-face back bg-white border border-border p-5 flex flex-col">
                    <p className="mono-label text-[9px] text-orange mb-3">
                      Included
                    </p>
                    <p className="text-sm text-ink-dim leading-relaxed">
                      {s.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-dashed border-border flex items-center justify-between">
                      <Icon
                        icon={serviceIcons[s.icon]}
                        size={18}
                        className="text-teal"
                        aria-hidden={true}
                      />
                      <span
                        className="mono-label text-[8px] text-ink-dim/70"
                        aria-hidden="true"
                      >
                        {code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
}
