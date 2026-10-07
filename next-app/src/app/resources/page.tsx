import type { Metadata } from "next";
import Link from "next/link";
import { Link2, FileText, Download, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { ResourcesHeader } from "@/components/resources/ResourcesHeader";

export const metadata: Metadata = {
  title: "Resources | Shivaay Logistics",
  description:
    "Quick links, required documents, downloadable forms, and clearance ports/ICDs/CFS in Ludhiana — Shivaay Logistics.",
  openGraph: {
    title: "Resources | Shivaay Logistics",
    description:
      "Quick links, required documents, downloadable forms, and clearance ports/ICDs/CFS in Ludhiana.",
    type: "website",
    url: "https://www.shivaaylogistics.in/resources",
  },
  twitter: { card: "summary_large_image" },
};

interface ResourceSection {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const sections: ResourceSection[] = [
  {
    href: "/resources/links",
    label: "Quick Links",
    icon: Link2,
    description: "ICE Gate, DGFT, duty calculator and other customs portals.",
  },
  {
    href: "/resources/documents",
    label: "Documents",
    icon: FileText,
    description: "Checklists of documents required for registrations, imports, exports and refunds.",
  },
  {
    href: "/resources/files",
    label: "Download Files",
    icon: Download,
    description: "Circulars, declarations and blank forms, ready to download.",
  },
  {
    href: "/resources/ports",
    label: "Ports/ICDs/CFS",
    icon: MapPin,
    description: "Clearance ports, ICDs and CFS facilities in Ludhiana.",
  },
];

export default function ResourcesHubPage() {
  return (
    <>
      <ResourcesHeader
        title="Resources"
        description="Transport and customs references — portals, document checklists, downloads and Ludhiana clearance facilities."
      />
      <section className="pb-20 bg-cream" aria-label="Resource sections">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {sections.map((section, i) => (
              <Link
                key={section.href}
                href={section.href}
                className="reveal waybill flex items-start gap-4 bg-white rounded-2xl p-6 card-hover no-underline"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-teal-tint">
                  <Icon icon={section.icon} size={18} className="text-teal" aria-hidden={true} />
                </div>
                <div>
                  <p className="mono-label text-[9px] text-orange mb-1.5">
                    Section {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-semibold text-ink">{section.label}</h2>
                  <p className="text-ink-dim text-sm mt-1 leading-relaxed">{section.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
