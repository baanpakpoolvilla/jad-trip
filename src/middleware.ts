/**
 * รีเฟรชเซสชัน Supabase Auth (คุกกี้) เมื่อมี NEXT_PUBLIC_SUPABASE_* ตั้งไว้
 * การล็อกอินของแอปยังใช้ NextAuth — ดู src/auth.ts และ layout ของ /organizer, /admin
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
