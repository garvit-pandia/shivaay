import type { Metadata } from "next";
import { ResourcesHeader } from "@/components/resources/ResourcesHeader";
import { DownloadGrid } from "@/components/resources/DownloadGrid";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Download Files | Shivaay Logistics",
  description:
    "Download customs circulars, declarations, RODTEP schedules and blank forms for your import-export processes.",
  openGraph: {
    title: "Download Files | Shivaay Logistics",
    description:
      "Download customs circulars, declarations, RODTEP schedules and blank forms for your import-export processes.",
    type: "website",
    url: "https://www.shivaaylogistics.in/resources/files",
  },
  twitter: { card: "summary_large_image" },
};

export default function FilesPage() {
  return (
    <>
      <ResourcesHeader
        title="Download Documents"
        description="Important documents, circulars & notifications for your reference."
        ghost="Downloads"
      />
      <DownloadGrid />
      <CTASection
        heading="Need a form we haven't listed?"
        subtext="Tell us what you need and we'll send the latest version directly."
        buttonText="Contact Us"
      />
    </>
  );
}
