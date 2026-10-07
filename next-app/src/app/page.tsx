import { HeroSection } from "@/components/home/HeroSection";
import { StatsMarquee } from "@/components/home/StatsMarquee";
import { ServiceStack } from "@/components/home/ServiceStack";
import { RouteJourney } from "@/components/home/RouteJourney";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
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
  url: "https://www.shivaaylogistics.in",
  telephone: [companyInfo.phone, companyInfo.whatsapp],
  email: contactInfo.email,
  address: contactInfo.address,
  openingHours: "Mo-Sa 09:00-19:00",
  areaServed: { "@type": "Country", name: "India" },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HeroSection />
      <StatsMarquee />
      <ServiceStack />
      <RouteJourney />
      <ProcessTimeline />
      <WhyPartnerSection />
      <MissionSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
