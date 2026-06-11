import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-midnight" role="contentinfo">
      <div className="mx-auto max-w-[1280px] px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <Image
            src="/logo.svg"
            alt="Shivaay Logistics"
            width={120}
            height={36}
            className="brightness-110 mb-4"
          />
          <p className="text-text-dim text-sm leading-relaxed">
            Shivaay Logistics is a trusted customs broker and logistics facilitator based in Ludhiana, Punjab. We serve businesses across India with reliable, cost-effective freight solutions.
          </p>
        </div>
        <div>
          <h4 className="font-display text-white text-sm font-semibold mb-3 uppercase tracking-wide">Quick Links</h4>
          <ul className="list-none m-0 p-0 space-y-2">
            <li><Link href="/" className="text-text-dim text-sm hover:text-amber transition-colors no-underline">Home</Link></li>
            <li><Link href="/services" className="text-text-dim text-sm hover:text-amber transition-colors no-underline">Services</Link></li>
            <li><Link href="/contact" className="text-text-dim text-sm hover:text-amber transition-colors no-underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-white text-sm font-semibold mb-3 uppercase tracking-wide">Contact Us</h4>
          <ul className="list-none m-0 p-0 space-y-2 text-text-dim text-sm">
            <li>Plot No. 116, Street No. 8, Ganesh Nagar, Ludhiana-141015</li>
            <li><a href="mailto:shivaaylogistics2022@gmail.com" className="text-text-dim hover:text-amber transition-colors no-underline">shivaaylogistics2022@gmail.com</a></li>
            <li><a href="tel:+918847467790" className="text-text-dim hover:text-amber transition-colors no-underline">+91 88474-67790</a></li>
            <li><a href="tel:+919316533756" className="text-text-dim hover:text-amber transition-colors no-underline">+91 93165-33756</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-text-dim text-xs">
        &copy; 2026 Shivaay Logistics. All rights reserved.
      </div>
    </footer>
  );
}
