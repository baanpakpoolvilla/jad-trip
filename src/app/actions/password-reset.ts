"use server";

import { createHash, randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { isMailConfigured, sendTransactionalEmail } from "@/lib/mail";

const TOKEN_BYTES = 32;
const EXPIRY_MINUTES = 60;

function hashToken(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

function appBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

const genericSentMessage =
  "หากอีเมลนี้มีบัญชีในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว กรุณาตรวจสอบกล่องจดหมาย (รวมถึงโฟลเดอร์สแปม)";

export type RequestPasswordResetState = { error?: string } | { ok: true; message: string };

export async function requestPasswordReset(
  _prev: RequestPasswordResetState | null,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { error: "กรุณากรอกอีเมลให้ถูกต้อง" };
  }

  if (!isMailConfigured()) {
    return { error: "ระบบส่งอีเมลยังไม่ได้ตั้งค่า โปรดติดต่อผู้ดูแลระบบ" };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data } });
  if (!user) {
    return { ok: true, message: genericSentMessage };
  }

  const plain = randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashToken(plain);
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const row = await db.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const link = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(plain)}`;

  try {
    await sendTransactionalEmail({
      to: user.email,
      subject: "รีเซ็ตรหัสผ่าน Just Trip",
      text: `คุณสามารถรีเซ็ตรหัสผ่านได้โดยเปิดลิงก์นี้ (ใช้ได้ภายใน ${EXPIRY_MINUTES} นาที):\n\n${link}\n\nหากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน ให้ละเลยอีเมลนี้`,
      html: `<p>คุณสามารถรีเซ็ตรหัสผ่านได้โดยคลิกลิงก์ด้านล่าง (ใช้ได้ภายใน <strong>${EXPIRY_MINUTES} นาที</strong>):</p><p><a href="${link}">รีเซ็ตรหัสผ่าน</a></p><p style="word-break:break-all;font-size:12px;color:#666">${link}</p><p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน ให้ละเลยอีเมลนี้</p>`,
    });
  } catch (err) {
    console.error("password reset email", err);
    await db.passwordResetToken.delete({ where: { id: row.id } }).catch(() => {});
    return { error: "ส่งอีเมลไม่สำเร็จ โปรดลองใหม่ภายหลัง" };
  }

  return { ok: true, message: genericSentMessage };
}

export type CompletePasswordResetState = { error: string } | null;

export async function completePasswordReset(
  _prev: CompletePasswordResetState | null,
  formData: FormData,
): Promise<CompletePasswordResetState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password !== passwordConfirm) {
    return { error: "รหัสผ่านยืนยันไม่ตรงกัน" };
  }

  const parsed = z
    .object({
      token: z.string().min(16, "ลิงก์ไม่ถูกต้อง"),
      password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัว"),
    })
    .safeParse({ token, password });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const tokenHash = hashToken(parsed.data.token);
  const row = await db.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!row || row.expiresAt.getTime() < Date.now()) {
    return { error: "ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่จากหน้าลืมรหัสผ่าน" };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await db.$transaction([
    db.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  redirect("/login?reset=1");
}
