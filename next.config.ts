import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental: {
  //   ppr: true,
  //   reactCompiler: true,
  // },
  images: {
    remotePatterns: [
      { hostname: "*.r2.cloudflarestorage.com" },
      { hostname: "*.vercel-storage.com" },
      { hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
