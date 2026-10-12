import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "http", hostname: "127.0.0.1" }],
  },
  // Hide the floating Next.js dev indicator (the "N" badge)
  devIndicators: false,
};

export default nextConfig;
