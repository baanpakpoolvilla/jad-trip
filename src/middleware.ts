/**
 * รีเฟรชเซสชัน Supabase Auth (คุกกี้) เมื่อมี NEXT_PUBLIC_SUPABASE_* ตั้งไว้
 * การล็อกอินของแอปยังใช้ NextAuth — ดู src/auth.ts และ layout ของ /organizer, /admin
 *
 * matcher ครอบคลุมเฉพาะ authenticated routes และ API เพื่อลด Supabase round-trip
 * บน public pages (/, /trips, /t/…, /o/…) ที่ไม่ต้องการ session refresh
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/organizer/:path*",
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
