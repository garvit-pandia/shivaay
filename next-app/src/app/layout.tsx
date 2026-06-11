import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { companyInfo } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${companyInfo.name} | ${companyInfo.tagline} | Ludhiana`,
  description:
    "Shivaay Logistics provides customs clearance, freight forwarding, and logistics solutions across India. Serving Ludhiana, Delhi, Mumbai, Amritsar, and Mundra.",
  openGraph: {
    title: `${companyInfo.name} | ${companyInfo.tagline} | Ludhiana`,
    description:
      "Customs clearance, freight forwarding, and logistics solutions across India.",
    type: "website",
    siteName: companyInfo.name,
    url: "https://shivaaylogistics.com/",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "theme-color": "#070B14",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <meta name="theme-color" content="#070B14" />
      </head>
      <body className="min-h-screen bg-midnight text-text antialiased overflow-x-hidden">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <ScrollReveal />
      </body>
    </html>
  );
}
