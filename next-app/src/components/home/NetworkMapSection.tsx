"use client";

import dynamic from "next/dynamic";
import { cities } from "@/lib/data";

const NetworkMapClient = dynamic(
  () => import("./NetworkMap").then((mod) => ({ default: mod.NetworkMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl bg-[#F4F5F7] flex items-center justify-center">
        <div className="text-[#4B5468] animate-pulse">Loading map...</div>
      </div>
    ),
  }
);

export function NetworkMapSection() {
  return (
    <section className="relative bg-white border-t border-[#ECEDF0] overflow-hidden divider-down" aria-labelledby="network-heading">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="text-center mb-10">
          <h2 id="network-heading" className="font-display text-3xl sm:text-4xl font-bold text-[#0B0F19]">
            Our Coverage Network
          </h2>
          <p className="text-[#4B5468] mt-3 text-lg max-w-xl mx-auto">
            Hub-and-spoke logistics network connecting key Indian cities and ports
          </p>
        </div>
        <div className="w-full aspect-[16/10] max-h-[700px] relative rounded-xl overflow-hidden border border-[#E8E4DB]">
          <NetworkMapClient />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3" aria-label="Service cities">
          {Object.entries(cities).map(([name, city]) => (
            <span
              key={name}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                city.isHub
                  ? "bg-[rgba(15,118,110,0.1)] border border-[#0F766E] text-[#0F766E] font-semibold"
                  : "bg-white border border-[#E8E4DB] text-[#1E1B18]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  city.isHub ? "bg-[#0F766E]" : "bg-[#6B5E4A]"
                }`}
                aria-hidden="true"
              />
              {city.label}
              {city.tag && (
                <span className="text-xs text-[#6B5E4A] font-normal">— {city.tag}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
