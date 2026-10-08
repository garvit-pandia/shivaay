import type { MetadataRoute } from "next";
import { companyInfo } from "@/lib/data";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${companyInfo.name} | ${companyInfo.tagline}`,
    short_name: companyInfo.name,
    description: companyInfo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
