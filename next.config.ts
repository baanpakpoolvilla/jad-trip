import type { NextConfig } from "next";

// Auth.js requires a non-empty secret in deployed environments; missing it
// surfaces as GET /api/auth/session → 500 "server configuration" at runtime.
if (process.env.VERCEL === "1") {
  const secret =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "Set AUTH_SECRET (or NEXTAUTH_SECRET) in Vercel → Project → Settings → Environment Variables for Production and Preview. Generate one with: openssl rand -base64 32"
    );
  }
}

const nextConfig: NextConfig = {
  // Do not bundle Prisma with Turbopack — avoids a stale / mismatched query engine in `next dev`.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
