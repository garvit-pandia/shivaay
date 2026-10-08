import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://www.shivaaylogistics.in";

const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/contact", priority: 0.9 },
  { path: "/resources", priority: 0.7 },
  { path: "/resources/documents", priority: 0.6 },
  { path: "/resources/files", priority: 0.6 },
  { path: "/resources/links", priority: 0.6 },
  { path: "/resources/ports", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority }) => ({
    url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
