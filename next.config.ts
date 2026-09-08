import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/about/page",
        destination: "/#about",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/#about",
        permanent: true,
      },
      {
        source: "/work/xiaomi-13-pro-review/page",
        destination: "/work/xiaomi-13-pro-review",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
