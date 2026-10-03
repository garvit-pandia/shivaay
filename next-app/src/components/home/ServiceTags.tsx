import { homepageServices } from "@/lib/data";
import { FileCheck, Ship, PackageCheck, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon as IconWrapper } from "@/components/ui/Icon";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  "file-check": FileCheck,
  ship: Ship,
  "package-check": PackageCheck,
  "shield-check": ShieldCheck,
};

const CONTAINER_COLORS = ["#0F766E", "#1E1B18", "#0D9488", "#EA580C"];

export function ServiceTags() {
  return (
    <section
      className="py-24 bg-cream border-t border-border"
      aria-labelledby="services-heading"
      data-station
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p className="mono-label text-[10px] text-orange mb-3">
              Manifest · 01 — Services
            </p>
            <h2
              id="services-heading"
              className="font-serif text-3xl lg:text-5xl font-medium text-ink"
            >
              What we do
            </h2>
          </div>
          <Link
            href="/services"
            className="mono-label text-[10px] text-teal hover:text-orange transition-colors"
          >
            View all 12 services →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {homepageServices.map((s, i) => {
            const Icon = iconMap[s.icon] || PackageCheck;
            const color = CONTAINER_COLORS[i % CONTAINER_COLORS.length];
            return (
              <Link
                key={s.title}
                href="/services"
                className="reveal group block bg-white border border-border rounded-xl overflow-hidden card-hover"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* container top bar */}
                <div
                  className="corrugated h-14 flex items-center justify-between px-4"
                  style={{ background: color }}
                >
                  <span className="mono-label text-[9px] text-white/90">
                    SHV-{String(i + 1).padStart(3, "0")}
                  </span>
                  <IconWrapper
                    icon={Icon}
                    size={20}
                    className="text-white"
                    aria-hidden={true}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-grotesk font-semibold text-ink mb-2 group-hover:text-teal transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-ink-dim text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
