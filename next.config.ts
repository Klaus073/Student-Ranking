import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Optimize images for better performance
  images: {
    unoptimized: false,
  },
  // Enable compression
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
