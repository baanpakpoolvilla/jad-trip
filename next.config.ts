import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not bundle Prisma with Turbopack — avoids a stale / mismatched query engine in `next dev`.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
