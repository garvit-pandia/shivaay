import { HeroSection } from "@/components/home/HeroSection";
import { NetworkMapSection } from "@/components/home/NetworkMapSection";
import { ServiceTags } from "@/components/home/ServiceTags";
import { WhyPartnerSection } from "@/components/home/WhyPartnerSection";
import { MissionSection } from "@/components/home/MissionSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { companyInfo, contactInfo } from "@/lib/data";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Shivaay Logistics",
  description: companyInfo.description,
  url: "https://shivaaylogistics.com",
  telephone: [companyInfo.phone, companyInfo.whatsapp],
  email: contactInfo.email,
  address: contactInfo.address,
  openingHours: "Mo-Sa 09:00-19:00",
  areaServed: {
    "@type": "Country",
    name: "India",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <HeroSection />
      <NetworkMapSection />
      <ServiceTags />
      <WhyPartnerSection />
      <MissionSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
