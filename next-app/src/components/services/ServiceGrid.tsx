import { services } from "@/lib/data";
import {
  Plane, Ship, Truck, TrainFront, Home, Hammer, Warehouse,
  Shield, Package, FileText, Boxes, Briefcase, Box,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  plane: Plane, ship: Ship, truck: Truck, "train-front": TrainFront,
  home: Home, crane: Hammer, warehouse: Warehouse, shield: Shield,
  package: Package, "file-text": FileText, boxes: Boxes, briefcase: Briefcase,
};

export function ServiceGrid() {
  return (
    <section className="py-16 bg-white" aria-labelledby="services-grid-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 id="services-grid-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink text-center mb-8">
          All forwarding services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon] || Box;
            return (
              <div key={i} className="reveal bg-white border border-border rounded-2xl p-5 border-l-[3px] border-l-teal card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15, 118, 110, 0.08)" }}>
                    <Icon size={18} className="text-teal" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{s.title}</h3>
                    <p className="text-ink-dim text-sm mt-1 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
