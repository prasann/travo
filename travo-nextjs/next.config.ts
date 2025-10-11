import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static export for offline-first
  trailingSlash: true,
  images: {
    unoptimized: true,  // Required for static export
  },
};

export default nextConfig;
