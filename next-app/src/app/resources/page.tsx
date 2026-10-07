import type { Metadata } from "next";
import Link from "next/link";
import { Link2, FileText, Download, MapPin, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { ResourcesHeader } from "@/components/resources/ResourcesHeader";
import { TiltGroup } from "@/components/motion/TiltGroup";

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
      <section className="py-16 lg:py-24 bg-cream" aria-label="Resource sections">
        <TiltGroup className="mx-auto max-w-[1280px] px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, i) => (
            <Link
              key={section.href}
              href={section.href}
              data-tilt
              data-scan
              className="dossier reveal group no-underline"
            >
              <span className="dossier-tab mono-label text-[9px]">
                Section {String(i + 1).padStart(2, "0")}
              </span>
              <div className="dossier-body waybill">
                <div className="flex items-start justify-between gap-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-teal text-white">
                    <Icon icon={section.icon} size={20} aria-hidden={true} />
                  </div>
                  <span className="dossier-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-medium text-ink mt-8 mb-2 group-hover:text-teal transition-colors">
                  {section.label}
                </h2>
                <p className="text-ink-dim leading-relaxed m-0 max-w-sm">{section.description}</p>
                <span className="mono-label text-[10px] text-teal mt-8 inline-flex items-center gap-2 dossier-cta">
                  Open section <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </TiltGroup>
      </section>
    </>
  );
}
