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
  twitter: {
    card: "summary_large_image",
  },
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-white border-b border-[#ECEDF0] py-16 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0B0F19]">
          Our Forwarding Services
        </h1>
        <p className="text-[#4B5468] text-sm mt-2">
          <Link href="/" className="text-[#4B5468] hover:text-[#1E3A8A] no-underline">Home</Link> / <span>Services</span>
        </p>
      </section>
      <ServiceGrid />
      <GalleryLightbox />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
