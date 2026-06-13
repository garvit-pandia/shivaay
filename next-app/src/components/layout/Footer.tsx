import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white" role="contentinfo">
      <div className="mx-auto max-w-[1280px] px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <Link href="/" className="font-serif text-xl font-semibold text-ink tracking-tight no-underline">
            Shivaay Logistics
          </Link>
          <p className="text-ink-dim text-sm leading-relaxed mt-3 max-w-xs">
            Pan-India customs clearance and freight forwarding. Trusted by 800+ businesses across Ludhiana, Delhi, Mumbai, and Mundra.
          </p>
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-ink uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="list-none m-0 p-0 space-y-2.5">
            <li><Link href="/" className="text-ink-dim text-sm hover:text-teal transition-colors no-underline">Home</Link></li>
            <li><Link href="/services" className="text-ink-dim text-sm hover:text-teal transition-colors no-underline">Services</Link></li>
            <li><Link href="/contact" className="text-ink-dim text-sm hover:text-teal transition-colors no-underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-ink uppercase tracking-wider mb-4">Contact</h4>
          <ul className="list-none m-0 p-0 space-y-3 text-ink-dim text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={14} className="shrink-0 mt-0.5 text-ink-dim" />
              <span>Mundian Kalan, Ludhiana, Punjab 141015</span>
            </li>
            <li>
              <a href="mailto:shivaaylogistics2022@gmail.com" className="flex items-center gap-2.5 text-ink-dim hover:text-teal transition-colors no-underline">
                <Mail size={14} className="shrink-0" />
                shivaaylogistics2022@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+918847467790" className="flex items-center gap-2.5 text-ink-dim hover:text-teal transition-colors no-underline">
                <Phone size={14} className="shrink-0" />
                +91 88474-67790
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-ink-dim text-xs">
        &copy; {new Date().getFullYear()} Shivaay Logistics. All rights reserved.
      </div>
    </footer>
  );
}
