import { HeroSection } from "@/components/home/HeroSection";
import { ServiceTags } from "@/components/home/ServiceTags";
import { WhyPartnerSection } from "@/components/home/WhyPartnerSection";
import { MissionSection } from "@/components/home/MissionSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { cities, companyInfo, contactInfo, services } from "@/lib/data";

const SITE_URL = "https://www.shivaaylogistics.in";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#business`,
      name: companyInfo.name,
      description: companyInfo.description,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      image: `${SITE_URL}/opengraph-image.png`,
      telephone: companyInfo.phone,
      email: contactInfo.email,
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "Plot No. 116, Street No. 8, Ganesh Nagar, 33 Feet Road, Near Ashiana Enclave, Mundian Kalan",
        addressLocality: "Ludhiana",
        addressRegion: "Punjab",
        postalCode: "141015",
        addressCountry: "IN",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
      areaServed: [
        { "@type": "Country", name: "India" },
        ...Object.values(cities).map((city) => ({ "@type": "City", name: city.name })),
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Logistics services",
        itemListElement: ["Customs Clearance", ...services.map((service) => service.title)].map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: companyInfo.name,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#business` },
      creator: {
        "@type": "Person",
        name: "Garvit Pandia",
        email: "garvit@shivaaylogistics.in",
        jobTitle: "Engineer & Designer",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HeroSection />
      <ServiceTags />
      <WhyPartnerSection />
      <MissionSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
