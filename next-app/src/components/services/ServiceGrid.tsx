"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
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
  const [dealt, setDealt] = useState(false);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  // Deal the wall in once it scrolls into view (one-way).
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDealt(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(wall);
    return () => io.disconnect();
  }, []);

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
    <section
      className="pt-14 pb-24 bg-cream"
      aria-labelledby="services-grid-heading"
    >
      {/* No-JS: .dealt is only honoured under .js — force cards readable. */}
      <noscript>
        <style>{`.container-card{opacity:1}`}</style>
      </noscript>

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <p className="mono-label text-[10px] text-orange mb-3">
              Manifest — Services · 12
            </p>
            <h1
              id="services-grid-heading"
              className="font-serif text-4xl lg:text-5xl font-medium text-ink mb-4"
            >
              All forwarding services
            </h1>
            <p className="text-base lg:text-lg text-ink-dim leading-relaxed">
              12 specialized services to move your business forward
            </p>
          </div>
          <p className="mono-label text-[9px] text-ink-dim hidden sm:block">
            Hover / tap a container to flip
          </p>
        </div>

        <div
          ref={wallRef}
          className="container-wall grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {services.map((s, i) => {
            const code = `SHV-${String(i + 1).padStart(3, "0")}`;
            const cardStyle = {
              "--d": `${i * 90}ms`,
              "--tilt": i % 2 === 0 ? "-2deg" : "2deg",
            } as CSSProperties;
            return (
              <div
                key={s.title}
                className={`container-card${dealt ? " dealt" : ""}${
                  flipped[i] ? " flipped" : ""
                }`}
                style={cardStyle}
                role="button"
                tabIndex={0}
                aria-pressed={!!flipped[i]}
                onClick={() => toggleFlip(i)}
                onKeyDown={(e) => onCardKeyDown(e, i)}
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
  );
}
