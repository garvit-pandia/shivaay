import type { Metadata } from "next";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactForm } from "@/components/contact/ContactForm";
import { OfficeMap } from "@/components/contact/OfficeMap";
import { CTASection } from "@/components/home/CTASection";
import { Faq } from "@/components/faq/Faq";
import { contactFaqs } from "@/lib/data";
import { PageHero } from "@/components/motion/PageHero";
import { TextReveal } from "@/components/motion/TextReveal";

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
      <PageHero
        kicker="Contact · Response within 24h"
        title="Get in touch"
        description="Tell us what you're moving — every inquiry is answered by the same team that clears your cargo."
        ghost="Contact"
        aside={
          <span className="stamp-badge w-32 h-32 text-[11px] text-orange">
            Reply
            <br />
            within 24h
          </span>
        }
      />
      <section className="relative py-16 lg:py-24 bg-cream" aria-label="Contact details and inquiry form">
        <div className="mx-auto max-w-[1280px] px-6 grid lg:grid-cols-2 gap-12">
          <ContactInfo />
          <ContactForm />
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
          <TextReveal
            id="contact-faq-heading"
            className="font-serif text-4xl lg:text-6xl font-medium text-ink leading-[1.05] mb-10"
          >
            Good to know
          </TextReveal>
          <Faq items={contactFaqs} idPrefix="contact-faq" />
        </div>
      </section>
      <CTASection heading="Need immediate assistance?" subtext="Call us directly for urgent customs clearance queries." buttonText="Call +91 88474-67790" buttonHref="tel:+918847467790" />
    </>
  );
}
