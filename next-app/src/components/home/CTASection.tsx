import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  heading?: string;
  subtext?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function CTASection({
  heading = "Need a Logistics Partner?",
  subtext = "Let's discuss how we can streamline your supply chain.",
  buttonText = "Request a Quote",
  buttonHref = "/contact",
}: CTASectionProps) {
  return (
    <section
      className="py-16 text-center bg-[#1E3A8A] border-y border-white/15"
      aria-labelledby="cta-heading"
    >
      <h2 id="cta-heading" className="font-display text-2xl sm:text-3xl font-bold text-white">
        {heading}
      </h2>
      <p className="text-white/85 mt-3 mb-8">{subtext}</p>
      <Link
        href={buttonHref}
        className="inline-flex items-center gap-2 btn-on-cobalt px-7 py-3.5 text-base font-bold no-underline"
      >
        {buttonText}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}
