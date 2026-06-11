"use client";

import dynamic from "next/dynamic";

const NetworkMapClient = dynamic(
  () => import("./NetworkMap").then((mod) => ({ default: mod.NetworkMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl bg-midnight-light/50 flex items-center justify-center">
        <div className="text-text-dim animate-pulse">Loading map...</div>
      </div>
    ),
  }
);

export function NetworkMapSection() {
  return (
    <section className="relative bg-midnight overflow-hidden divider-down" aria-labelledby="network-heading">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="text-center mb-10">
          <h2 id="network-heading" className="font-display text-3xl sm:text-4xl font-bold text-white">
            Our Coverage Network
          </h2>
          <p className="text-text-dim mt-3 text-lg max-w-xl mx-auto">
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
