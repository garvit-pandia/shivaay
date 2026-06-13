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
    <section className="py-24 bg-cream" aria-labelledby="services-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 id="services-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink text-center mb-12">
          What we do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {homepageServices.map((s, i) => {
            const Icon = iconMap[s.icon] || PackageCheck;
            return (
              <div
                key={s.title}
                className="reveal bg-white border border-border rounded-2xl p-6 card-hover"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(15, 118, 110, 0.08)" }}>
                  <Icon size={22} className="text-teal" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-ink mb-2">{s.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
