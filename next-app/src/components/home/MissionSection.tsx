import { Target, Eye, Handshake } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { SplitReveal } from "@/components/motion/SplitReveal";

const cards = [
  {
    icon: Target,
    index: "04.1",
    title: "Our Mission",
    description:
      "To provide seamless logistics solutions worldwide, enabling businesses to move goods efficiently across borders and within India.",
  },
  {
    icon: Eye,
    index: "04.2",
    title: "Our Vision",
    description:
      "To be India's most trusted global logistics partner for every business — from small traders to large enterprises.",
  },
  {
    icon: Handshake,
    index: "04.3",
    title: "Our Commitment",
    description:
      "Reliable Service. Transparent Process. Customer Satisfaction. These aren't just words — they're our promise.",
  },
];

export function MissionSection() {
  return (
    <section
      className="py-24 bg-cream border-t border-border"
      aria-labelledby="promise-heading"
      data-station
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="mono-label text-[10px] text-orange mb-3">
          Manifest · 04 — Promise
        </p>
        <h2
          id="promise-heading"
          className="font-serif text-3xl lg:text-5xl font-medium text-ink mb-12"
        >
          <SplitReveal text="Our promise" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <div
              key={i}
              className="reveal waybill relative bg-white rounded-xl p-8 card-hover"
            >
              <span className="mono-label absolute top-4 right-5 text-[10px] text-ink-dim/60">
                {c.index}
              </span>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-teal-tint">
                <Icon icon={c.icon} size={26} className="text-teal" aria-hidden={true} />
              </div>
              <h3 className="font-grotesk font-semibold text-ink text-lg mb-2">
                {c.title}
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
