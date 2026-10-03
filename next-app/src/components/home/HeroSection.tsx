import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { GlobeHero } from "@/components/motion/GlobeHero";
import { Odometer } from "@/components/motion/Odometer";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { companyInfo } from "@/lib/data";

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "800+", label: "Happy Clients" },
  { value: "5", label: "Major Ports" },
];

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-cream"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />

      {/* 3D globe — right side on desktop, soft backdrop on mobile */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[62%] opacity-30 lg:opacity-100">
        <GlobeHero />
        <span
          className="mono-label text-ink-dim/60 absolute bottom-8 right-28 hidden lg:block pointer-events-none"
          aria-hidden="true"
        >
          Drag to spin
        </span>
      </div>
      {/* readability scrim — heavy on the text side, clear over the globe */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-cream via-cream/75 to-transparent lg:via-cream/30"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 min-h-[94vh] flex items-center pt-24 pb-20">
        <div className="max-w-2xl">
          <p className="mono-label text-[11px] text-teal mb-6 flex items-center gap-2.5">
            <span className="ticker-dot" aria-hidden="true" />
            Customs Broker · Ludhiana
          </p>
          <h1
            id="hero-heading"
            className="font-serif text-5xl sm:text-6xl lg:text-[4.6rem] font-normal text-ink leading-[1.04] tracking-tight mb-6"
          >
            <SplitReveal text="Customs brokerage with integrity" accent="integrity" />
          </h1>
          <p className="text-base lg:text-lg text-ink-dim leading-relaxed max-w-lg mb-9">
            Pan-India customs clearance and freight forwarding. Zero detention,
            transparent pricing, real-time tracking. Ludhiana &middot; Delhi
            &middot; Mumbai &middot; Mundra.
          </p>
          <div className="flex flex-wrap gap-4 mb-7">
            <Magnetic>
              <Link href="/contact" className="btn-primary" data-stamp>
                Get a Quote
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/services" className="btn-outline">
                Our Services
              </Link>
            </Magnetic>
          </div>
          {/* CHA trust chip — number appears once the client shares it */}
          <p className="inline-flex items-center gap-2 border border-teal/30 bg-teal-tint rounded-full px-4 py-1.5 mb-12">
            <BadgeCheck size={14} className="text-teal" aria-hidden="true" />
            <span className="mono-label text-[10px] text-teal">
              Licensed Customs Broker
              {companyInfo.chaLicense ? ` · CHA ${companyInfo.chaLicense}` : ""}
            </span>
          </p>

          {/* Micro stats — odometer roll */}
          <div className="flex gap-10 lg:gap-14 pt-7 border-t border-ink/10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <Odometer
                  value={stat.value}
                  className="text-3xl lg:text-4xl font-grotesk font-bold text-ink"
                />
                <div className="mono-label text-[9px] text-ink-dim mt-1.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2.5"
        aria-hidden="true"
      >
        <span className="mono-label text-[9px] text-ink-dim">Scroll</span>
        <span className="scroll-cue block w-px h-10 bg-ink/15" />
      </div>
    </section>
  );
}
