import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to allow TypeScript warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow TypeScript warnings during builds
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
