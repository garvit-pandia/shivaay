import type { Metadata } from "next";
import { ResourcesHeader } from "@/components/resources/ResourcesHeader";
import { PortalLinkGrid } from "@/components/resources/PortalLinkGrid";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Quick Links | Shivaay Logistics",
  description:
    "Transport & customs resources — ICE Gate, DGFT, custom duty calculator, exchange rates and shipping bill enquiry.",
  openGraph: {
    title: "Quick Links | Shivaay Logistics",
    description:
      "Transport & customs resources — ICE Gate, DGFT, custom duty calculator, exchange rates and shipping bill enquiry.",
    type: "website",
    url: "https://www.shivaaylogistics.in/resources/links",
  },
  twitter: { card: "summary_large_image" },
};

export default function LinksPage() {
  return (
    <>
      <ResourcesHeader
        title="Transport & Customs Resources"
        description="Tap “Visit” to explore the website!"
        ghost="Portals"
      />
      <PortalLinkGrid />
      <CTASection
        heading="Can't find the portal you need?"
        subtext="Our team can point you to the right government portal or handle the filing for you."
        buttonText="Get in Touch"
      />
    </>
  );
}
