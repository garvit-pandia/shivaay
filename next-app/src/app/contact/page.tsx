import type { Metadata } from "next";
import Link from "next/link";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactForm } from "@/components/contact/ContactForm";
import { OfficeMap } from "@/components/contact/OfficeMap";

export const metadata: Metadata = {
  title: "Contact Us | Shivaay Logistics",
  description:
    "Get in touch with Shivaay Logistics for customs brokerage and freight forwarding services. Call +91 88474-67790 or visit our office in Ludhiana, Punjab.",
  openGraph: {
    title: "Contact Us | Shivaay Logistics",
    description:
      "Get in touch with Shivaay Logistics for customs brokerage and freight forwarding services. Call +91 88474-67790 or visit our office in Ludhiana, Punjab.",
    type: "website",
    url: "https://shivaaylogistics.com/contact",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-white border-b border-[#ECEDF0] py-16 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0B0F19]">
          Get in Touch
        </h1>
        <p className="text-[#4B5468] text-sm mt-2">
          <Link href="/" className="text-[#4B5468] hover:text-[#1E3A8A] no-underline">Home</Link> / <span>Contact</span>
        </p>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>

      <OfficeMap />

      <section className="py-16 text-center bg-[#1E3A8A] border-y border-white/15" aria-labelledby="contact-cta-heading">
        <h2 id="contact-cta-heading" className="font-display text-2xl sm:text-3xl font-bold text-white">
          Need Immediate Assistance?
        </h2>
        <p className="text-white/85 mt-3 mb-8">Call us now for urgent logistics requirements.</p>
        <a href="tel:+918847467790" className="inline-flex items-center gap-2 btn-on-cobalt px-7 py-3.5 text-base font-bold no-underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Call +91 88474-67790
        </a>
      </section>
    </>
  );
}
