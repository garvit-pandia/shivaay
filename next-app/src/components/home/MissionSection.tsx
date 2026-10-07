import { Eye, Handshake } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { ScrubText } from "@/components/motion/ScrubText";
import { TextReveal } from "@/components/motion/TextReveal";

const mission =
  "To provide seamless logistics solutions worldwide, enabling businesses to move goods efficiently across borders and within India.";

const cards = [
  {
    icon: Eye,
    index: "05.2",
    title: "Our Vision",
    description:
      "To be India's most trusted global logistics partner for every business — from small traders to large enterprises.",
  },
  {
    icon: Handshake,
    index: "05.3",
    title: "Our Commitment",
    description:
      "Reliable Service. Transparent Process. Customer Satisfaction. These aren't just words — they're our promise.",
  },
];

export function MissionSection() {
  return (
    <section
      className="bg-cream border-t border-border py-24 lg:py-36"
      aria-labelledby="promise-heading"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="mono-label text-[10px] text-orange mb-3">Manifest · 05 — Promise</p>
        <TextReveal
          id="promise-heading"
          className="font-serif text-4xl lg:text-6xl font-medium text-ink leading-[1.05] mb-14 lg:mb-20"
        >
          Our promise
        </TextReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 lg:gap-14 mb-16 lg:mb-24">
          <h3 className="mono-label text-[10px] text-teal lg:pt-4">05.1 · Our Mission</h3>
          <ScrubText className="font-serif text-3xl sm:text-4xl lg:text-[3.4rem] leading-[1.15] text-ink m-0">
            {mission}
          </ScrubText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {cards.map((c) => (
            <div key={c.title} className="reveal waybill relative bg-white rounded-xl p-8 lg:p-10 card-hover">
              <span className="mono-label absolute top-4 right-5 text-[10px] text-ink-dim/60">
                {c.index}
              </span>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-teal-tint">
                <Icon icon={c.icon} size={26} className="text-teal" aria-hidden={true} />
              </div>
              <h3 className="font-grotesk font-semibold text-ink text-xl mb-2">{c.title}</h3>
              <p className="text-ink-dim leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
