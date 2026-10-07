import type { Metadata } from "next";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactForm } from "@/components/contact/ContactForm";
import { OfficeMap } from "@/components/contact/OfficeMap";
import { CTASection } from "@/components/home/CTASection";
import { Faq } from "@/components/faq/Faq";
import { contactFaqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us | Shivaay Logistics",
  description:
    "Get in touch with Shivaay Logistics for customs brokerage and freight forwarding services. Call +91 88474-67790 or visit our office in Ludhiana, Punjab.",
  openGraph: {
    title: "Contact Us | Shivaay Logistics",
    description:
      "Get in touch with Shivaay Logistics for customs brokerage and freight forwarding services. Call +91 88474-67790 or visit our office in Ludhiana, Punjab.",
    type: "website",
    url: "https://www.shivaaylogistics.in/contact",
  },
  twitter: { card: "summary_large_image" },
};

export default function ContactPage() {
  return (
    <>
      <section className="relative pt-16 pb-20 bg-cream overflow-hidden">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-6">
          <p className="mono-label text-[11px] text-teal mb-4">
            Contact · Response within 24h
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-12">
            Get in touch
          </h1>
          <div className="grid lg:grid-cols-2 gap-12">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>

      <OfficeMap />
      <section
        className="py-24 bg-cream border-t border-border"
        aria-labelledby="contact-faq-heading"
      >
        <div className="mx-auto max-w-[1280px] px-6">
          <p className="mono-label text-[11px] text-teal mb-4">
            Questions · Answered upfront
          </p>
          <h2
            id="contact-faq-heading"
            className="font-serif text-3xl lg:text-4xl font-medium text-ink mb-10"
          >
            Good to know
          </h2>
          <Faq items={contactFaqs} idPrefix="contact-faq" />
        </div>
      </section>
      <CTASection heading="Need immediate assistance?" subtext="Call us directly for urgent customs clearance queries." buttonText="Call +91 88474-67790" buttonHref="tel:+918847467790" />
    </>
  );
}
