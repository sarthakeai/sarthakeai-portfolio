import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/work", priority: 0.9 },
    { path: "/work/short-form-video", priority: 0.8 },
    { path: "/work/21st-capital-introduction", priority: 0.8 },
    { path: "/work/xiaomi-13-pro-review", priority: 0.8 },
    { path: "/work/21st-capital-interview", priority: 0.8 },
  ];

  return routes.map(({ path, priority }) => ({
    url: new URL(path, "https://sarthakeai.com").href,
    changeFrequency: "monthly" as const,
    priority,
  }));
}
