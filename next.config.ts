import type { NextConfig } from "next";
import { env } from "./lib/env";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Default is [75]. The home hero requests 78 (mobile) and 82 (desktop)
    // via getImageProps, so they must be allowlisted in Next 16.
    qualities: [75, 78, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: env.S3_IMAGE_HOSTNAME,
      },
    ],
  },
  allowedDevOrigins: [
    "ed23-2804-e24-fd5a-9f00-fd13-1c50-6b75-80d7.ngrok-free.app",
  ],
};

export default nextConfig;
