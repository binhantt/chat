import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/faq", "/about", "/terms", "/privacy"],
        disallow: ["/admin", "/api", "/_next/"],
        crawlDelay: 2,
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/login", "/faq", "/about", "/terms", "/privacy"],
        disallow: ["/admin", "/api", "/_next/"],
        crawlDelay: 1,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
