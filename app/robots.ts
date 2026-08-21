import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
    ],
    sitemap: "https://sarthakeai.com/sitemap.xml",
    host: "https://sarthakeai.com",
  };
}
