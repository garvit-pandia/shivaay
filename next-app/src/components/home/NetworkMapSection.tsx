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
    <div>
      <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ink mb-8">
        Our coverage network
      </h2>
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-[#E8E4DB]">
        <NetworkMapClient />
      </div>
    </div>
  );
}
