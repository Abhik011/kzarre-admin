import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ React & build optimizations
  reactStrictMode: true,
  swcMinify: true,

  // ✅ Allow LAN and localhost access during development
  experimental: {
    allowedDevOrigins: [
      "http://localhost:3000",      // Local dev
      "http://192.168.0.215:3000",  // Your LAN IP
      "http://192.168.0.110:3000",  // Optional alternate IP
    ],
  },

  // ✅ Ignore lint errors during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // ✅ Allow optimized images from AWS or local
  images: {
    domains: [
      "kzarre-bucket.s3.amazonaws.com", // your AWS bucket
      "localhost",
      "192.168.0.215",
    ],
  },

  // ✅ NEW: Expose backend API URL to the browser
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
};

export default nextConfig;
