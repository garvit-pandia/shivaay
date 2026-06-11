import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-midnight text-white min-h-[calc(100vh-72px)] flex items-center overflow-hidden divider-down" aria-labelledby="hero-heading">
      <div className="absolute inset-0 hero-glow z-0" />
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-20 w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-[540px]">
          <span className="inline-block bg-teal/10 text-teal px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider mb-6">
            15+ Years Experience
          </span>
          <h1 id="hero-heading" className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
            We Deliver Solutions,<br />
            You <span className="text-amber">Grow Your Business.</span>
          </h1>
          <p className="text-text-dim text-lg leading-relaxed mb-8 max-w-[480px]">
            Your trusted partner for customs clearance, freight forwarding, and end-to-end logistics solutions across India.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/contact" className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-base no-underline">
              Get a Quote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="tel:+918847467790" className="inline-flex items-center gap-2 btn-outline px-6 py-3 text-base no-underline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call Now
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center">
          <div className="relative w-[320px] h-[320px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-display text-5xl font-extrabold text-amber leading-none">15+</div>
                <div className="text-text-dim text-sm mt-2">Years Experience</div>
              </div>
            </div>
            <div className="absolute bottom-3 right-0 bg-card border border-border rounded-xl px-5 py-4 max-w-[180px] card-hover">
              <div className="text-center">
                <div className="font-display text-3xl font-extrabold text-amber leading-none">800+</div>
                <div className="text-text-dim text-xs mt-1">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
