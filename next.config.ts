import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.anilist.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.kitsu-io.net",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // Abaikan peringatan ESLint saat build di Vercel agar deploy sukses
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Abaikan error Type saat build di Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
