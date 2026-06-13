import Link from "next/link";

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
    <section className="bg-white py-24" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-3xl px-6">
        <div className="bg-teal rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center">
          <h2 id="cta-heading" className="font-serif text-3xl md:text-4xl font-medium text-white mb-4">
            {heading}
          </h2>
          <p className="text-base text-white/85 mb-8 max-w-md mx-auto leading-relaxed">
            {subtext}
          </p>
          <Link
            href={buttonHref}
            className="inline-block bg-white text-teal font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-ink hover:text-white transition-all duration-200"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
