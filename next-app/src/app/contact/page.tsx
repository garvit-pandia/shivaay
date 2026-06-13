import type { Metadata } from "next";
import Link from "next/link";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactForm } from "@/components/contact/ContactForm";
import { OfficeMap } from "@/components/contact/OfficeMap";
import { CTASection } from "@/components/home/CTASection";

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
  twitter: { card: "summary_large_image" },
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-white pt-20 pb-12">
        <div className="mx-auto max-w-[1280px] px-6 text-center">
          <p className="text-sm text-ink-dim mb-3">
            <Link href="/" className="text-ink-dim hover:text-teal transition-colors no-underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">Contact</span>
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium text-ink">Get in touch</h1>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 grid lg:grid-cols-2 gap-12">
          <ContactInfo />
          <ContactForm />
        </div>
      </section>

      <OfficeMap />
      <CTASection heading="Need immediate assistance?" subtext="Call us directly for urgent customs clearance queries." buttonText="Call +91 88474-67790" buttonHref="tel:+918847467790" />
    </>
  );
}
