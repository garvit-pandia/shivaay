import { AnimatedCounter } from "./AnimatedCounter";
import { heroStats } from "@/lib/data";

export function HeroSection() {
  return (
    <section className="bg-white" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-[1280px] px-6 pt-10 pb-14 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Hero image */}
        <div className="relative aspect-[4/3] lg:aspect-[5/4] bg-cream rounded-2xl overflow-hidden order-2 lg:order-1">
          <img
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=80"
            alt="Cargo containers at port — Shivaay Logistics"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right: Editorial type */}
        <div className="order-1 lg:order-2">
          <p className="text-[11px] font-semibold text-teal uppercase tracking-[0.2em] mb-4">
            Customs Broker &middot; Ludhiana
          </p>
          <h1 id="hero-heading" className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] font-normal text-ink leading-[1.1] tracking-tight mb-6">
            Customs brokerage with <span className="italic text-teal">integrity</span>
          </h1>
          <p className="text-base text-ink-dim leading-relaxed max-w-lg mb-8">
            Pan-India customs clearance and freight forwarding. Zero detention, transparent pricing, real-time tracking. Ludhiana &middot; Delhi &middot; Mumbai &middot; Mundra.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <a href="/contact" className="btn-primary">Get a Quote</a>
            <a href="/services" className="btn-outline">Our Services</a>
          </div>

          {/* Micro stats — animated counters, no cards, just type */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 pt-6 border-t border-border">
            {heroStats.map((stat, i) => (
              <AnimatedCounter key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
