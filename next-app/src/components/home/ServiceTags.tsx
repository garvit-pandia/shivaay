import { homepageServices } from "@/lib/data";
import { FileCheck, Ship, PackageCheck, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "file-check": FileCheck,
  ship: Ship,
  "package-check": PackageCheck,
  "shield-check": ShieldCheck,
};

export function ServiceTags() {
  return (
    <section className="py-20" aria-labelledby="services-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center mb-12">
          <h2 id="services-heading" className="font-display text-3xl sm:text-4xl font-bold text-white">
            End-to-End Logistics Solutions
          </h2>
          <p className="text-text-dim mt-3 text-lg">From documentation to delivery, we handle it all</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {homepageServices.map((s, i) => {
            const Icon = iconMap[s.icon] || PackageCheck;
            return (
              <div
                key={s.title}
                className="reveal bg-card border border-border rounded-2xl p-6 card-hover"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="service-icon">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-text-dim text-sm leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
