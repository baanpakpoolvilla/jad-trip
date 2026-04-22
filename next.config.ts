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

  // AUTH_URL กำหนด canonical URL ของ app — ป้องกัน open redirect จาก Host header ที่ปลอม
  // ตรวจเฉพาะตอน build จริงบน Vercel (VERCEL_URL จะมีค่า) ไม่ตรวจ local build
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_URL?.trim()) {
    const authUrl = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
    if (!authUrl) {
      throw new Error(
        "Set AUTH_URL (e.g. https://yourdomain.com) in Vercel → Project → Settings → Environment Variables for Production. This locks the Auth.js callback URL and prevents open-redirect via forged Host headers."
      );
    }
  }
}

const securityHeaders = [
  // ป้องกัน Clickjacking — ไม่ให้ embed เป็น iframe จากโดเมนอื่น
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // ป้องกัน MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // ลด referrer ที่ส่งออกไปให้เหลือแค่ origin เมื่อข้ามโดเมน
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // อนุญาตเฉพาะ feature ที่จำเป็น
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content-Security-Policy — ป้องกัน XSS
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + scripts จาก self เท่านั้น
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // styles จาก self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // รูปภาพจาก self + Supabase Storage + data URI
      "img-src 'self' data: blob: https://*.supabase.co",
      // fonts จาก self
      "font-src 'self' data:",
      // API calls ไปได้เฉพาะ self + Supabase
      "connect-src 'self' https://*.supabase.co",
      // form ส่งไปได้เฉพาะ self
      "form-action 'self'",
      // ป้องกัน Clickjacking ซ้ำในระดับ CSP
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Do not bundle Prisma with Turbopack — avoids a stale / mismatched query engine in `next dev`.
  serverExternalPackages: ["@prisma/client", "prisma"],

  experimental: {
    // Next.js treats any multipart POST as a "possible server action" and enforces
    // the serverActions.bodySizeLimit (default 1 MB) before the request reaches the
    // Route Handler.  The /api/admin/site-images handler allows up to 2 MB, so we
    // raise the limit to match — server-side validation still rejects anything > 2 MB.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  images: {
    remotePatterns: [
      // Supabase Storage — trip images
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase Storage — signed URLs (private slip bucket)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
    // เปิด modern formats (WebP / AVIF) เพื่อลดขนาดไฟล์
    formats: ["image/avif", "image/webp"],
  },

  // Gzip/Brotli compression สำหรับ HTML + JSON responses
  compress: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
