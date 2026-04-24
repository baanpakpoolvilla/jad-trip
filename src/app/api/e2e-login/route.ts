/**
 * E2E Bypass Login — ใช้กับ Puppeteer / automated testing เท่านั้น
 *
 * POST /api/e2e-login
 * Body: { secret: string, role?: "ORGANIZER" | "ADMIN" }
 *
 * ใช้ AUTH_SECRET เป็น bypass key — ถ้ารู้ AUTH_SECRET แสดงว่ามี server access อยู่แล้ว
 * ถ้าไม่มี AUTH_SECRET — endpoint นี้จะตอบ 404 เสมอ
 */
import { NextRequest, NextResponse } from "next/server";
import { encode } from "@auth/core/jwt";
import { hash } from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";

const COOKIE_NAME_SECURE = "__Secure-authjs.session-token";
const COOKIE_NAME_HTTP = "authjs.session-token";
const SESSION_MAX_AGE = 60 * 60; // 1 ชั่วโมง

export async function POST(req: NextRequest) {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({})) as { secret?: string; role?: string };
  // ผู้เรียกต้องรู้ AUTH_SECRET เพื่อ authenticate
  if (body.secret !== authSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role: Role = body.role === "ADMIN" ? "ADMIN" : "ORGANIZER";
  const email = `e2e-${role.toLowerCase()}@sayhitrip.test`;

  // หา หรือสร้าง test user
  let user = await db.user.findFirst({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: `E2E ${role}`,
        passwordHash: await hash(authSecret, 10),
        role,
        onboardingCompletedAt: new Date(),
      },
    });
  } else if (!user.onboardingCompletedAt) {
    user = await db.user.update({
      where: { id: user.id },
      data: { onboardingCompletedAt: new Date() },
    });
  }

  const isSecure = req.nextUrl.protocol === "https:";
  const cookieName = isSecure ? COOKIE_NAME_SECURE : COOKIE_NAME_HTTP;

  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    secret: authSecret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE,
  });

  const response = NextResponse.json({
    success: true,
    userId: user.id,
    email,
    role,
  });

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
