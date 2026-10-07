import type { Metadata } from "next";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { GalleryLightbox } from "@/components/services/GalleryLightbox";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { Faq } from "@/components/faq/Faq";
import { TextReveal } from "@/components/motion/TextReveal";
import { servicesFaqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Services | Shivaay Logistics",
  description:
    "Comprehensive logistics services including customs clearance, freight forwarding, warehousing, and supply chain solutions by Shivaay Logistics.",
  openGraph: {
    title: "Our Services | Shivaay Logistics",
    description:
      "Comprehensive logistics services including customs clearance, freight forwarding, warehousing, and supply chain solutions by Shivaay Logistics.",
    type: "website",
    url: "https://www.shivaaylogistics.in/services",
  },
  twitter: { card: "summary_large_image" },
};

export default function ServicesPage() {
  return (
    <>
      <ServiceGrid />
      <GalleryLightbox />
      <section
        className="py-24 bg-cream border-t border-border"
        aria-labelledby="services-faq-heading"
      >
        <div className="mx-auto max-w-[1280px] px-6">
          <p className="mono-label text-[10px] text-orange mb-3">
            Manifest — Questions
          </p>
          <TextReveal
            id="services-faq-heading"
            className="font-serif text-4xl lg:text-6xl font-medium text-ink leading-[1.05] mb-12"
          >
            Before you ask
          </TextReveal>
          <Faq items={servicesFaqs} idPrefix="services-faq" />
        </div>
      </section>
      <TestimonialsSection />
      <CTASection heading="Need a logistics partner?" buttonText="Get in Touch" />
    </>
  );
}
