import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdf-parse'],
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"]
  }
};

export default nextConfig;
