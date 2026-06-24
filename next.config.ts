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
  allowedDevOrigins: env.NGROK_URL
    ? [new URL(env.NGROK_URL).hostname]
    : undefined,
};

export default nextConfig;
