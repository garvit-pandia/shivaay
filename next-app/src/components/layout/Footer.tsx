import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-[#ECEDF0] bg-white" role="contentinfo">
      <div className="mx-auto max-w-[1280px] px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <Image
            src="/logo.svg"
            alt="Shivaay Logistics"
            width={120}
            height={36}
            className="brightness-110 mb-4"
          />
          <p className="text-[#4B5468] text-sm leading-relaxed">
            Shivaay Logistics is a trusted customs broker and logistics facilitator based in Ludhiana, Punjab. We serve businesses across India with reliable, cost-effective freight solutions.
          </p>
        </div>
        <div>
          <h4 className="font-display text-[#0B0F19] text-sm font-semibold mb-3 uppercase tracking-wide">Quick Links</h4>
          <ul className="list-none m-0 p-0 space-y-2">
            <li><Link href="/" className="text-[#4B5468] text-sm hover:text-[#1E3A8A] transition-colors no-underline">Home</Link></li>
            <li><Link href="/services" className="text-[#4B5468] text-sm hover:text-[#1E3A8A] transition-colors no-underline">Services</Link></li>
            <li><Link href="/contact" className="text-[#4B5468] text-sm hover:text-[#1E3A8A] transition-colors no-underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-[#0B0F19] text-sm font-semibold mb-3 uppercase tracking-wide">Contact Us</h4>
          <ul className="list-none m-0 p-0 space-y-2 text-[#4B5468] text-sm">
            <li>Plot No. 116, Street No. 8, Ganesh Nagar, Ludhiana-141015</li>
            <li><a href="mailto:shivaaylogistics2022@gmail.com" className="text-[#4B5468] hover:text-[#1E3A8A] transition-colors no-underline">shivaaylogistics2022@gmail.com</a></li>
            <li><a href="tel:+918847467790" className="text-[#4B5468] hover:text-[#1E3A8A] transition-colors no-underline">+91 88474-67790</a></li>
            <li><a href="tel:+919316533756" className="text-[#4B5468] hover:text-[#1E3A8A] transition-colors no-underline">+91 93165-33756</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#ECEDF0] py-5 text-center text-[#4B5468] text-xs">
        &copy; 2026 Shivaay Logistics. All rights reserved.
      </div>
    </footer>
  );
}
