import { services } from "@/lib/data";
import {
  Plane,
  Ship,
  Truck,
  TrainFront,
  Home,
  Hammer,
  Warehouse,
  Shield,
  Package,
  FileText,
  Boxes,
  Briefcase,
  Box,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  plane: Plane,
  ship: Ship,
  truck: Truck,
  "train-front": TrainFront,
  home: Home,
  crane: Hammer,
  warehouse: Warehouse,
  shield: Shield,
  package: Package,
  "file-text": FileText,
  boxes: Boxes,
  briefcase: Briefcase,
};

export function ServiceGrid() {
  return (
    <section className="py-20" aria-labelledby="services-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center mb-12">
          <h2 id="services-heading" className="font-display text-3xl sm:text-4xl font-bold text-white">
            Complete Logistics Solutions
          </h2>
          <p className="text-text-dim mt-3 text-lg">12 specialized services to move your business forward</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon] || Box;
            return (
              <div
                key={i}
                className="reveal bg-card border border-border rounded-2xl p-6 card-hover border-l-[3px] border-l-teal"
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
