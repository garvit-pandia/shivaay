import { whyUsItems } from "@/lib/data";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NetworkMapSection } from "./NetworkMapSection";

const iconMap: Record<string, LucideIcon> = {
  "shield-check": Icons.ShieldCheck,
  clock: Icons.Clock,
  "badge-indian-rupee": Icons.BadgeIndianRupee,
  "file-text": Icons.FileText,
  headphones: Icons.Headphones,
};

export function WhyPartnerSection() {
  return (
    <section className="py-24 bg-white border-t border-border" aria-labelledby="why-us-heading">
      <div className="mx-auto max-w-[1280px] px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 id="why-us-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink mb-8">
            Why partner with us
          </h2>
          <ul className="list-none m-0 p-0 space-y-5">
            {whyUsItems.map((item, i) => {
              const Icon = iconMap[item.icon] || Icons.Check;
              return (
                <li key={i} className="reveal flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(15, 118, 110, 0.08)" }}>
                    <Icon size={16} className="text-teal" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="text-ink-dim text-sm mt-0.5">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <NetworkMapSection />
      </div>
    </section>
  );
}
