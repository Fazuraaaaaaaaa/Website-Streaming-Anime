import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['cheerio', 'yt-search'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
