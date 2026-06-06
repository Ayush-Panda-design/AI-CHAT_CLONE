import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com", "res.cloudinary.com"],
  },
  experimental: { 
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
