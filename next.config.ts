import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Restart trigger: 2026-06-20 19:10
  reactStrictMode: true,
  output: "standalone",
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
