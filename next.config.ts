import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ React & build optimizations
  reactStrictMode: true,

  // ⚡️ SWC minify is now default, no need to set explicitly
  // swcMinify: true,  ← removed (deprecated in Next.js 16)

  // ✅ Ignore lint & type errors during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // ✅ Modern image configuration (replaces deprecated `domains`)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kzarre-bucket.s3.amazonaws.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.0.215",
      },
    ],
  },

  // ✅ Expose backend API URL to client
  env: {
    NEXT_PUBLIC_BACKEND_API_URL: process.env.BACKEND_API_URL,
  },

  // ✅ Experimental section cleaned (no invalid keys)
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // ✅ Optional headers for local CORS (replaces `allowedDevOrigins`)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS, PATCH" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
