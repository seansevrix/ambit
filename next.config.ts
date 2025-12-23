import type { NextConfig } from "next";

const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:5001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/engine/:path*",
        destination: `${ENGINE_URL}/engine/:path*`,
      },
    ];
  },
};

export default nextConfig;
