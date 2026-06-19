"use client";

import dynamic from "next/dynamic";
import { whyUsItems } from "@/lib/data";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon as IconWrapper } from "@/components/ui/Icon";

const MapStory = dynamic(() => import("./MapStory").then((mod) => ({ default: mod.MapStory })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-[#FAF8F4] flex items-center justify-center">
      <div className="text-ink-dim animate-pulse">Loading map story…</div>
    </div>
  ),
});

const iconMap: Record<string, LucideIcon> = {
  "shield-check": Icons.ShieldCheck,
  clock: Icons.Clock,
  "badge-indian-rupee": Icons.BadgeIndianRupee,
  "file-text": Icons.FileText,
  headphones: Icons.Headphones,
};

export function MapStorySection() {
  return (
    <section className="py-24 bg-white border-t border-border" aria-labelledby="why-us-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 id="why-us-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink mb-10">
          Why partner with us
        </h2>

        {/* Why-us strip — compact index */}
        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 mb-20">
          {whyUsItems.map((item, i) => {
            const Icon = iconMap[item.icon] || Icons.Check;
            return (
              <li key={i} className="reveal flex flex-col gap-2 lg:border-l lg:border-border lg:pl-4 lg:first:border-l-0 lg:first:pl-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-teal-tint">
                  <IconWrapper icon={Icon} size={16} className="text-teal" aria-hidden={true} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-sm leading-tight">{item.title}</h3>
                  <p className="text-ink-dim text-xs mt-0.5 leading-snug">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* The map story set-piece */}
        <MapStory />
      </div>
    </section>
  );
}
