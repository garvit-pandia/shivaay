import { Target, Eye, Handshake } from "lucide-react";

const cards = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To provide seamless logistics solutions worldwide, enabling businesses to move goods efficiently across borders and within India.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To be India's most trusted global logistics partner for every business — from small traders to large enterprises.",
  },
  {
    icon: Handshake,
    title: "Our Commitment",
    description:
      "Reliable Service. Transparent Process. Customer Satisfaction. These aren't just words — they're our promise.",
  },
];

export function MissionSection() {
  return (
    <section className="py-20 divider-up divider-down" aria-labelledby="promise-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center mb-12">
          <h2 id="promise-heading" className="font-display text-3xl sm:text-4xl font-bold text-white">
            Our Promise
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <div key={i} className="reveal bg-card border border-border rounded-2xl p-8 card-hover">
              <div className="mission-icon">
                <c.icon size={26} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">{c.title}</h3>
              <p className="text-text-dim text-sm leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
