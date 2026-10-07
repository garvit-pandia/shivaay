import type { Metadata } from "next";
import { ResourcesHeader } from "@/components/resources/ResourcesHeader";
import { DocumentRequirements } from "@/components/resources/DocumentRequirements";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Documents Required | Shivaay Logistics",
  description:
    "The list of documents required for AD Code registration, IEC application, Bill of Entry, Shipping Bill, GST refunds, LUT and customs clearance.",
  openGraph: {
    title: "Documents Required | Shivaay Logistics",
    description:
      "The list of documents required for AD Code registration, IEC application, Bill of Entry, Shipping Bill, GST refunds, LUT and customs clearance.",
    type: "website",
    url: "https://www.shivaaylogistics.in/resources/documents",
  },
  twitter: { card: "summary_large_image" },
};

export default function DocumentsPage() {
  return (
    <>
      <ResourcesHeader
        title="Documents Required"
        description="Below is the list of documents required for various processes."
        ghost="Documents"
      />
      <DocumentRequirements />
      <CTASection
        heading="Not sure which documents apply to you?"
        subtext="Tell us your shipment type and we'll send you a clear, tailored checklist."
        buttonText="Ask Our Team"
      />
    </>
  );
}
