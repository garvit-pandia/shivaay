import type { Metadata } from "next";
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
      <section className="pt-10 pb-20 bg-white">
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
