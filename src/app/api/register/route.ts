import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

function prismaFriendlyMessage(err: unknown): string | undefined {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2021") {
      return "ฐานข้อมูลยังไม่มีตารางที่แอปต้องการ — จากเครื่องที่มี DIRECT_URL ให้รัน `npx prisma db push` ชี้ไป Supabase แล้วลองลงทะเบียนใหม่";
    }
    if (err.code === "P1001" || err.code === "P1000" || err.code === "P1017") {
      return "เชื่อม PostgreSQL ไม่ได้ — ตรวจสอบ DATABASE_URL / DIRECT_URL บน Vercel และรหัสผ่านใน connection string ของ Supabase";
    }
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "PrismaClientInitializationError"
  ) {
    return "เชื่อมฐานข้อมูลไม่ได้ — ตั้ง DATABASE_URL (และ DIRECT_URL) บน Vercel ให้ตรง Supabase; ถ้าใช้ pooler ให้ใส่พารามิเตอร์ตามที่ Supabase แนะนำ";
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    try {
      const exists = await db.user.findUnique({ where: { email } });
      if (exists) {
        return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
      }

      await db.user.create({
        data: {
          email,
          name: parsed.data.name.trim(),
          passwordHash: await hash(parsed.data.password, 12),
          role: Role.ORGANIZER,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
      }
      const hint = prismaFriendlyMessage(err);
      console.error("[api/register]", err);
      return NextResponse.json(
        {
          error:
            hint ??
            "ไม่สามารถสร้างบัญชีได้ในขณะนี้ โปรดลองใหม่ภายหลัง (ดู Vercel → Logs → /api/register)",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/register] fatal", err);
    return NextResponse.json(
      {
        error:
          "เซิร์ฟเวอร์ผิดพลาด โปรดลองใหม่ภายหลัง (ตรวจสอบ Vercel Logs ถ้ายังไม่หาย)",
      },
      { status: 500 },
    );
  }
}
