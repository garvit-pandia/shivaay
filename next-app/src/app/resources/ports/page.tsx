import type { Metadata } from "next";
import { ResourcesHeader } from "@/components/resources/ResourcesHeader";
import { PortsAccordion } from "@/components/resources/PortsAccordion";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Ports/ICDs/CFS in Ludhiana | Shivaay Logistics",
  description:
    "Clearance Ports/ICD's/CFS in Ludhiana — Container Corporation of India, Gateway Distriparks, Pristine, Hind Terminals, Adani and more.",
  openGraph: {
    title: "Ports/ICDs/CFS in Ludhiana | Shivaay Logistics",
    description:
      "Clearance Ports/ICD's/CFS in Ludhiana — locations and maps for major ICD and CFS facilities.",
    type: "website",
    url: "https://www.shivaaylogistics.in/resources/ports",
  },
  twitter: { card: "summary_large_image" },
};

export default function PortsPage() {
  return (
    <>
      <ResourcesHeader
        title="Clearance Ports/ICD's/CFS in Ludhiana"
        description="Explore the major Clearance Ports/ICD's/CFS in Ludhiana."
      />
      <PortsAccordion />
      <CTASection
        heading="Shipping through Ludhiana?"
        subtext="We handle clearance at all major ICDs and CFS facilities in the region."
        buttonText="Get in Touch"
      />
    </>
  );
}
