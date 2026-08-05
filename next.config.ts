import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  outputFileTracingIncludes: {
    "/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
