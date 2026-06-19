import { ShieldCheck, BadgeCheck, FileText, Award, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { credentials } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  "IEC Code": FileText,
  "Customs Broker License": ShieldCheck,
  "GSTIN": BadgeCheck,
  "ISO 9001:2015": Award,
  "ISO 28000": Award,
};

export function ComplianceStrip() {
  if (credentials.length === 0) return null;
  return (
    <section
      className="bg-cream border-t border-border"
      aria-label="Compliance and certifications"
    >
      <div className="mx-auto max-w-[1280px] px-6 py-4 flex flex-wrap items-center justify-center gap-2.5">
        {credentials.map((c) => {
          const IconComp = iconMap[c.label] ?? ShieldCheck;
          return (
            <span
              key={c.label}
              className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3 py-1.5 text-[13px]"
            >
              <Icon icon={IconComp} size={14} className="shrink-0 text-teal" aria-hidden={true} />
              <span className="text-ink-dim">{c.label}</span>
              <span className="font-semibold text-ink">{c.value}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
