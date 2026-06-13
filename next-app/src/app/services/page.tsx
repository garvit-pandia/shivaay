import type { Metadata } from "next";
import Link from "next/link";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { GalleryLightbox } from "@/components/services/GalleryLightbox";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Our Services | Shivaay Logistics",
  description:
    "Comprehensive logistics services including customs clearance, freight forwarding, warehousing, and supply chain solutions by Shivaay Logistics.",
  openGraph: {
    title: "Our Services | Shivaay Logistics",
    description:
      "Comprehensive logistics services including customs clearance, freight forwarding, warehousing, and supply chain solutions by Shivaay Logistics.",
    type: "website",
    url: "https://shivaaylogistics.com/services",
  },
  twitter: { card: "summary_large_image" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-white pt-20 pb-12">
        <div className="mx-auto max-w-[1280px] px-6 text-center">
          <p className="text-sm text-ink-dim mb-3">
            <Link href="/" className="text-ink-dim hover:text-teal transition-colors no-underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">Services</span>
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-ink">Our forwarding services</h1>
        </div>
      </section>
      <ServiceGrid />
      <GalleryLightbox />
      <TestimonialsSection />
      <CTASection heading="Need a logistics partner?" buttonText="Get in Touch" />
    </>
  );
}
