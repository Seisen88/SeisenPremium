import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't0.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 't1.rbxcdn.com',
      },
    ],
  },
};

export default nextConfig;
