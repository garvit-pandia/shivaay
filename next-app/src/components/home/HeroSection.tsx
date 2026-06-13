export function HeroSection() {
  return (
    <section className="bg-white" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-[1280px] px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Photo placeholder */}
        <div className="relative aspect-[4/3] lg:aspect-[5/4] bg-cream rounded-2xl overflow-hidden order-2 lg:order-1">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-ink-dim/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" width="64" height="64" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <p className="text-xs uppercase tracking-widest font-medium mt-4">Logistics Photography</p>
            </div>
          </div>
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
          <div className="flex flex-wrap gap-4 mb-10">
            <a href="/contact" className="btn-primary">Get a Quote</a>
            <a href="/services" className="btn-outline">Our Services</a>
          </div>

          {/* Micro stats — no cards, just type */}
          <div className="flex gap-10 pt-6 border-t border-border">
            {[
              { value: "15+", label: "Years Experience" },
              { value: "800+", label: "Happy Clients" },
              { value: "5", label: "Major Ports" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-ink">{stat.value}</div>
                <div className="text-xs text-ink-dim mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
