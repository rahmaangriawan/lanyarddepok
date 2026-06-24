import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/kawruh/", "/login/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
