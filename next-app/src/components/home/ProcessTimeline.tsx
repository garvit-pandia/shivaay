import { FileText, Stamp, ReceiptIndianRupee, Truck } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { SplitReveal } from "@/components/motion/SplitReveal";

const steps = [
  {
    icon: FileText,
    code: "ST.01",
    title: "Documents in",
    text: "You share the invoice and packing list. We verify HS codes, duty rates, and NOC requirements before anything moves.",
  },
  {
    icon: Stamp,
    code: "ST.02",
    title: "Filing",
    text: "Bill of entry or shipping bill filed electronically — ideally before the vessel berths, so clearance starts at arrival.",
  },
  {
    icon: ReceiptIndianRupee,
    code: "ST.03",
    title: "Duty & release",
    text: "You approve the challan, duty is paid to the government, and we chase the out-of-charge until the goods are released.",
  },
  {
    icon: Truck,
    code: "ST.04",
    title: "Last mile",
    text: "Transport is pre-booked, so cargo rolls from port to your door with live tracking — detention clock stopped.",
  },
];

export function ProcessTimeline() {
  return (
    <section
      className="py-24 bg-white border-t border-border"
      aria-labelledby="process-heading"
      data-station
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="mono-label text-[10px] text-orange mb-3">
          Manifest · 02 — Process
        </p>
        <h2
          id="process-heading"
          className="font-serif text-3xl lg:text-5xl font-medium text-ink mb-4"
        >
          <SplitReveal text="How clearance works" />
        </h2>
        <p className="text-ink-dim max-w-xl mb-12">
          Four steps, one accountable team. This is the exact runbook behind
          every shipment we touch.
        </p>

        <ol className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <li
              key={s.code}
              className="reveal relative bg-cream border border-border rounded-xl p-6 card-hover"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-teal text-white">
                  <Icon icon={s.icon} size={20} aria-hidden={true} />
                </div>
                <span className="mono-label text-[10px] text-ink-dim/70">
                  {s.code}
                </span>
              </div>
              <h3 className="font-grotesk font-semibold text-ink mb-2">
                <span className="mono-label text-[10px] text-teal mr-2">
                  {i + 1}
                </span>
                {s.title}
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed">{s.text}</p>
              {i < steps.length - 1 && (
                <span
                  className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-teal/40"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
