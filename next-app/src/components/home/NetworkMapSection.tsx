"use client";

import dynamic from "next/dynamic";

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
        <div className="w-full aspect-[16/9] max-h-[600px] relative">
          <NetworkMapClient />
        </div>
      </div>
    </section>
  );
}
