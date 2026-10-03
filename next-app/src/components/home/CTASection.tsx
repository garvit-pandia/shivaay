import Link from "next/link";
import { CratesField } from "@/components/motion/CratesField";

interface CTASectionProps {
  heading?: string;
  subtext?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function CTASection({
  heading = "Ready to move your cargo?",
  subtext = "Get a quote in under 24 hours. No obligations, no hidden fees.",
  buttonText = "Get a Quote",
  buttonHref = "/contact",
}: CTASectionProps) {
  return (
    <section
      className="bg-cream py-24 border-t border-border"
      aria-labelledby="cta-heading"
      data-station
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="relative bg-teal rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center overflow-hidden isolate">
          {/* physics crates drop behind the heading */}
          <CratesField />
          <div
            className="absolute inset-0 corrugated opacity-60 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="mono-label text-[10px] text-white/70 mb-4">
              Final mile · LDH → Your port
            </p>
            <h2
              id="cta-heading"
              className="font-serif text-3xl md:text-5xl font-medium text-white mb-4"
            >
              {heading}
            </h2>
            <p className="text-base text-white/85 mb-8 max-w-md mx-auto leading-relaxed">
              {subtext}
            </p>
            <Link
              href={buttonHref}
              data-stamp
              className="inline-block bg-white text-teal font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-ink hover:text-white transition-all duration-200"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
