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
    <section className="py-24 bg-cream" aria-labelledby="promise-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 id="promise-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink text-center mb-12">
          Our promise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <div key={i} className="reveal bg-white border border-[rgba(30,27,24,0.06)] rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(15, 118, 110, 0.08)" }}>
                <c.icon size={26} className="text-teal" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-ink text-lg mb-2">{c.title}</h3>
              <p className="text-ink-dim text-sm leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
