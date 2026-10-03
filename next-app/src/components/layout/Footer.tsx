import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { companyInfo } from "@/lib/data";

const headingClass = "mono-label text-[11px] text-[#FDBA74] mb-4";
const linkClass = "text-white/75 text-sm hover:text-white transition-colors no-underline";

export function Footer() {
  return (
    <footer className="bg-[#134E4A] text-white" role="contentinfo">
      {/* Corrugated container edge */}
      <div className="corrugated h-3 bg-teal" aria-hidden="true" />

      <div className="mx-auto max-w-[1280px] px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Link href="/" className="font-serif text-xl font-semibold text-white tracking-tight no-underline">
            Shivaay Logistics
          </Link>
          <p className="text-white/70 text-sm leading-relaxed mt-3 max-w-xs">
            Pan-India customs clearance and freight forwarding. Trusted by 800+ businesses across Ludhiana, Delhi, Mumbai, and Mundra.
          </p>
          <p className="mono-label text-[10px] text-[#FDBA74] mt-4">
            Licensed Customs Broker
            {companyInfo.chaLicense ? ` · CHA ${companyInfo.chaLicense}` : ""}
          </p>
        </div>

        <div>
          <h4 className={headingClass}>Quick Links</h4>
          <ul className="list-none m-0 p-0 space-y-2.5">
            <li><Link href="/" className={linkClass}>Home</Link></li>
            <li><Link href="/services" className={linkClass}>Services</Link></li>
            <li><Link href="/contact" className={linkClass}>Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={headingClass}>Resources</h4>
          <ul className="list-none m-0 p-0 space-y-2.5">
            <li><Link href="/resources/links" className={linkClass}>Portal Links</Link></li>
            <li><Link href="/resources/documents" className={linkClass}>Documents</Link></li>
            <li><Link href="/resources/files" className={linkClass}>Download Files</Link></li>
            <li><Link href="/resources/ports" className={linkClass}>Ports/ICDs/CFS</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={headingClass}>Contact</h4>
          <ul className="list-none m-0 p-0 space-y-3 text-white/75 text-sm">
            <li className="flex items-start gap-2.5">
              <Icon icon={MapPin} size={14} className="shrink-0 mt-0.5 text-white/70" />
              <span>Mundian Kalan, Ludhiana, Punjab 141015</span>
            </li>
            <li>
              <a href="mailto:shivaaylogistics2022@gmail.com" className="flex items-center gap-2.5 text-white/75 hover:text-white transition-colors no-underline">
                <Icon icon={Mail} size={14} className="shrink-0 text-white/70" />
                shivaaylogistics2022@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+918847467790" className="flex items-center gap-2.5 text-white/75 hover:text-white transition-colors no-underline">
                <Icon icon={Phone} size={14} className="shrink-0 text-white/70" />
                +91 88474-67790
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 py-5">
        <div className="mx-auto max-w-[1280px] px-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
          <p className="text-white/60 text-xs m-0">
            &copy; {new Date().getFullYear()} Shivaay Logistics. All rights reserved.
          </p>
          <span className="barcode h-4 w-20 text-white/40" aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
