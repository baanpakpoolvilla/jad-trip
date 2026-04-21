/**
 * Next.js 16 Proxy (เดิมคือ middleware.ts)
 *
 * ทำหน้าที่ refresh Supabase session cookie เมื่อมี NEXT_PUBLIC_SUPABASE_* ตั้งไว้
 * การล็อกอินของแอปยังใช้ NextAuth — ดู src/auth.ts และ layout ของ /organizer, /admin
 *
 * matcher ครอบคลุมเฉพาะ authenticated routes และ API เพื่อลด Supabase round-trip
 * บน public pages (/, /trips, /t/…, /o/…) ที่ไม่ต้องการ session refresh
 *
 * ⚠️  ถ้าสร้าง route ใหม่ภายใต้ /organizer, /admin, หรือ /api/organizer, /api/admin
 *     ต้องเพิ่มการตรวจ auth() ใน layout หรือ route handler ด้วยเสมอ
 *     อย่าพึ่งแค่ proxy นี้เพื่อป้องกันการเข้าถึง
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/organizer/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/admin/:path*",
    "/api/auth/:path*",
    "/api/organizer/:path*",
    "/api/admin/:path*",
    "/login",
    "/register",
    "/post-login",
    "/forgot-password",
    "/reset-password",
  ],
};
