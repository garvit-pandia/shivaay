"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { portFacilities } from "@/lib/resources";
import { PortsRadar } from "./PortsRadar";

export function PortsAccordion() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const activeId = hoverId ?? openId;

  const pick = (id: number) => {
    setOpenId(id);
    document.getElementById(`port-item-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <section className="py-16 lg:py-24 bg-cream" aria-label="Clearance ports, ICDs and CFS facilities">
      <div className="mx-auto max-w-[1280px] px-6 grid gap-10 lg:grid-cols-[minmax(0,480px)_1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <PortsRadar activeId={activeId} onPick={pick} />
        </div>
        <div className="space-y-4">
        {portFacilities.map((facility) => {
          const open = openId === facility.id;
          return (
            <div
              key={facility.id}
              id={`port-item-${facility.id}`}
              // State via data-attribute: a changing className would wipe the
              // `.visible` class ScrollReveal adds imperatively.
              data-active={activeId === facility.id || undefined}
              className="reveal port-item bg-white border rounded-2xl overflow-hidden card-hover"
              onMouseEnter={() => setHoverId(facility.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(facility.id)}
              onBlur={() => setHoverId(null)}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : facility.id)}
                aria-expanded={open}
                aria-controls={`port-panel-${facility.id}`}
                className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer bg-transparent border-0"
              >
                <div>
                  <p className="mono-label text-[9px] text-orange mb-1.5">
                    Facility № {String(facility.id).padStart(2, "0")}
                  </p>
                  <h2 className="font-semibold text-ink text-sm sm:text-base">
                    {facility.name}
                  </h2>
                  {facility.location && (
                    <p className="flex items-center gap-1.5 text-ink-dim text-xs mt-1.5">
                      <Icon icon={MapPin} size={12} className="shrink-0" aria-hidden={true} />
                      {facility.location}
                    </p>
                  )}
                </div>
                <Icon
                  icon={ChevronDown}
                  size={16}
                  className={`shrink-0 text-ink-dim transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden={true}
                />
              </button>
              {open && (
                <div
                  id={`port-panel-${facility.id}`}
                  role="region"
                  aria-label={`Map of ${facility.name}`}
                  className="port-panel border-t border-border"
                >
                  {facility.maps ? (
                    <iframe
                      src={facility.maps}
                      title={`Map of ${facility.name}`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      className="block h-[320px] w-full border-0"
                    />
                  ) : (
                    <p className="p-5 text-sm text-ink-dim">Location map not available.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
