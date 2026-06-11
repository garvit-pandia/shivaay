import { whyUsItems } from "@/lib/data";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "shield-check": Icons.ShieldCheck,
  clock: Icons.Clock,
  "badge-indian-rupee": Icons.BadgeIndianRupee,
  "file-text": Icons.FileText,
  headphones: Icons.Headphones,
};

export function WhyPartnerSection() {
  return (
    <section className="py-20 bg-midnight-light/30" aria-labelledby="why-us-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center mb-12">
          <h2 id="why-us-heading" className="font-display text-3xl sm:text-4xl font-bold text-white">
            Why Partner With Us?
          </h2>
          <p className="text-text-dim mt-3 text-lg">Experience the Shivaay difference</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <ul className="list-none m-0 p-0 space-y-4">
            {whyUsItems.map((item, i) => {
              const Icon = iconMap[item.icon] || Icons.Check;
              return (
                <li key={i} className="reveal flex items-start gap-4">
                  <div className="why-us-check">
                    <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-[1.05rem] font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-text-dim text-sm mt-0">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
