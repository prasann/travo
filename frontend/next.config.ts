import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' - using dynamic rendering with IndexedDB
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
