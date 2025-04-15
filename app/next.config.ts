import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
    output: 'standalone',
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
            pathname: '**',
          },
          {
            protocol: 'https',
            hostname: 'encrypted-tbn0.gstatic.com',
            pathname: '**',
          },
      ],
      },
};

export default nextConfig;
