import type { Metadata } from "next";
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
      <ServiceGrid />
      <GalleryLightbox />
      <TestimonialsSection />
      <CTASection heading="Need a logistics partner?" buttonText="Get in Touch" />
    </>
  );
}
