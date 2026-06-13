import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { companyInfo } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
    "theme-color": "#FFFFFF",
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
      className={`${inter.variable} ${playfair.variable}`}
    >
      <head>
        <meta name="theme-color" content="#FFFFFF" />
      </head>
      <body className="min-h-screen antialiased overflow-x-hidden bg-white text-ink font-sans">
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
